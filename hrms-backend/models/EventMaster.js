const mongoose = require('mongoose');



// Event Master Schema
const eventMasterSchema = new mongoose.Schema(
    {
      Date: { 
        type: Date, 
        required: true 
      },
      Time: { 
        type: String, 
        required: true 
      },
      Event_Name: { 
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
    { collection: 'EventMaster', timestamps: false }
  );
  module.exports = mongoose.model('EventMaster', eventMasterSchema);
  