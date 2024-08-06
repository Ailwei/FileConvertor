const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const path = require('path');
const libreofficeConvert = require('libreoffice-convert');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const XLSX = require('xlsx');
const Grid = require('gridfs-stream');
const {File} = require('../models/File');
const {User} = require('../models/User')
const mongoose = require('mongoose');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const tmp = require('tmp');
const { verifyUser } = require('./user');
const { GridFSBucket } = require('mongodb');
const imagemagick = require('imagemagick');
const { exec } = require('child_process');
const ConversionLog = require('../models/ConversionLog');
const ConvertAPI = require('convertapi')(process.env.CONVERT_API_SECRET);
const Subscription = require('../models/Subscription')



const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

ffmpeg.setFfmpegPath(ffmpegPath)

const conn = mongoose.connection;
let gfsBucket;

conn.once('open', () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
  console.log("GridFSBucket initialized");
});
const checkSubscription = async (req, res, next) => {
  try {
      const userId = req.user.userId;
      console.log('Fetching subscription cfor userId:', userId);

      const subscription = await Subscription.findOne({ userId, status: { $in: ['paid', 'pending'] } })
        .sort({ createdAt: -1 })
        .exec();

      if (!subscription) {
          return res.status(400).json({ error: 'No subscription found' });
      }

      const { plan, status, endDate, conversionCount } = subscription;
      const currentDate = new Date();
      const endTrialDate = new Date(endDate);
      const trialPeriodRemaining = Math.ceil((endTrialDate - currentDate) / (1000 * 60 * 60 * 24));

      if (plan === 'basic' && status !== 'pending') {
          return res.status(401).json({ error: 'No active free-trial subscription found' });
      }

      if ((plan === 'premium' || plan === 'LifeTime') && status !== 'paid') {
          return res.status(402).json({ error: 'No active subscription found' });
      }

      if (plan === 'premium' && trialPeriodRemaining <= 0) {
          return res.status(403).json({ error: 'premium period has expired please your plan' });
      }

      req.subscription = {
          plan: plan,
          conversionCount: conversionCount,
      };

      next();
  } catch (error) {
      console.error('Error checking subscription:', error);
      res.status(500).json({ error: 'Failed to check subscription' });
  }
};

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { originalname, filename, mimetype, size } = req.file;

    const newFile = new ConvertFile({
      filename: filename,
      contentType: mimetype,
      size: size,
      format: path.extname(filename).slice(1)
    });
    await newFile.save();

    res.status(201).json({ message: 'File uploaded successfully', file: newFile });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.post('/convert', verifyUser, checkSubscription, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, buffer, mimetype } = req.file;
    const format = req.body.format;
    let convertedFileName, convertedBuffer;
    const { plan } = req.subscription;

    let conversionLog = await ConversionLog.findOne({ userId: req.user.userId });

    if (!conversionLog) {
      conversionLog = new ConversionLog({
        userId: req.user.userId,
        conversionCount: 0,
      });
    }

    if (plan === 'basic' && conversionLog.conversionCount >= 10) {
      return res.status(402).json({ error: 'Basic plan allows up to 10 conversions' });
    } else if (plan === 'premium' && (format !== 'pdf' && format !== 'doc' && format !== 'png' && format !== 'jpeg')) {
      return res.status(403).json({ error: 'Premium plan only allows document and image conversions' });
    } else if (plan === 'premium' && conversionLog.conversionCount >= 100) {
      return res.status(404).json({ error: 'Premium plan allows up to 100 conversions per month' });
    }
    const tempFile = tmp.fileSync({ postfix: path.extname(originalname) });
    fs.writeFileSync(tempFile.name, buffer);

    try {
      if (mimetype.startsWith('application/pdf') && format === 'docx') {
        convertedFileName = `converted_${originalname.replace(path.extname(originalname), '.docx')}`;
        const result = await ConvertAPI.convert('docx', { File: tempFile.name }, 'pdf');
        convertedBuffer = result.file;
      } else if (mimetype.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document') && format === 'pdf') {
        convertedFileName = `converted_${originalname.replace(path.extname(originalname), '.pdf')}`;
        const result = await ConvertAPI.convert('pdf', { File: tempFile.name }, 'docx');
        convertedBuffer = result.file;
      } else if (mimetype.startsWith('audio/') && format === 'mp3') {
        convertedFileName = `converted_${originalname.replace(path.extname(originalname), '.mp3')}`;
        const result = await ConvertAPI.convert('mp3', { File: tempFile.name }, 'audio');
        convertedBuffer = result.file;
      } else if (mimetype.startsWith('video/') && format === 'mp3') {
        convertedFileName = `converted_${originalname.replace(path.extname(originalname), '.mp3')}`;
        const result = await ConvertAPI.convert('mp3', { File: tempFile.name }, 'video');
        convertedBuffer = result.file;
      } else if (mimetype.startsWith('video/') && format === 'mp4') {
        convertedFileName = `converted_${originalname.replace(path.extname(originalname), '.mp4')}`;
        const result = await ConvertAPI.convert('mp4', { File: tempFile.name }, 'video');
        convertedBuffer = result.file;
      } else if (mimetype.startsWith('text/csv') && format === 'xlsx') {
        convertedFileName = `converted_${originalname.replace(path.extname(originalname), '.xlsx')}`;
        const result = await ConvertAPI.convert('xlsx', { File: tempFile.name }, 'csv');
        convertedBuffer = result.file;
      } else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && format === 'csv') {
        convertedFileName = `converted_${originalname.replace(path.extname(originalname), '.csv')}`;
        const result = await ConvertAPI.convert('csv', { File: tempFile.name }, 'xlsx');
        convertedBuffer = result.file;
      } else if (mimetype.startsWith('image/') && (format === 'png' || format === 'jpeg')) {
        convertedFileName = `converted_${originalname.replace(path.extname(originalname), `.${format}`)}`;
        const result = await ConvertAPI.convert(format, { File: tempFile.name }, 'image');
        convertedBuffer = result.file;
      } else {
        tempFile.removeCallback();
        return res.status(405).json({ error: 'Unsupported conversion format' });
      }
    } catch (error) {
      tempFile.removeCallback();
      console.error('Error during conversion:', error);
      return res.status(500).json({ error: 'Failed to convert file' });
    }

    tempFile.removeCallback();

    const uploadStream = gfsBucket.openUploadStream(convertedFileName, {
      contentType: mimetype,
    });

    const bufferStream = Readable.from(convertedBuffer);
    bufferStream.pipe(uploadStream)
      .on('finish', async () => {
        const filesCollection = mongoose.connection.db.collection('uploads.files');
        const file = await filesCollection.findOne({ filename: convertedFileName });

        if (!file) {
          throw new Error('Failed to retrieve file metadata');
        }

        const newFile = new File({
          originalname: originalname,
          filename: convertedFileName,
          contentType: mimetype,
          size: convertedBuffer.length,
          format: format,
          userId: req.user.userId,
        });
        await newFile.save();

        const conversionLogEntry = new ConversionLog({
          userId: req.user.userId,
          fileType: format,
        });
        await conversionLogEntry.save();

        conversionLog.conversionCount += 1;
        conversionLog.fileType = format;
        await conversionLog.save();

        res.status(200).json({ message: 'File uploaded and converted successfully', file: newFile });
      })
      .on('error', (err) => {
        console.error('Error saving file to GridFS:', err);
        res.status(500).json({ error: 'Failed to save converted file to MongoDB' });
      });
  } catch (error) {
    console.error('Error during conversion:', error);
    res.status(500).json({ error: 'Failed to convert file' });
  }
});
router.get('/files', verifyUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("User ID:", userId);
    const files = await File.find({userId});

    if(!files || files.length === 0) {
      return res.status(404).json({ message: 'No files found for the current user.'})

    }
    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });

  }
});
router.get('/download/:filename', (req, res) => {
  console.log('Received request for file:', req.params.filename);
  const filename = req.params.filename;

  gfsBucket.find({ filename }).toArray((err, files) => {
    if (err) {
      console.error('Error finding file:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!files.length) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];
    const readStream = gfsBucket.openDownloadStreamByName(filename);

    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);

    readStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      res.status(500).json({ error: 'Error streaming file' });
    });

    readStream.pipe(res);
  });
});
router.put('/updatefiles/:filename', verifyUser, async (req, res) => {
  const oldFilename = req.params.filename;
  const { newFilename } = req.body;
  const userId = req.user.userId;

  try {

    if (!gfsBucket) {
      console.error('GridFSBucket not initialized');
      return res.status(500).json({ error: 'Internal server error' });
    }

    
    const file = await File.findOne({ filename: oldFilename, userId });

    if (!file) {
      return res.status(401).json({ message: 'File not found or not authorized' });
    }

    const query = { filename: oldFilename };
    const updateResult = await gfsBucket.find(query).toArray();
    if (updateResult.length === 0) {
      return res.status(402).json({ message: 'File not found' });
    }

    const fileId = updateResult[0]._id;
    await gfsBucket.rename(fileId, newFilename);

  
    file.filename = newFilename;
    await file.save();

    res.status(200).json({ message: 'Filename updated successfully' });
  } catch (err) {
    console.error('Error updating filename:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/delete/:filename', verifyUser, async (req, res) => {
  const filename = req.params.filename;
  const userId = req.user.userId;

  try {
    
    const file = await File.findOne({ filename, userId });

    if (!file) {
      return res.status(403).json({ message: 'File not found or not authorized' });
    }

    
    const filesCollection = mongoose.connection.db.collection('uploads.files');
    const fileDocument = await filesCollection.findOne({ filename });

    if (!fileDocument) {
      return res.status(404).json({ message: 'File not found' });
    }

    await gfsBucket.delete(fileDocument._id);

    await File.deleteOne({ filename, userId });

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = {
  ConvertRouter: router
};
