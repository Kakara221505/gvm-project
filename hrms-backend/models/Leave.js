const mongoose = require('mongoose');


// Leave Schema
const leaveSchema = new mongoose.Schema(
    {
      Employee_ID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Employee', 
        required: true 
      },
      Leave_Type: { 
        type: String, 
        required: true, 
        trim: true 
      },
      Day: { 
        type: String, 
        required: true, 
        trim: true 
      },
      Start_Date: { 
        type: Date, 
        required: true 
      },
      End_Date: { 
        type: Date, 
        required: true 
      },
      Start_Time: { 
        type: String,  
        default: null 
      },
      End_Time: { 
        type: String, 
        default: null 
      },
      Report_To: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Employee', 
    },
      Reason: { 
        type: String, 
        trim: true 
      },
      Status: { 
        type: String, 
        trim: true 
      },
      Approved_By: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Employee' ,
        default: null,
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
      Updated_at: { 
        type: Date ,
        default: Date.now,
      },
    },
    { collection: 'Leave', timestamps: false }
  );
  module.exports = mongoose.model('Leave', leaveSchema);
  