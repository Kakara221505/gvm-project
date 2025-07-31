const mongoose = require('mongoose') ;
const { Schema } = mongoose;

const pdfuploadSchema = new Schema({
document:{
    type:String
},

},
{
    timestamps:true
});
const Upload = mongoose.model('pdfUpload', pdfuploadSchema);

module.exports = Upload