const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = '/tmp/uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    cb(null, true); 
  },
  limits: {
    fileSize: 1024 * 1024 * 20,
  },
});

module.exports = upload;
