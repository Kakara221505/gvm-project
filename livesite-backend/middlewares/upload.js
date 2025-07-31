const express = require('express');
const multer = require('multer');
const path = require('path');

function generateTimestamp() {
  const date = new Date();
  const timestamp = date.getTime();
  return timestamp;
}

const createStorage = (isFileNameOriginal) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      if (file.fieldname === "ProjectMedia") {
        cb(null, process.env.PROJECT_FILE_PATH);
      }
      else if (file.fieldname === "ProfileMedia") {
        cb(null, process.env.PROFILE_IMAGE_PATH);
      }
      else if (file.fieldname === "BackgroundMedia") {
        cb(null, process.env.BACKGROUND_IMAGE_PATH);
      }
     
    },
    filename: function (req, file, cb) {
      const timestamp = generateTimestamp();
      const extension = path.extname(file.originalname);
      let fileName;

      if (isFileNameOriginal) {
        fileName = file.originalname;
      } else {
        fileName = `${timestamp}${extension}`;
      }

      cb(null, fileName);
    }
  });
};

//use for original filename
const storageWithOriginalName = createStorage(true);
//use to generate new file name 
const storage = createStorage(false);

// var uploadMultiple = multer({ storage: storage }).fields([
//   { name: 'UserMedia', maxCount: 6 },
//   // { name: 'documents', maxCount: 10 }
// ]);

// var uploadProductMedia = multer({ storage: storage }).fields([
//   { name: 'ProductMainImage', maxCount: 1 },
//   { name: 'ProductMedia', maxCount: 10 }
// ]);

var uploadSingle = multer({ storage: storage }).single('ProjectMedia');
var uploadSingleProfile = multer({ storage: storage }).single('ProfileMedia');
var uploadSingleBackGround = multer({ storage: storage }).single('BackgroundMedia');


module.exports = {
  uploadSingle,
  uploadSingleProfile,
  uploadSingleBackGround
};
