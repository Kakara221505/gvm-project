const mongoose = require('mongoose');


// Holiday Master Schema
const holidayMasterSchema = new mongoose.Schema(
    {
      Date: { 
        type: Date, 
        required: true 
      },
      Holiday_Name: { 
        type: String, 
        required: true, 
        trim: true 
      },
      is_view: {
        type: Boolean,
        default: false, 
      },
      Created_at: { 
        type: Date, 
        default: Date.now 
      },
      Updated_at: { 
        type: Date 
      },
    },
    { collection: 'HolidayMaster', timestamps: false }
  );
  module.exports = mongoose.model('HolidayMaster', holidayMasterSchema);
  