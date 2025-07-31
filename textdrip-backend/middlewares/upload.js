const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const TWO_GB = 2 * 1024 * 1024 * 1024; // 2GB in bytes

// the function to ensure directory exists
function ensureDirectoryExistence(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateTimestamp() {
  return Date.now();
}

const createStorage = (isFileNameOriginal) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath;
      
      switch (file.fieldname) {
        case "UserMedia":
        case "UserMainImage":
          uploadPath = process.env.USER_MEDIA_PATH;
          break;
          case "messageMedia":
            uploadPath = process.env.MESSAGE_MEDIA_PATH;
            break;
        default:
          return cb(new Error("Invalid fieldname"), false);
      }
      
      ensureDirectoryExistence(uploadPath);
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const timestamp = generateTimestamp();
      const extension = path.extname(file.originalname);
      const fileName = isFileNameOriginal ? file.originalname : `${timestamp}${extension}`;
      cb(null, fileName);
    }
  });
};

// const storageForProductMedia = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadPath = process.env.PRODUCT_MEDIA_PATH;
//     ensureDirectoryExistence(uploadPath);
//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     const timestamp = generateTimestamp();
//     const extension = path.extname(file.originalname);
//     cb(null, `${timestamp}${extension}`);
//   },
// });




const storage = createStorage(false);

const uploadSingle = multer({
  storage: storage,
  limits: {
    fileSize: TWO_GB, // limit file size to 2GB
  },
}).single("UserMedia");
var uploadMessageMedia = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = process.env.MESSAGE_MEDIA_PATH;
      ensureDirectoryExistence(uploadPath);
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const extension = path.extname(file.originalname);
      const fileName = `${path.parse(file.originalname).name}_${Date.now()}${extension}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: TWO_GB, // limit file size to 2GB
  },
}).fields([{ name: "messageMedia", maxCount: 10 }]);

module.exports = {
  uploadSingle,
  uploadMessageMedia
};
