const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const path = require('path');
const libreofficeConvert = require('libreoffice-convert');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const Grid = require('gridfs-stream');
const {File} = require('../models/File');
const {User} = require('../models/User')
const mongoose = require('mongoose');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const { verifyUser } = require('./user');
const { GridFSBucket } = require('mongodb');
const imagemagick = require('imagemagick');
const { exec } = require('child_process');
const ConversionLog = require('../models/ConversionLog');

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
      console.log('Fetching subscription for userId:', userId);

      const subscription = await Subscription.findOne({ userId, status: { $in: ['paid', 'pending'] } })
        .sort({ createdAt: -1 })
        .exec();

      if (!subscription) {
          return res.status(403).json({ error: 'No subscription found' });
      }

      const { plan, status, endDate, conversionCount } = subscription;
      const currentDate = new Date();
      const endTrialDate = new Date(endDate);
      const trialPeriodRemaining = Math.ceil((endTrialDate - currentDate) / (1000 * 60 * 60 * 24));

      if (plan === 'free-trial' && status !== 'pending') {
          return res.status(403).json({ error: 'No active free-trial subscription found' });
      }

      if ((plan === 'basic' || plan === 'premium') && status !== 'paid') {
          return res.status(403).json({ error: 'No active subscription found' });
      }

      if (plan === 'free-trial' && trialPeriodRemaining <= 0) {
          return res.status(403).json({ error: 'Free trial period has expired' });
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
    const { originalname, filename, mimetype, size } = req.file;
    const format = req.body.format;
    let convertedFileName, convertedFilePath;
    const { plan, conversionCount } = req.subscription;
   

    if (plan === 'free-trial' && conversionCount >= 10) {
      return res.status(403).json({ error: 'Free plan allows up to 10 conversions' });
    } else if (plan === 'basic' && (format !== 'pdf' && format !== 'doc' && format !== 'png' && format !== 'jpeg')) {
      return res.status(403).json({ error: 'Basic plan only allows document and image conversions' });
    } else if (plan === 'basic' && conversionCount >= 20) {
      return res.status(403).json({ error: 'Basic plan allows up to 20 conversions per month' });
    } else if (plan === 'premium' && conversionCount === Infinity) {
     
    }

    const inputPath = path.join(__dirname, '../uploads', filename);

    if (mimetype.startsWith('application/pdf') && format === 'docx') {
      convertedFileName = `converted_${path.basename(filename, path.extname(filename))}.docx`;
      convertedFilePath = path.join(__dirname, '../uploads', convertedFileName);

      await new Promise((resolve, reject) => {
        libreofficeConvert.convert(inputPath, format, undefined, (err, done) => {
          if (err) {
            return reject(err);
          }
          fs.writeFileSync(convertedFilePath, done);
          resolve();
        });
      });
    } else if (mimetype.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document') && format === 'pdf') {
      convertedFileName = `converted_${path.basename(filename, path.extname(filename))}.pdf`;
      convertedFilePath = path.join(__dirname, '../uploads', convertedFileName);

      await new Promise((resolve, reject) => {
        libreofficeConvert.convert(inputPath, format, undefined, (err, done) => {
          if (err) {
            return reject(err);
          }
          fs.writeFileSync(convertedFilePath, done);
          resolve();
        });
      });
    } else if (mimetype.startsWith('audio/') && format === 'mp3') {
      convertedFileName = `converted_${path.basename(filename, path.extname(filename))}.mp3`;
      convertedFilePath = path.join(__dirname, '../uploads', convertedFileName);

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .toFormat('mp3')
          .save(convertedFilePath)
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (mimetype.startsWith('video/') && format === 'mp3') {
      convertedFileName = `converted_${path.basename(filename, path.extname(filename))}.mp3`;
      convertedFilePath = path.join(__dirname, '../uploads', convertedFileName);

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .noVideo()
          .audioCodec('libmp3lame')
          .toFormat('mp3')
          .save(convertedFilePath)
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (mimetype.startsWith('video/') && format === 'mp4') {
      convertedFileName = `converted_${path.basename(filename, path.extname(filename))}.mp4`;
      convertedFilePath = path.join(__dirname, '../uploads', convertedFileName);

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .toFormat('mp4')
          .save(convertedFilePath)
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (mimetype.startsWith('image/') && (format === 'png' || format === 'jpeg')) {
      convertedFileName = `converted_${path.basename(filename, path.extname(filename))}.${format}`;
      convertedFilePath = path.join(__dirname, '../uploads', convertedFileName);

      const command = `magick ${inputPath} ${convertedFilePath}`;
      console.log('Executing command:', command);

      await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error converting image: ${error.message}`);
            return reject(error);
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
          resolve();
        });
      });
    } else {
      return res.status(400).json({ error: 'Unsupported conversion format' });
    }

    const readStream = fs.createReadStream(convertedFilePath);
    const uploadStream = gfsBucket.openUploadStream(convertedFileName, {
      contentType: mimetype,
    });

    readStream.pipe(uploadStream)
      .on('finish', async () => {
        await unlinkAsync(inputPath);
        await unlinkAsync(convertedFilePath);
        const filesCollection = mongoose.connection.db.collection('uploads.files');
        const file = await filesCollection.findOne({ filename: convertedFileName });

        if (!file) {
          throw new Error('Failed to retrieve file metadata');
        }

        const newFile = new File({
          originalname: originalname,
          filename: convertedFileName,
          contentType: mimetype,
          size: size,
          format: format,
          userId: req.user.userId,
        });
        await newFile.save();
        const conversionLog = new ConversionLog({
          userId: req.user.userId,
          fileType: format,
        })
        await conversionLog.save();

        res.status(200).json({ message: 'File uploaded and converted successfully', file: newFile });
      })
      .on('error', (err) => {
        console.error('Error saving file to GridFS:', err);
        res.status(500).json({ error: 'Failed to save converted file to MongoDB' });
      });

  } catch (error) {
    console.error('Error converting file:', error);
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
router.get('/download/:filename', verifyUser, (req, res) => {
  const filename = req.params.filename;

  if (!gfsBucket) {
    console.log('Error: GridFS stream not initialized');
    return res.status(500).json({ error: 'Internal server error' });
  }

  gfsBucket.find({ filename }).toArray((err, files) => {
    if (err) {
      console.error('Error finding file:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    console.log(`Downloading file: ${filename}`);

    const readstream = gfsBucket.openDownloadStreamByName(filename);

    res.set('Content-Type', files[0].contentType);
    res.set('Content-Disposition', `attachment; filename="${files[0].filename}"`);

    readstream.on('error', (err) => {
      console.error('Error streaming file:', err);
      res.status(500).json({ error: 'Error streaming file' });
    });

    readstream.on('data', (chunk) => {
      console.log(`Downloading ${chunk.length} bytes...`);
    });

    readstream.on('end', () => {
      console.log('File download complete.');
    });

    readstream.pipe(res);
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
      return res.status(404).json({ message: 'File not found or not authorized' });
    }

    const query = { filename: oldFilename };
    const updateResult = await gfsBucket.find(query).toArray();
    if (updateResult.length === 0) {
      return res.status(404).json({ message: 'File not found in GridFS' });
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
      return res.status(404).json({ message: 'File not found or not authorized' });
    }

    
    const filesCollection = mongoose.connection.db.collection('uploads.files');
    const fileDocument = await filesCollection.findOne({ filename });

    if (!fileDocument) {
      return res.status(404).json({ message: 'File not found in GridFS' });
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
