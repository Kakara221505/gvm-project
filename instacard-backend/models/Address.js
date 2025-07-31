const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    nick_name: { type: String },
    company_name: { type: String },
    GST_number: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    phone_number: { type: String },
    phone_number_2: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postal_code: { type: String },
    country: { type: String },
    address_type: { type: String },
    isDefault: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Address', AddressSchema);