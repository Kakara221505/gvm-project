const mongoose = require('mongoose');


// Designation Master Schema
const designationMasterSchema = new mongoose.Schema(
    {
      Designation_Name: { 
        type: String, 
        required: true, 
        trim: true 
      },
      Created_at: { 
        type: Date, 
        default: Date.now 
      },
      Updated_at: { 
        type: Date 
      },
    },
    { collection: 'DesignationMaster', timestamps: false }
  );
  module.exports = mongoose.model('DesignationMaster', designationMasterSchema);
  