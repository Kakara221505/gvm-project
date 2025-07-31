const LeaveModel = require("../models/Leave");
const EmployeeModel = require("../models/Employee");
const EmployeeAttendanceModel = require("../models/EmployeeAttendance");
const HolidayModel = require("../models/HolidayMaster");
const {
  sendEmailTo,
  sendBirthAnniversayEmailTo,
} = require("../utils/emailUtility");
const ScheduleMail = require("../models/ScheduleMail");
const moment = require("moment-timezone");
const mongoose = require("mongoose");

// Get Dashboard Data for Employee
// async function getAllDashboardData(req, res, next) {
//   try {
//     const employee = await EmployeeModel.findById(req.user.id);

//     if (!employee || employee.Is_deleted) {
//       return res.status(403).json({
//         message: "Unauthorized or deleted employee.",
//       });
//     }

//     const totalLeaves = 18; // Fixed total leave for the employee

//     // 1. Get Total Leave Taken by the Employee
//     const leavesTaken = await LeaveModel.aggregate([
//       { $match: { Employee_ID: req.user.id, Status: "Approved" } }, // Match approved leaves
//       { $project: { Leave_Type: 1, Day: 1, Start_Date: 1, End_Date: 1 } },
//       {
//         $addFields: {
//           leaveDays: {
//             $cond: [
//               { $eq: ["$Day", "Full Day"] },
//               1, // Full day leave is 1 day
//               {
//                 $cond: [
//                   {
//                     $in: [
//                       "$Day",
//                       ["Half Day (First Half)", "Half Day (Second Half)"],
//                     ],
//                   },
//                   0.5, // Half day leave is 0.5 days
//                   0, // For unknown types, just set to 0
//                 ],
//               },
//             ],
//           },
//         },
//       },
//       {
//         $group: {
//           _id: null, // Group all leaves for the employee
//           totalLeaveDays: { $sum: "$leaveDays" }, // Sum the total leave days
//         },
//       },
//     ]);

//     const totalLeaveTaken =
//       leavesTaken.length > 0 ? leavesTaken[0].totalLeaveDays : 0;


//       const totalRemainingLeave = totalLeaves - totalLeaveTaken

//     // 2. Get Total Holidays for the Year (only count holidays with is_view: true)
//     const holidays = await HolidayModel.find({
//       Date: {
//         $gte: new Date(new Date().getFullYear(), 0, 1),
//         $lte: new Date(new Date().getFullYear(), 11, 31),
//       },
//       is_view: true, // Only count holidays with is_view: true
//     });

//     const totalHolidays = holidays.length;

//     // 3. Get all Punch In and Punch Out records for today
//     const today = new Date();
//     const attendanceRecords = await EmployeeAttendanceModel.find({
//       Employee_ID: req.user.id,
//       Date: {
//         $gte: new Date(today.setHours(0, 0, 0, 0)),
//         $lt: new Date(today.setHours(23, 59, 59, 999)),
//       },
//     });

//     let totalTime = 0; // in milliseconds
//     for (let record of attendanceRecords) {
//       const punchInTime = record.Punch_IN;
//       const punchOutTime = record.Punch_Out || new Date(); // If Punch_Out is null, use current time

//       // Calculate the time difference in milliseconds
//       totalTime += punchOutTime - punchInTime;
//     }

//     // Convert the total time to hours, minutes, and seconds
//     const hours = Math.floor(totalTime / (1000 * 60 * 60));
//     const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((totalTime % (1000 * 60)) / 1000);

//     // Format the time as HH:MM:SS
//     const totalTimeFormatted = `${String(hours).padStart(2, "0")}:${String(
//       minutes
//     ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

//     return res.status(200).json({
//       data: {
//         totalLeaves : employee.Leave_Balance,
//         totalLeaveTaken,
//         totalRemainingLeave,
//         totalHolidays,
//         totalTime: totalTimeFormatted, // Returning formatted total time worked for the day
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     return next(error);
//   }
// }


// async function getAllDashboardData(req, res, next) {
//   try {
//     const employee = await EmployeeModel.findById(req.user.id);

//     if (!employee || employee.Is_deleted) {
//       return res.status(403).json({
//         message: "Unauthorized or deleted employee.",
//       });
//     }

//     const currentYear = new Date().getFullYear(); // Get current year dynamically

//     // 1. Get Total Leave Taken by the Employee in the current year
//     const leavesTaken = await LeaveModel.aggregate([
//       {
//         $match: {
//           Employee_ID: req.user.id,
//           Status: "Approved",
//           Start_Date: {
//             $gte: new Date(currentYear, 0, 1), // January 1st of current year
//             $lte: new Date(currentYear, 11, 31, 23, 59, 59, 999), // December 31st of current year
//           },
//         },
//       },
//       {
//         $project: {
//           Leave_Type: 1,
//           Day: 1,
//           Start_Date: 1,
//           End_Date: 1,
//           leaveDays: {
//             $cond: {
//               if: { $eq: ["$Day", "Full Day"] },
//               then: {
//                 $add: [
//                   1,
//                   {
//                     $dateDiff: {
//                       startDate: "$Start_Date",
//                       endDate: "$End_Date",
//                       unit: "day",
//                     },
//                   },
//                 ],
//               },
//               else: {
//                 $cond: {
//                   if: { $in: ["$Day", ["Half Day (First Half)", "Half Day (Second Half)"]] },
//                   then: 0.5, // Half day is 0.5 leave
//                   else: 0, // Default case (should not happen)
//                 },
//               },
//             },
//           },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalLeaveDays: { $sum: "$leaveDays" }, // Sum all leave days
//         },
//       },
//     ]);

//     const totalLeaveTaken = leavesTaken.length > 0 ? leavesTaken[0].totalLeaveDays : 0;
//     const totalRemainingLeave = employee.Leave_Balance - totalLeaveTaken;

//     // 2. Get Total Holidays for the Year (only count holidays with is_view: true)
//     const holidays = await HolidayModel.find({
//       Date: {
//         $gte: new Date(currentYear, 0, 1),
//         $lte: new Date(currentYear, 11, 31, 23, 59, 59, 999),
//       },
//       is_view: true, // Only count holidays with is_view: true
//     });

//     const totalHolidays = holidays.length;

//     // 3. Get all Punch In and Punch Out records for today
//     const today = new Date();
//     const attendanceRecords = await EmployeeAttendanceModel.find({
//       Employee_ID: req.user.id,
//       Date: {
//         $gte: new Date(today.setHours(0, 0, 0, 0)),
//         $lt: new Date(today.setHours(23, 59, 59, 999)),
//       },
//     });

//     let totalTime = 0; // in milliseconds
//     for (let record of attendanceRecords) {
//       const punchInTime = record.Punch_IN;
//       const punchOutTime = record.Punch_Out || new Date(); // If Punch_Out is null, use current time

//       // Calculate the time difference in milliseconds
//       totalTime += punchOutTime - punchInTime;
//     }

//     // Convert total time to HH:MM:SS
//     const hours = Math.floor(totalTime / (1000 * 60 * 60));
//     const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((totalTime % (1000 * 60)) / 1000);

//     const totalTimeFormatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

//     return res.status(200).json({
//       data: {
//         totalLeaves: employee.Leave_Balance,
//         totalLeaveTaken,
//         totalRemainingLeave,
//         totalHolidays,
//         totalTime: totalTimeFormatted,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     return next(error);
//   }
// }

async function getAllDashboardData(req, res, next) {
  try {
    const employee = await EmployeeModel.findById(req.user.id);

    if (!employee || employee.Is_deleted) {
      return res.status(403).json({
        message: "Unauthorized or deleted employee.",
      });
    }

    const currentYear = new Date().getFullYear(); // Get current year dynamically

    // ✅ Fetch all approved leaves in the current year
    const leaves = await LeaveModel.find({
      Employee_ID: req.user.id,
      Status: "Approved",
      Start_Date: {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31, 23, 59, 59, 999),
      },
    });

    // ✅ Process leave records in JavaScript to exclude weekends
    let totalLeaveTaken = 0;
    
    leaves.forEach((leave) => {
      const start = new Date(leave.Start_Date);
      const end = new Date(leave.End_Date);
      let leaveDays = 0;

      while (start <= end) {
        const dayOfWeek = start.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek !== 6 && dayOfWeek !== 0) {
          leaveDays++; // Count only weekdays
        }
        start.setDate(start.getDate() + 1);
      }

      if (leave.Day === "Full Day") {
        totalLeaveTaken += leaveDays;
      } else if (leave.Day === "Half Day (First Half)" || leave.Day === "Half Day (Second Half)") {
        totalLeaveTaken += 0.5;
      }
    });

    const totalRemainingLeave = employee.Leave_Balance - totalLeaveTaken;

    // ✅ Fetch total holidays (where `is_view: true`)
    const holidays = await HolidayModel.find({
      Date: {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31, 23, 59, 59, 999),
      },
      is_view: true,
    });

    const totalHolidays = holidays.length;

    // ✅ Fetch all Punch In and Punch Out records for today
    const today = new Date();
    const attendanceRecords = await EmployeeAttendanceModel.find({
      Employee_ID: req.user.id,
      Date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    let totalTime = 0; // in milliseconds
    for (let record of attendanceRecords) {
      const punchInTime = record.Punch_IN;
      const punchOutTime = record.Punch_Out || new Date(); // If Punch_Out is null, use current time

      // Calculate the time difference in milliseconds
      totalTime += punchOutTime - punchInTime;
    }

    // Convert total time to HH:MM:SS
    const hours = Math.floor(totalTime / (1000 * 60 * 60));
    const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalTime % (1000 * 60)) / 1000);

    const totalTimeFormatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return res.status(200).json({
      data: {
        totalLeaves: employee.Leave_Balance,
        totalLeaveTaken,
        totalRemainingLeave,
        totalHolidays,
        totalTime: totalTimeFormatted,
      },
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Get Dashboard Data for Admin

async function getAllDashboardDataForAdmin(req, res, next) {
  try {
    // 1. Fetch the admin data to verify authorization
    const admin = await EmployeeModel.findById(req.user.id);
    if (!admin || admin.Role !== 0 || admin.Is_deleted) {
      return res.status(403).json({
        message: "Unauthorized access.",
      });
    }

    const id = req.user.id;

    // 2. Total Employees (not deleted)
    const totalEmployees = await EmployeeModel.countDocuments({
      Is_deleted: false,
    });

    // 3. Get Total Leave Taken for the logged-in User (by filtering based on the logged-in employee's ID)
    const totalLeavesTakenForUser = await LeaveModel.aggregate([
      {
        $match: {
          Employee_ID: new mongoose.Types.ObjectId(id), // Use 'new' to create ObjectId
          Status: "Approved", // Only consider approved leaves
          Start_Date: { $gte: new Date(new Date().getFullYear(), 0, 1) }, // Only leaves taken in the current year
        },
      },
      {
        $project: {
          Leave_Type: 1,
          Day: 1, // Include the Day field for leave type (Full Day or Half Day)
          Start_Date: 1,
          End_Date: 1,
        },
      },
      {
        $addFields: {
          leaveDays: {
            $cond: [
              { $eq: ["$Day", "Full Day"] },
              1, // Full day leave is 1 day
              {
                $cond: [
                  {
                    $in: [
                      "$Day",
                      ["Half Day (First Half)", "Half Day (Second Half)"],
                    ],
                  },
                  0.5, // Half day leave is 0.5 days
                  0, // For unknown types, just set to 0
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$Employee_ID", // Group by Employee_ID
          totalLeaveDays: { $sum: "$leaveDays" }, // Sum the leave days
        },
      },
    ]);

    const totalLeaveTakenForUsers = totalLeavesTakenForUser.length
      ? totalLeavesTakenForUser[0].totalLeaveDays
      : 0;

    // 4. Get Total Holidays for the Year (only count holidays with is_view: true)
    const holidays = await HolidayModel.find({
      Date: {
        $gte: new Date(new Date().getFullYear(), 0, 1),
        $lte: new Date(new Date().getFullYear(), 11, 31),
      },
      is_view: true, // Only count holidays with is_view: true
    });

    const totalHolidays = holidays.length;

    // 5. Calculate Attendance (Present/Absent) for all employees today
    const today = new Date();

    // Get all attendance records for today and only the first punch-in for each employee
    const attendanceToday = await EmployeeAttendanceModel.aggregate([
      {
        $match: {
          Date: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999)),
          },
        },
      },
      {
        $sort: { Punch_IN: 1 }, // Sort to get the first punch-in for each employee
      },
      {
        $group: {
          _id: "$Employee_ID", // Group by Employee_ID to get only the first punch-in for each employee
          firstPunchIn: { $first: "$Punch_IN" },
          isPresent: { $first: "$Is_prasent" }, // Get the Is_prasent field to determine if they should be counted as present
        },
      },
      {
        $match: {
          isPresent: true, // Only consider employees who are present today
        },
      },
    ]);

    // Get the count of present employees
    const presentCount = attendanceToday.length;

    // Absent count is total employees minus present employees
    const absentCount = totalEmployees - presentCount;
    const totalLeaveTakenForUser = admin.Leave_Balance - totalLeaveTakenForUsers;

    return res.status(200).json({
      data: {
        totalEmployees,
        totalLeaveTakenForUser,
        totalLeaves: admin.Leave_Balance,
        totalLeaveTaken: totalLeaveTakenForUsers,
        totalHolidays,
        presentCount,
        absentCount,
      },
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

async function sendLeaveAndBirthdayNotifications(req, res, next) {
  try {
    // Default CC recipients for all notifications
    const ccRecipients = ["vivek@gvmtechnologies.com"];

    // 1. Get Employees who are on leave and status is "Approved"
    const leaveEmails = req.body.leaveEmails || []; // Extract leave emails from request body
    const employeesOnLeave = await LeaveModel.find({
      Status: "Approved", // Ensure that the leave is approved
    }).populate(
      "Employee_ID",
      "First_name Last_name Email Start_Date End_Date"
    );

    // Notify employees who are on leave based on req.body leaveEmails
    const employeesToNotifyForLeave = employeesOnLeave.filter((leave) => {
      const employee = leave.Employee_ID;

      // Check if Employee_ID is populated and the email is available
      if (employee && employee.Email) {
        return leaveEmails.includes(employee.Email);
      }
      return false; // Skip if no valid Employee_ID or Email
    });

    for (const leave of employeesToNotifyForLeave) {
      const employee = leave.Employee_ID;

      const leaveNotificationText = `
          <p>Dear ${employee.First_name} ${employee.Last_name},</p>
          <p>Your leave from ${leave.Start_Date} to ${leave.End_Date} is confirmed.</p>
          <p>Please let me know if you require any further information or arrangements.</p>
          <p>Looking forward to your approval.</p>
          <p>Best regards,</p>
          <p>GVM</p>
        `;
      await sendEmailTo(
        employee.Email,
        "Leave Notification",
        leaveNotificationText,
        ccRecipients
      );
    }

    // 2. Get Employees whose birthday is today (or based on provided emails)
    const birthdayEmails = req.body.birthdayEmails || []; // Extract birthday emails from request body
    const employeesWithBirthdayToday = await EmployeeModel.find({
      Is_deleted: false,
    })
      .where("Email")
      .in(birthdayEmails);

    // Notify employees with birthdays based on the provided emails
    for (const employee of employeesWithBirthdayToday) {
      const birthdayNotificationText = `
          <p>Dear ${employee.First_name} ${employee.Last_name},</p>
          <p>We wish you a very Happy Birthday!</p>
          <p>Please let me know if you require any additional information or arrangements.</p>
          <p>Looking forward to your approval.</p>
          <p>Best regards,</p>
          <p>GVM</p>
        `;
      await sendEmailTo(
        employee.Email,
        "Happy Birthday!",
        birthdayNotificationText,
        ccRecipients
      );
    }

    // 3. Automatically Notify Employees with Work Anniversary tomorrow (based on joining date)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Get tomorrow's date

    // Extract tomorrow's month and day (ignoring the year)
    const tomorrowDay = tomorrow.getDate();
    const tomorrowMonth = tomorrow.getMonth() + 1; // MongoDB months are 0-based, so we add 1

    const employeesWithWorkAnniversary = await EmployeeModel.aggregate([
      {
        $match: {
          Is_deleted: false, // Only include non-deleted employees
        },
      },
      {
        $project: {
          First_name: 1,
          Last_name: 1,
          Email: 1,
          Date_of_join: 1,
          // Extract month and day from the Date_of_join field
          Day: { $dayOfMonth: "$Date_of_join" },
          Month: { $month: "$Date_of_join" },
        },
      },
      {
        $match: {
          Day: tomorrowDay, // Match tomorrow's day
          Month: tomorrowMonth, // Match tomorrow's month
        },
      },
    ]);

    // Send Work Anniversary emails automatically
    for (const employee of employeesWithWorkAnniversary) {
      const workAnniversaryNotificationText = `
          <p>Dear ${employee.First_name} ${employee.Last_name},</p>
          <p>Congratulations on your work anniversary with GVM!</p>
          <p>Best regards,</p>
          <p>GVM</p>
        `;
      await sendEmailTo(
        employee.Email,
        "Happy Work Anniversary!",
        workAnniversaryNotificationText,
        ccRecipients
      );
    }

    return res.status(200).json({
      message:
        "Notifications for leave, birthdays, and work anniversaries have been sent successfully.",
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

async function anniversaryBirthdayList(req, res, next) {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-based
    const currentDay = currentDate.getDate();

    const matchQuery = {
      Is_deleted: false,
    };

    // Fetch employees with relevant dates
    const employees = await EmployeeModel.aggregate([
      {
        $addFields: {
          birthMonthDay: {
            $dateToString: { format: "%m-%d", date: "$Date_of_birth" },
          },
          joinMonthDay: {
            $dateToString: { format: "%m-%d", date: "$Date_of_join" },
          },
        },
      },
      { $match: matchQuery },
      {
        $project: {
          _id: 1,
          First_name: 1,
          Last_name: 1,
          Email: 1,
          Alternate_Email: 1,
          Phone: 1,
          Alternate_Phone: 1,
          Designation: 1,
          Branch: 1,
          Department: 1,
          birthMonthDay: 1,
          joinMonthDay: 1,
          Date_of_birth: 1,
          Date_of_join: 1,
        },
      },
    ]);

    // Prepare a list with dual events for the same employee if applicable
    const eventList = [];
    employees.forEach((employee) => {
      if (employee.Date_of_birth) {
        const birthDay = parseInt(employee.birthMonthDay.split("-")[1], 10);
        eventList.push({
          ...employee,
          event: "Birthday",
          eventDay: birthDay,
          eventMonth: parseInt(employee.birthMonthDay.split("-")[0], 10),
          date: employee.Date_of_birth,
        });
      }

      if (employee.Date_of_join) {
        const joinDay = parseInt(employee.joinMonthDay.split("-")[1], 10);
        eventList.push({
          ...employee,
          event: "Anniversary",
          eventDay: joinDay,
          eventMonth: parseInt(employee.joinMonthDay.split("-")[0], 10),
          date: employee.Date_of_join,
        });
      }
    });

    // Sort by current date, upcoming events, and wrap around the year
    eventList.sort((a, b) => {
      const todayMonthDay = currentMonth * 100 + currentDay;
      const aMonthDay = a.eventMonth * 100 + a.eventDay;
      const bMonthDay = b.eventMonth * 100 + b.eventDay;

      const isAToday = aMonthDay === todayMonthDay ? -1 : 0;
      const isBToday = bMonthDay === todayMonthDay ? -1 : 0;

      if (isAToday !== isBToday) return isAToday - isBToday;

      // Sort by the closest upcoming date, wrapping around the year
      const daysUntilA =
        aMonthDay >= todayMonthDay
          ? aMonthDay - todayMonthDay
          : aMonthDay + 1200 - todayMonthDay;
      const daysUntilB =
        bMonthDay >= todayMonthDay
          ? bMonthDay - todayMonthDay
          : bMonthDay + 1200 - todayMonthDay;

      return daysUntilA - daysUntilB;
    });

    // Exclude calculation fields from the final response
    let sanitizedEventList = eventList.map(
      ({ birthMonthDay, joinMonthDay, eventDay, eventMonth, ...rest }) => rest
    );

    if (search) {
      const searchLower = search.toLowerCase();
      sanitizedEventList = sanitizedEventList.filter((record) => {
        const First_name = record.First_name || "";
        const Last_name = record.Last_name || "";
        const Email = record.Email || "";
        const Designation = record.Designation || "";
        const Branch = record.Branch || "";
        const Department = record.Department || "";
        const event = record.event || "";
        
        // Combine first and last name for full name search
        const fullName = `${First_name} ${Last_name}`.trim(); 
    
        return (
          Email.toLowerCase().includes(searchLower) ||
          Designation.toLowerCase().includes(searchLower) ||
          Branch.toLowerCase().includes(searchLower) ||
          Department.toLowerCase().includes(searchLower) ||
          fullName.toLowerCase().includes(searchLower) ||
          event.toLowerCase().includes(searchLower)
        );
      });
    }

    // Paginate the sorted list
    const paginatedList = sanitizedEventList.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );

    return res.status(200).json({
      employees: paginatedList,
      totalRecords: sanitizedEventList.length,
      totalPages: Math.ceil(sanitizedEventList.length / pageSize),
      currentPage: pageNumber,
      limit: pageSize,
    });
  } catch (error) {
    console.error("Error in anniversaryBirthdayList:", error);
    return next(error);
  }
}

// async function sendLeaveAndBirthdayEmail(req, res, next) {
//   try {
//     const { ToEmail, CCEmail, notes } = req.body; // Extract ToEmail, CCEmail, and notes from the request body

//     // Default message footer
//     const footerMessage = `
//       <p>Best regards,</p>
//       <p>HR team</p>
//       <p>GVM Technologies</p>
//     `;

//     // 1. Send Birthday Emails
//     if (ToEmail && ToEmail.birthday) {
//       const birthdayEmails = ToEmail.birthday; // List of employees with birthdays
//       for (const email of birthdayEmails) {
//         const birthdayMessage = `
//           <p>Dear ${email.First_name} ${email.Last_name},</p>
//           <p>We wish you a very Happy Birthday!</p>
//           <p>${notes || ''}</p> <!-- Display dynamic notes if provided -->
//           ${footerMessage}
//         `;
//         await sendBirthAnniversayEmailTo(email.Email, "Happy Birthday!", birthdayMessage, CCEmail);
//       }
//     }

//     // 2. Send Work Anniversary Emails
//     if (ToEmail && ToEmail.anniversary) {
//       const anniversaryEmails = ToEmail.anniversary; // List of employees with anniversaries
//       for (const email of anniversaryEmails) {
//         const anniversaryMessage = `
//           <p>Dear ${email.First_name} ${email.Last_name},</p>
//           <p>Congratulations on your work anniversary with GVM!</p>
//           <p>${notes || ''}</p> <!-- Display dynamic notes if provided -->
//           ${footerMessage}
//         `;
//         await sendEmailTo(email.Email, "Happy Work Anniversary!", anniversaryMessage, CCEmail);
//       }
//     }

//     return res.status(200).json({
//       message: "Notifications for birthday and work anniversaries have been sent successfully.",
//     });
//   } catch (error) {
//     console.error(error);
//     return next(error);
//   }
// }

async function sendLeaveAndBirthdayEmail(req, res, next) {
  try {
    const { ToEmail, CCEmail, notes, eventType, Name } = req.body; // Extract Name from the request body
    const { user } = req; // Extract user from the request (assumes req.user contains authenticated user info)
    // Validate inputs
    if (!ToEmail || !notes || !eventType || !Name || !user) {
      return res.status(400).json({
        message:
          "ToEmail, Name, notes, eventType, and user details are required.",
      });
    }

    // Get the employee's name and designation from req.user
    const senderName = user.name || "HR Team"; // Default to "HR Team" if no name is available
    const designation = user.designation || "HR Manager"; // Default to "HR Manager" if no designation is available

    // Generate the current date in the format (e.g., 8-1-2025)
    const currentDate = new Date()
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    // Determine the subject and dynamic message based on eventType
    let subject;
    let dynamicMessage;

    if (eventType.toLowerCase() === "birthday") {
      subject = `${Name} - Birthday - ${currentDate}`;
      dynamicMessage = `
          <p>${notes}</p>
        `;
    } else if (eventType.toLowerCase() === "anniversary") {
      subject = `${Name} - Work Anniversary - ${currentDate}`;
      dynamicMessage = `
          <p>${notes}</p>
        `;
    } else {
      return res.status(400).json({
        message: "Invalid eventType. Use 'birthday' or 'anniversary'.",
      });
    }

    // Construct the complete email content
    const emailContent = `
        <p>Hi ${Name},</p>
        ${dynamicMessage}
        <p>Best Regards,</p>
        <p>${senderName}</p>
        <p>${designation}</p>
        <p>GVM Technologies</p>
      `;

    // Send the email
    await sendBirthAnniversayEmailTo(ToEmail, subject, emailContent, CCEmail);

    return res.status(200).json({
      message: `${eventType} email sent successfully.`,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

async function scheduleEmail(req, res, next) {
  try {
    const {
      ToEmail,
      CCEmail,
      notes,
      eventType,
      Name,
      scheduleTime,
      scheduleDate,
    } = req.body;

    const { user } = req;
    const newSchedule = new ScheduleMail({
      toMail: ToEmail,
      ccMail: CCEmail,
      note: notes,
      eventType,
      name: Name,
      scheduleTime,
      scheduleDate,
      createdBy: user.id,
    });

    await newSchedule.save();

    return res.status(200).json({
      message: `${eventType} email scheduled successfully.`,
      data: newSchedule,
    });
  } catch (error) {
    console.error("While adding mail schedule", error);
    return next(error);
  }
}

async function sendScheduleMail() {
  try {
    const now = moment().tz("Asia/Kolkata"); // Set to IST
    const todayDate = now.format("YYYY-MM-DD");
    const currentTime = now.format("HH:mm");

    const todayScheduleData = await ScheduleMail.find({
      scheduleDate: todayDate,
      scheduleTime: currentTime,
      isMailSent: false,
    }).populate({
      path: "createdBy",
      select: "First_name Last_name Designation",
    });

    for (scheduleLoop of todayScheduleData) {
      const subject = `${scheduleLoop.name} - ${
        scheduleLoop.eventType === "Birthday" ? "Birthday" : "Work Anniversary"
      } - ${todayDate}`;

      const emailContent = `
        <p>Hi ${scheduleLoop.name},</p>
        <p>${scheduleLoop.note}</p>
        <p>Best Regards,</p>
        <p>${scheduleLoop.createdBy.First_name} ${scheduleLoop.createdBy.Last_name}</p>
        <p>${scheduleLoop.createdBy.Designation}</p>
        <p>GVM Technologies</p>
      `;
      const response = await sendBirthAnniversayEmailTo(
        scheduleLoop.toMail,
        subject,
        emailContent,
        scheduleLoop.ccMail
      );
      if (response === 200) {
        await ScheduleMail.findByIdAndUpdate(scheduleLoop._id, {
          isMailSent: true,
        });
        console.log(`Email sent and schedule updated for: ${scheduleLoop._id}`);
      }
    }
  } catch (error) {
    console.log("sendScheduleMail error", error);
    throw error;
  }
}

async function getScheduleEmail(req, res, next) {
  const { isMailSent = false, date, page = 1, limit = 10 } = req.query;

  try {
    const filter = {};
    if (date) {
      const filterDate = moment(date).format("YYYY-MM-DD");
      filter.scheduleDate = filterDate;
    }
    if (isMailSent !== undefined) {
      filter.isMailSent = isMailSent === "true";
    }

    const scheduleData = await ScheduleMail.find(filter)
      .populate({ path: "createdBy", select: "First_name Last_name" })
      .sort({ createdAt: -1 });

    // pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = scheduleData.slice(startIndex, endIndex);

    return res.status(200).json({
      message: `Schedule Mail Data.`,
      data: paginatedData,
      totalRecords: scheduleData.length,
      currentPage: parseInt(page, 10),
      totalPage: Math.ceil(scheduleData.length / limit),
    });
  } catch (error) {
    console.error("While getting mail schedule list");
    return next(error);
  }
}

async function updateScheduleMail(req, res, next) {
  const { id } = req.params;
  const { date, time, note, ccMail } = req.body;
  try {
    const scheduleData = await ScheduleMail.findById(id);
    if (!scheduleData) {
      return res.status(404).json({
        message: "Schedule not found.",
      });
    }
    if (scheduleData.isMailSent) {
      return res.status(400).json({
        message: "Can't update schedule because Mail already sent.",
      });
    }

    const update = {};
    if (date) {
      update.scheduleDate = date;
    }
    if (time) {
      update.scheduleTime = time;
    }
    if (note) {
      update.note = note;
    }
    if (ccMail) {
      update.ccMail = ccMail;
    }

    const updatedSchedule = await ScheduleMail.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: `Schedule Updated Successfully.`,
      data: updatedSchedule,
    });
  } catch (error) {
    console.error("While updating mail schedule");
    return next(error);
  }
}

async function deleteScheduleMail(req, res, next) {
  const { id } = req.params;

  try {
    const scheduleData = await ScheduleMail.findByIdAndDelete(id);
    if (!scheduleData) {
      return res.status(404).json({
        message: "Schedule not found.",
      });
    }
    return res.status(200).json({
      message: `Schedule Deleted Successfully.`,
    });
  } catch (error) {
    console.error("While deleting mail schedule");
    return next(error);
  }
}

module.exports = {
  getAllDashboardData,
  getAllDashboardDataForAdmin,
  sendLeaveAndBirthdayNotifications,
  anniversaryBirthdayList,
  sendLeaveAndBirthdayEmail,
  scheduleEmail,
  sendScheduleMail,
  getScheduleEmail,
  updateScheduleMail,
  deleteScheduleMail,
};
