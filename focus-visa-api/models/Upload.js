const mongoose = require('mongoose') ;
const { Schema } = mongoose;

const uploadSchema = new Schema({
image:{
    type:String
},

},
{
    timestamps:true
});
const Upload = mongoose.model('upload', uploadSchema);

module.exports = Upload