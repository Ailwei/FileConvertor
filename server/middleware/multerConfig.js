const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|docx|xlsx|csv|png|jpeg|mp3|mp4|mov|mkv|avi|wmv|ogv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  },
  limits: {
    fileSize: 1 * 1024 * 1024 * 1024,
  },
});

module.exports = upload;
