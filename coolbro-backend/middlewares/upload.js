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
      if (file.fieldname === "UserMedia") {
        cb(null, process.env.USER_MEDIA_PATH);
      }
      else if (file.fieldname === "UserMainImage") {
        cb(null, process.env.USER_MEDIA_PATH);
      }
      else if (file.fieldname === "CategoryImageURL") {
        cb(null, process.env.CATEGORY_IMAGE_PATH);
      }
      else if (file.fieldname === "BrandImageURL") {
        cb(null, process.env.BRAND_IMAGE_PATH);
      }
      else if (file.fieldname === "documents") {
        cb(null, process.env.UPLOAD_DOCUMENT_PATH);
      }
      else if (file.fieldname === "ProductMainImage") {
        cb(null, process.env.PRODUCT_MEDIA_PATH);
      }
      else if (file.fieldname === "ProductMedia") {
        cb(null, process.env.PRODUCT_MEDIA_PATH);
      }
      else if (file.fieldname === "RatingMedia") {
        cb(null, process.env.RATING_MEDIA_PATH);
      }
      else if (file.fieldname === "UserAirConditionServiceURL") {
        cb(null, process.env.SERVICE_MEDIA_PATH);
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

const storageForProductMedia = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.PRODUCT_MEDIA_PATH);
  },
  filename: function (req, file, cb) {
    console.log(file.originalname);
    const timestamp = generateTimestamp();
    const extension = path.extname(file.originalname);
    let fileName = `${timestamp}${extension}`;
    cb(null, fileName);
  },
});

//use for original filename
const storageWithOriginalName = createStorage(true);
//use to generate new file name 
const storage = createStorage(false);

var uploadMultiple = multer({ storage: storage }).fields([
  { name: 'UserMainImage', maxCount: 1 },
  { name: 'UserMedia', maxCount: 10 },

]);

const uploadProductMedia = multer({ storage: storageForProductMedia }).any();

// var uploadProductMedia = multer({ storage: storage }).fields([
//   { name: 'ProductMainImage', maxCount: 1 },
//   { name: 'ProductMedia', maxCount: 10 }
// ]);

var uploadRatingMedia = multer({ storage: storage }).fields([
  { name: 'RatingMedia', maxCount: 10 }
]);

var uploadSingle = multer({ storage: storage }).single('UserMedia');
var uploadCategory = multer({ storage: storage }).single('CategoryImageURL');
var uploadBrand = multer({ storage: storage }).single('BrandImageURL');
var uploadUserAirConditionService = multer({ storage: storage }).single('UserAirConditionServiceURL');


module.exports = {
  uploadMultiple,
  uploadSingle,
  uploadCategory,
  uploadBrand,
  uploadProductMedia,
  uploadRatingMedia,
  uploadUserAirConditionService
};
