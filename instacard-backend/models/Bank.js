const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bankSchema = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    account_holder_name: {
        type: String
    },
    account_number: {
        type: String,
       
    },
    bank_name: {
        type: String
    },
    ifcs_code: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Bank', bankSchema);