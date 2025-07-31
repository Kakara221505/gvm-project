const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
        case "brandImage":
          uploadPath = process.env.BRAND_IMAGE_PATH;
          break;
        case "ProductMainImage":
        case "ProductMedia":
          uploadPath = process.env.PRODUCT_MEDIA_PATH;
          break;
        case "CategoryImageURL":
          uploadPath = process.env.CATEGORY_IMAGE_PATH;
          break;
          case "SubCategoryImageUrl":
            uploadPath = process.env.SUB_CATEGORY_IMAGE_PATH;
            break;
            case "RatingMedia":
              uploadPath = process.env.RATING_MEDIA_PATH;
              break;
              case "bannerImage":
                uploadPath = process.env.BANNER_MEDIA_PATH;
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

const storageForProductMedia = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.PRODUCT_MEDIA_PATH;
    ensureDirectoryExistence(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const timestamp = generateTimestamp();
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}${extension}`);
  },
});

const storage = createStorage(false);

const uploadSingle = multer({ storage: storage }).single('UserMedia');
const uploadCategory = multer({ storage: storage }).single('CategoryImageURL');
const uploadSubCategory = multer({ storage: storage }).single('SubCategoryImageUrl');
const brandImage = multer({ storage: storage }).single('brandImage');
const uploadBannerImage = multer({ storage: storage }).single('bannerImage');
var uploadRatingMedia = multer({ storage: storage }).fields([
  { name: 'RatingMedia', maxCount: 10 }
]);
const uploadProductMedia = multer({ storage: storageForProductMedia }).any();

module.exports = {
  uploadSingle,
  uploadProductMedia,
  uploadCategory,
  brandImage,
  uploadSubCategory,
  uploadRatingMedia,
  uploadBannerImage
};
