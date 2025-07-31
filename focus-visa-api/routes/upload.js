const express = require('express');
const router = express.Router();
const Upload = require('../models/Upload')
const PdfUpload = require('../models/PdfUpload')
var fetchUser = require('../middlewares/fetchUser')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PDFGenerator = require('pdfkit')
const fs = require('fs')
const multer =require('multer')
var ejs= require('ejs');
var path = require('path');
var pdf= require ('html-pdf');
// var url= { fileURLToPath } from 'url';
var url = require('url');
// req { dirname } from 'path';






const storage =  multer.diskStorage({
  // limits:{
  //   fileSize:200000000,
  // },
  // fileFilter: function(req,file,cb){
  //   console.log(file.originalname)
  //   if(!file.originalname.match(/\.(jpg|png|JPG\PNG|JPEG|jpeg)$/))
  //   return cb(new Error('This is not  a correct format of file'))
  //   cb(undefined,true)
  // },

  destination: function (req, file, cb) {
  
    if (file.fieldname === "image") {
      let dir = "public/images";
      cb(null, dir);
    } else if (file.fieldname === "document") {
      let dir = "public/documents";
      cb(null, dir);
  }
},
  filename: function (req, file, cb) {
    cb(null, file.originalname);
    // console.log("vivek",process.env.Image_path+file.originalname)
  },
  
});


var upload = multer({ storage: storage });
router.post('/image',fetchUser,upload.any(), async (req,res)=>{
  user = await Upload.create({
    image:  req.files[0].filename
  
})
res.json({
  statuscode: 200,
  status: "success",
 data: {image:user}
});
 

},(err,req,res,next)=>res.status(404).send({message:err}))

router.post('/document',fetchUser,upload.any(), async (req,res)=>{
  user = await PdfUpload.create({
    document:  req.files[0].filename
  
})
res.json({
  statuscode: 200,
  status: "success",
 data: {document:user}
});
 

},(err,req,res,next)=>res.status(404).send({message:err}))



// const filename = url.fileURLToPath(import.meta.url);

// const dirname = path.dirname(filename);
const data=
[{"name":"Vivek"},{"address":"Alld"}]

router.post("/generate-pdf", async (req, res) => {
  try{
    // const users=await User.find({is_admin:0});
const filePathName =path.resolve('pdf.ejs','../views/pdf.ejs');
console.log(filePathName)
   const htmlString=fs.readFileSync(filePathName).toString();
   let options={
    format:'potrait'
   }
   const ejsData=ejs.render(htmlString,data);
   pdf.create(ejsData,options).toFile('public/pdf/users.pdf',(err,response)=>{
if(err)
return console.log(err);
res.json({
  statuscode: 200,
  status: "success",
  data:process.env.Pdf_path+"users.pdf"
});
return console.log("file downloaded")
   })
 }
 catch(error){
 console.log(error.message)}
  });

module.exports = router