const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDirectory = path.join(__dirname, '../../src/uploads');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer(
  {
    storage: storage,
    limits: {
      fileSize: 1 * 1024 * 1024 // 1Mb
    },
    fileFilter: (req, file, cb) => {
      const acceptedExtensionsList = [".jpg", ".jpeg", ".png"];
      const extname = path.extname(file.originalname).toLowerCase();
      if (acceptedExtensionsList.includes(extname)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file extension"));
      }
    }
  });

module.exports = upload;
