const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    
    cb(null, true); 
  },
  limits: {
    fileSize: 1 * 1024 * 1024 * 1024, 
  },
});

module.exports = upload;
