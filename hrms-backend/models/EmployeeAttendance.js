const mongoose = require('mongoose');


// Employee Attendance Schema
const employeeAttendanceSchema = new mongoose.Schema(
    {
      Employee_ID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Employee', 
        required: true 
      },
      Date: { 
        type: Date, 
        required: true 
      },
      Punch_IN: { 
        type: Date, 
        required: true 
      },
      Punch_Out: { 
        type: Date
      },
      Is_prasent: {
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
    { collection: 'EmployeeAttendance', timestamps: false }
  );
  module.exports = mongoose.model('EmployeeAttendance', employeeAttendanceSchema);
  