const mongoose = require('mongoose');


// Work From Home Schema
const workFromHomeSchema = new mongoose.Schema(
    {
      Employee_ID: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
         },
      Day: 
      { 
        type: String, 
        required: true, 
        trim: true 
      },
      Start_Date: { 
        type: Date, 
        required: true 
      },
      End_Date: 
      { 
        type: Date,
         required: true 
        },
      Reason: { 
        type: String, 
        trim: true 
      },
      Status: { 
        type: String, 
        trim: true 
      },
      Email_to: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Employee' 
        }
    ],
      Created_at: { 
        type: Date, 
        default: Date.now 
      },
      Updated_at: { type: Date },
    },
    { collection: 'WorkFromHome', timestamps: false }
  );
  module.exports = mongoose.model('WorkFromHome', workFromHomeSchema);
  