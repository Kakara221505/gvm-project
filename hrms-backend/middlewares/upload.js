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
      if (file.fieldname === "EmployeeMedia") {
        cb(null, process.env.EMPLOYEE_MEDIA_PATH);
      } else if (file.fieldname === "ExcelFile") {
        cb(null, process.env.EXCEL_UPLOAD_PATH); 
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

// var uploadMultiple = multer({ storage: storage }).fields([
//   { name: 'EmployeeMedia', maxCount: 1 },

// ]);

// const uploadProductMedia = multer({ storage: storageForProductMedia }).any();

// var uploadProductMedia = multer({ storage: storage }).fields([
//   { name: 'ProductMainImage', maxCount: 1 },
//   { name: 'ProductMedia', maxCount: 10 }
// ]);

// Middleware for Excel file upload
const uploadExcel = multer({
  storage: createStorage(false, process.env.EXCEL_UPLOAD_PATH),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed!"), false);
    }
  }
}).single('ExcelFile');



var uploadSingle = multer({ storage: storage }).single('EmployeeMedia');



module.exports = {
  uploadSingle,
  uploadExcel
};
