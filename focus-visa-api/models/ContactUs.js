const mongoose = require('mongoose') ;
const { Schema } = mongoose;

const contactSchema = new Schema({
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
        required: true
    },
    subject:{
         type: String,
    },
    message:{
        type: Date,
        default:Date.now
    },
    date:{
        type: Date,
        default:Date.now
    }
    // isEmailverfied:{
    //     type:Boolean,
    //     default:false
    // },
    // emailVerfiedAt:{
    //     type:Date,
    //     default:null

    // }
});
const Contact = mongoose.model('auth', contactSchema);

module.exports = Contact