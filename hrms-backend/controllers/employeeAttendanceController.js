const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const EmployeeAttendanceModel = require("../models/EmployeeAttendance");
const EmployeeModel = require("../models/Employee");
const messages = require("../utils/messages");
const commonFunctions = require("../utils/commonFunctions");
const { sendEmailOTP } = require("../utils/emailUtility");
const { UserRole } = require("../utils/commonFunctions");
const moment = require("moment");
const Employee = require("../models/Employee");
const { emitAttendanceNotification } = require("./notificationController");

// Add Work From Home
async function employeeAttendanceAdd(req, res, next) {
  try {
    const { Employee_ID, Date: dateString, Punch_IN, Punch_Out } = req.body;

    if (!Employee_ID) {
      return res
        .status(400)
        .json({ message: messages.error.EMPLOYEE_ID_REQUIRED });
    }

    // Ensure `Date` is only the date part (strip time)
    const attendanceDate = new Date(dateString).setHours(0, 0, 0, 0); // Correctly parse the date string and set to 00:00:00
    const punchInTime = new Date(Punch_IN); // Parse Punch_IN time

    // Check if an entry already exists for the same employee, date, and punch-in time
    const existingAttendance = await EmployeeAttendanceModel.findOne({
      Employee_ID,
      Date: {
        $gte: attendanceDate,
        $lt: new Date(attendanceDate).setDate(
          new Date(attendanceDate).getDate() + 1
        ),
      },
      Punch_IN: punchInTime,
    });

    if (existingAttendance) {
      return res.status(400).json({
        message:
          "Punch-IN already exists for this employee at the specified date and time.",
      });
    }

    // Create a new attendance record
    const newAttendance = new EmployeeAttendanceModel({
      Employee_ID,
      Date: new Date(attendanceDate), // Use date without time
      Punch_IN: punchInTime,
      Punch_Out: Punch_Out ? new Date(Punch_Out) : null, // If Punch_Out is provided, convert to Date
      Is_prasent: Punch_IN ? true : false,
    });

    await newAttendance.save();
    await emitAttendanceNotification()

    return res.status(200).json({
      message: messages.success.PUNCH_IN_CREATED,
      data: newAttendance,
    });
  } catch (error) {
    console.error("Error creating attendance:", error);
    return next(error);
  }
}

// Get All Work From Home (Only for logged-in employee)
async function getAllemployeeAttendanceData(req, res, next) {
  try {
    const Employee_ID = req.user.id;
    const { page = 1, limit = 10, search = "", date } = req.query;

    const query = { Employee_ID };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.Date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (search) {
      query.$or = [
        { "Employee_ID.First_name": { $regex: search, $options: "i" } },
        { "Employee_ID.Last_name": { $regex: search, $options: "i" } },
        { "Employee_ID.Branch": { $regex: search, $options: "i" } },
      ];
    }

    // Count total records after filtering
    const totalRecords = await EmployeeAttendanceModel.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    // Ensure page number is valid (reset to first page if out of range)
    const validPage = Math.min(page, totalPages) || 1;

    // Fetch attendance data with pagination
    const attendanceData = await EmployeeAttendanceModel.find(query)
      .sort({ Created_at: -1 })
      .skip((validPage - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate("Employee_ID", "First_name Last_name Branch");

    const transformedData = attendanceData.map((record) => ({
      _id: record._id,
      Employee_ID: record.Employee_ID ? record.Employee_ID._id : null,
      Date: record.Date,
      Punch_IN: record.Punch_IN,
      Punch_Out: record.Punch_Out,
      Created_at: record.Created_at,
      Updated_at: record.Updated_at || null,
      __v: record.__v,
      Employee_Name: record.Employee_ID
        ? `${record.Employee_ID.First_name} ${record.Employee_ID.Last_name}`
        : null,
      Branch: record.Employee_ID ? record.Employee_ID.Branch : null,
    }));

    return res.status(200).json({
      data: transformedData,
      totalRecords,
      totalPages,
      currentPage: page,
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}



// Get All Work From Home (Admin access - fetch all records)
// async function getAllEmployeeAttendanceDataForAdmin(req, res, next) {
//   try {
//     // Validate if the logged-in user is an admin
//     const admin = await EmployeeModel.findById(req.user.id);
//     if (!admin || admin.Role !== parseInt(UserRole.ADMIN, 10)) {
//       return res.status(403).json({
//         message: messages.error.UNAUTHORIZED_ACCESS,
//       });
//     }

//     // Extract query parameters for pagination and filtering
//     const { page = 1, limit = 10, search = "", startDate, endDate, branch, Is_prasent } = req.query;

//     // Build the dynamic query for filtering
//     const query = {
//       $and: [],
//     };

//     // Filter by current date (if no specific date filter is applied)
//     const today = new Date();
//     const currentDate = today.setHours(0, 0, 0, 0); // Set time to 00:00:00 for date comparison

//     if (!startDate && !endDate) {
//       // If no specific date is provided, use the current date
//       query.$and.push({
//         Punch_IN: { $gte: currentDate, $lt: currentDate + 86400000 } // Today's date range
//       });
//     }

//     // Filter by Start Date (if provided)
//     if (startDate) {
//       query.$and.push({
//         Punch_IN: { $gte: new Date(startDate) },
//       });
//     }

//     // Filter by End Date (if provided)
//     if (endDate) {
//       query.$and.push({
//         Punch_IN: { $lte: new Date(endDate) },
//       });
//     }

//     // // Filter by Branch
//     // if (branch) {
//     //   query.$and.push({
//     //     "Employee.Branch": { $regex: branch, $options: "i" },
//     //   });
//     // }

//     // Filter by Presence (Is_prasent)
//     if (Is_prasent !== undefined) {
//       query.$and.push({
//         Is_prasent: Is_prasent == 'true', // Convert string 'true'/'false' to boolean
//       });
//     }

//     // Remove empty $and to avoid unnecessary queries
//     if (query.$and.length === 0) {
//       delete query.$and;
//     }

//     // Count total records for pagination
//     const totalRecords = await EmployeeAttendanceModel.countDocuments(query);
//     const totalPages = Math.ceil(totalRecords / limit);

//     // Fetch attendance data with pagination, sorting, and employee details populated
//     let attendanceData = await EmployeeAttendanceModel.find(query)
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit))
//       .sort({ Punch_IN: -1 }) // Sort by Punch_IN date
//       .populate("Employee_ID", "First_name Last_name Branch");

//     // Handle search filtering for employee name (if search is provided)
//     if (search) {
//       const searchLower = search.toLowerCase();
//       attendanceData = attendanceData.filter((record) => {
//         const firstName = record.Employee_ID?.First_name || "";
//         const lastName = record.Employee_ID?.Last_name || "";

//         return (
//           firstName.toLowerCase().includes(searchLower) ||
//           lastName.toLowerCase().includes(searchLower)
//         );
//       });
//     }
//     if (branch) {
//       const branchLower = branch.toLowerCase();
//       attendanceData = attendanceData.filter((record) => {
//         const branchName = record.Employee_ID?.Branch || "";
//         return (
//           branchName.toLowerCase().includes(branchLower)
//         );
//       });
//     }

//     // Transform response to include Employee_Name, Branch, and attendance status
//     const transformedData = attendanceData.map((record) => ({
//       ...record.toObject(),
//       Employee_ID: record.Employee_ID?._id || null,
//       Employee_Name: record.Employee_ID
//         ? `${record.Employee_ID.First_name} ${record.Employee_ID.Last_name}`
//         : null,
//       Branch: record.Employee_ID?.Branch || null,
//       Punch_Out: record.Punch_Out || "Not Yet Punched Out", // Handle case where Punch_Out is null
//       Is_prasent: record.Is_prasent, // Add attendance status
//     }));

//     // Send the response with pagination details
//     return res.status(200).json({
//       data: transformedData,
//       totalRecords: attendanceData.length,
//       totalPages,
//       currentPage: parseInt(page),
//       limit: parseInt(limit),
//     });
//   } catch (error) {
//     console.error(error);
//     return next(error);
//   }
// }

async function getAllEmployeeAttendanceDataForAdmin(req, res, next) {
  try {
    // Check if the user is an admin
    const admin = await EmployeeModel.findById(req.user.id);
    if (!admin || admin.Role !== 0) {
      return res.status(403).json({
        message: messages.error.UNAUTHORIZED_ACCESS,
      });
    }

    // Extract filters from the request query
    const {
      page = 1,
      limit = 10,
      employeeName,
      branch,
      dateFrom,
      dateTo,
      status = "present", // "present" or "absent"
    } = req.query;

    // Build the attendance filter query
    const attendanceFilter = {};
    const datesFrom = dateFrom || moment().format("YYYY-MM-DD");

    if (datesFrom || dateTo) {
      const dateQuery = {};
      if (datesFrom) {
        dateQuery.$gte = moment(datesFrom, "YYYY-MM-DD")
          .startOf("day")
          .toISOString();
      }
      if (dateTo) {
        dateQuery.$lte = moment(dateTo, "YYYY-MM-DD")
          .endOf("day")
          .toISOString();
      }
      attendanceFilter.Punch_IN = dateQuery;
    }

    // Fetch all employees
    const allEmployees = await EmployeeModel.find({ Is_deleted: false });

    // Fetch attendance data based on the filter
    const attendanceData = await EmployeeAttendanceModel.find(attendanceFilter)
      .populate("Employee_ID", "First_name Last_name Branch")
      .sort({ Created_at: -1 })
      .lean();

    // Create a map of attendance by employee ID and date
    const attendanceMap = {};
    attendanceData.forEach((record) => {
      const employeeId = record.Employee_ID._id.toString();
      const dateKey = moment(record.Date).format("YYYY-MM-DD");

      if (!attendanceMap[employeeId]) {
        attendanceMap[employeeId] = {};
      }

      if (!attendanceMap[employeeId][dateKey]) {
        attendanceMap[employeeId][dateKey] = { punchIns: [], punchOuts: [] };
      }

      attendanceMap[employeeId][dateKey].punchIns.push(
        record.Punch_IN,
        record._id
      );
      if (record.Punch_Out) {
        attendanceMap[employeeId][dateKey].punchOuts.push(
          record.Punch_Out,
          record._id
        );
      }
    });

    // Create the response data
    const responseData = allEmployees.map((employee) => {
      // console.log("employee ",employee)
      const employeeId = employee._id.toString();
      const attendanceRecords = [];
      const dateKeys = Object.keys(attendanceMap[employeeId] || {});
      const datesToCheck = datesFrom
        ? [moment(datesFrom).format("YYYY-MM-DD")]
        : [];

      if (dateTo) {
        const range = moment(dateFrom).twix(moment(dateTo)).toArray("days");
        datesToCheck.push(...range.map((date) => date.format("YYYY-MM-DD")));
      }

      datesToCheck.forEach((dateKey) => {
        const punches = attendanceMap[employeeId]?.[dateKey] || null;
        const firstPunchIn =
          punches?.punchIns?.[punches.punchIns.length - 2] || null;
        const firstPunchInId =
          punches?.punchIns?.[punches.punchIns.length - 1] || null;
        const lastPunchOut = punches?.punchOuts?.[0] || null;
        const lastPunchOutId = punches?.punchOuts?.[1];
        const attendanceStatus = punches
          ? punches.punchIns.length > 0
            ? "Present"
            : "Absent"
          : "Absent";
        
        // Find the corresponding record in attendanceData to get _id
        const matchingRecord = attendanceData.find(
          (rec) =>
            rec.Employee_ID._id.toString() === employeeId &&
            moment(rec.Date).format("YYYY-MM-DD") === dateKey
        );

        // Calculate hours worked
        let totalSeconds = 0;
        punches?.punchIns.forEach((punchIn, index) => {
          if (punchIn && punches.punchOuts[index]) {
            const punchInTime = moment(punchIn);
            const punchOutTime = moment(punches.punchOuts[index]);

            if (punchOutTime.isAfter(punchInTime)) {
              totalSeconds += punchOutTime.diff(punchInTime, "seconds");
            }
          }
        });

        const hoursWorked = moment.utc(totalSeconds * 1000).format("HH:mm:ss");

        attendanceRecords.push({
          // _id: matchingRecord ? matchingRecord._id : null,
          Employee_Name: `${employee.First_name} ${employee.Last_name}`,
          Employee_ID: employee._id,
          Branch: employee.Branch,
          Date: dateKey,
          status: attendanceStatus,
          Punch_IN: firstPunchIn ? moment(firstPunchIn).toISOString() : null,
          Punch_IN_Id: firstPunchInId,
          Punch_Out: lastPunchOut ? moment(lastPunchOut).toISOString() : null,
          Punch_Out_Id: lastPunchOutId,
          Hours: hoursWorked,
        });
      });

      return attendanceRecords;
    });

    // console.log("responseData ", responseData)

    // Flatten and filter the response data
    const flattenedData = responseData.flat();
    const filteredData = flattenedData.filter((attendance) => {
      let matches = true;

      if (employeeName) {
        matches =
          matches &&
          `${attendance.Employee_Name}`
            .toLowerCase()
            .includes(employeeName.toLowerCase());
      }
      if (branch) {
        const branches = Array.isArray(branch) ? branch : branch.split(",");
        matches =
          matches &&
          branches.some(
            (b) => b.toLowerCase() === attendance.Branch.toLowerCase()
          );
      }
      if (status) {
        matches =
          matches && attendance.status.toLowerCase() === status.toLowerCase();
      }

      return matches;
    });

    // Paginate the results
    const startIndex = (page - 1) * limit;
    const paginatedData = filteredData.slice(startIndex, startIndex + limit);

    // Total records for pagination
    const totalRecords = filteredData.length;
    const totalPages = Math.ceil(totalRecords / limit);

    return res.status(200).json({
      message: "Employee attendance data retrieved successfully",
      data: paginatedData,
      totalRecords,
      totalPages,
      currentPage: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  } catch (error) {
    console.error("Error fetching employee attendance data:", error);
    return next(error);
  }
}

// Get Employee Attendance By ID
async function getEmployeeAttendanceById(req, res, next) {
  try {
    const { id } = req.params;

    const attendance = await EmployeeAttendanceModel.findById(id).populate(
      "Employee_ID",
      "First_name Last_name Branch"
    );

    if (!attendance) {
      return res
        .status(404)
        .json({ message: messages.error.PUNCH_IN_NOT_FOUND });
    }

    // Transforming the response
    const transformedAttendance = {
      _id: attendance._id,
      Employee_ID: attendance.Employee_ID ? attendance.Employee_ID._id : null,
      Date: attendance.Date,
      Punch_IN: attendance.Punch_IN,
      Punch_Out: attendance.Punch_Out,
      Created_at: attendance.Created_at,
      Updated_at: attendance.Updated_at || null,
      __v: attendance.__v,
      Employee_Name: attendance.Employee_ID
        ? `${attendance.Employee_ID.First_name} ${attendance.Employee_ID.Last_name}`
        : null,
      Branch: attendance.Employee_ID ? attendance.Employee_ID.Branch : null,
    };

    return res.status(200).json({ data: transformedAttendance });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Update Employee Attendance By ID
async function updateEmployeeAttendance(req, res, next) {
  try {
    const { id } = req.params;
    const { Punch_IN, Punch_Out, Date } = req.body;

    const attendance = await EmployeeAttendanceModel.findById(id);

    if (!attendance) {
      return res
        .status(404)
        .json({ message: messages.error.PUNCH_IN_NOT_FOUND });
    }

    // Ensure proper Date constructor usage
    if (Date) attendance.Date = new global.Date(Date);
    if (Punch_IN) attendance.Punch_IN = new global.Date(Punch_IN);
    if (Punch_Out) attendance.Punch_Out = new global.Date(Punch_Out);

    attendance.Updated_at = new global.Date();
    await attendance.save();
    await emitAttendanceNotification()

    return res.status(200).json({
      message: messages.success.PUNCH_OUT_UPDATED,
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// function to update punch out via cron job
async function getEmployeeAttendanceDatewise() {
  try {
    const startOfToday = moment().startOf("day").toDate();
    const endOfToday = moment().endOf("day").toDate();

    // Fetch all active employees
    const allEmployees = await EmployeeModel.find({ Is_deleted: false });

    // Fetch attendance data for yesterday
    const response = await EmployeeAttendanceModel.find({
      Date: { $gte: startOfToday, $lt: endOfToday },
    }).populate("Employee_ID");

    // Map attendance records by employee ID and date
    const attendanceMap = {};
    response.forEach((record) => {
      const employeeId = record.Employee_ID?._id.toString();
      const dateKey = moment(record.Date).format("YYYY-MM-DD");

      if (!attendanceMap[employeeId]) {
        attendanceMap[employeeId] = {};
      }

      if (!attendanceMap[employeeId][dateKey]) {
        attendanceMap[employeeId][dateKey] = { punchIns: [], punchOuts: [] };
      }

      attendanceMap[employeeId][dateKey].punchIns.push(
        record.Punch_IN,
        record._id
      );
      if (record.Punch_Out) {
        attendanceMap[employeeId][dateKey].punchOuts.push(
          record.Punch_Out,
          record._id
        );
      }
    });

    // Prepare the final response
    const responseData = await Promise.all(
      allEmployees.map(async (employee) => {
        const employeeId = employee._id.toString();
        const dateKey = moment(startOfToday).format("YYYY-MM-DD");

        const punches = attendanceMap[employeeId]?.[dateKey] || null;
        const firstPunchIn =
          punches?.punchIns?.[punches.punchIns.length - 2] || null;
        const firstPunchInId =
          punches?.punchIns?.[punches.punchIns.length - 1] || null; // this will always return last punch in --
        const lastPunchOut = punches?.punchOuts?.[0] || null;
        const lastPunchOutId = punches?.punchOuts?.[1] || null;

        // If punch-in exists but punch-out is missing, update the database
        if (firstPunchIn && firstPunchInId) {
          // last punchin will update the puch out data for same
          const currentTime = moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
          await EmployeeAttendanceModel.findByIdAndUpdate(firstPunchInId, {
            Punch_Out: currentTime,
          });
          console.log(`Updated Punch_Out for record ID: ${firstPunchInId}`);
        }

        return {
          Employee_ID: employee._id,
          Employee_Name: employee.First_name,
          Date: dateKey,
          Punch_IN: firstPunchIn ? moment(firstPunchIn).toISOString() : null,
          Punch_IN_Id: firstPunchInId,
          Punch_Out: lastPunchOut ? moment(lastPunchOut).toISOString() : null,
          Punch_Out_Id: lastPunchOutId,
        };
      })
    );
    return responseData;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return [];
  }
}

// Update all Employee Attendance By ID in admin side
async function updateEmployeeAttendanceByAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const { Punch_IN, Punch_Out, Date, Employee_ID } = req.body;

    const attendance = await EmployeeAttendanceModel.findById(id);

    if (!attendance) {
      return res
        .status(404)
        .json({ message: messages.error.PUNCH_IN_NOT_FOUND });
    }

    // Ensure proper Date constructor usage
    if (Employee_ID) attendance.Employee_ID = Employee_ID;
    if (Date) attendance.Date = new global.Date(Date);
    if (Punch_IN) attendance.Punch_IN = new global.Date(Punch_IN);
    if (Punch_Out) attendance.Punch_Out = new global.Date(Punch_Out);

    attendance.Updated_at = new global.Date();
    await attendance.save();
    await emitAttendanceNotification()

    return res.status(200).json({
      message: messages.success.EMPLOYEE_ATTENDANCE_UPDATED,
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Delete Employee Attendance By ID
async function deleteEmployeeAttendance(req, res, next) {
  try {
    const { id } = req.params;

    const attendance = await EmployeeAttendanceModel.findByIdAndDelete(id);

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    return res.status(200).json({
      message: "Attendance record deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

async function leaveBalanceCron(req, res) {
  try {
    const employeeData = await EmployeeModel.find({ Is_deleted: false });
    await Promise.all(
      employeeData.map((employee) =>
        EmployeeModel.findByIdAndUpdate(employee._id, { Leave_Balance: 18 })
      )
    );
  } catch (error) {}
}
// leaveBalanceCron()

module.exports = {
  employeeAttendanceAdd,
  getAllemployeeAttendanceData,
  getEmployeeAttendanceById,
  updateEmployeeAttendance,
  deleteEmployeeAttendance,
  getAllEmployeeAttendanceDataForAdmin,
  updateEmployeeAttendanceByAdmin,
  getEmployeeAttendanceDatewise,
  leaveBalanceCron
};
