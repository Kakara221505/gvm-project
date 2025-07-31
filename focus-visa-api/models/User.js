const mongoose = require('mongoose') ;
const { Schema } = mongoose;

const authSchema = new Schema({
    fullName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    mobileNo:{
        type: Number,
        
    },
    password:{
         type: String,
    },
    date:{
        type: Date,
        default:Date.now
    },
    isEmailverfied:{
        type:Boolean,
        default:false
    },
    emailVerfiedAt:{
        type:Date,
        default:null

    }
});
const Auth = mongoose.model('auth', authSchema);

module.exports = Auth