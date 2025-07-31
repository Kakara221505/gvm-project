const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const WorkFromHomeModel = require("../models/WorkFromHome");
const EmployeeModel = require("../models/Employee");
const messages = require("../utils/messages");
const commonFunctions = require("../utils/commonFunctions");
const { sendEmailOTP } = require("../utils/emailUtility");
const { UserRole } = require("../utils/commonFunctions");
const { sendEmailTo } = require("../utils/emailUtility");
const mongoose = require('mongoose');
const {
  addNotificationInUserSection,
  emitNotification,
} = require("./notificationController");

// Add Work From Home
async function workFromHomeAdd(req, res, next) {
  try {
    const {
      Employee_ID,
      Day,
      Start_Date,
      End_Date,
      Reason,
      Email_to,
      Report_To,
    } = req.body;
    const { id } = req.user;

    if (!Employee_ID) {
      return res
        .status(400)
        .json({ message: messages.error.EMPLOYEE_ID_REQUIRED });
    }
    if (!Array.isArray(Email_to) || Email_to.length === 0) {
      return res.status(400).json({
        message:
          "Email_to field is required and must contain at least one employee ID.",
      });
    }

    // Fetch email addresses for Email_to IDs
    const employees = await EmployeeModel.find(
      { _id: { $in: Email_to } },
      "Email First_name Last_name"
    );

    if (employees.length === 0) {
      return res
        .status(404)
        .json({ message: "No employees found for the given IDs." });
    }
    // Calculate total days based on conditions
    let totalDays = 0;
    const startDate = new Date(Start_Date);
    const endDate = new Date(End_Date);

    if (Start_Date === End_Date) {
      totalDays = 1;
    }
    else if (Day === "Half Day (First Half)" || Day === "Half Day (Second Half)") {
      totalDays = 0.5;

    } else {
      // Exclude Saturdays and Sundays
      let currentDate = new Date(startDate);
      let count = 0;
    
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 6 && dayOfWeek !== 0) {
          count++; // Count only weekdays
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    
      totalDays = Day === "Full Day" ? count : count * 0.5;
    }

    // Prepare email recipients
    const emailRecipients = employees.map((emp) => emp.Email);

    // Prepare Work From Home data
    const workFromHomeData = {
      Employee_ID,
      Day,
      Start_Date,
      End_Date,
      Reason,
      Status: "Pending", // Default status
      Email_to,
      Report_To,
      Created_at: new Date(),
      Updated_at: new Date(),
    };

    const newWorkFromHome = new WorkFromHomeModel(workFromHomeData);
    await newWorkFromHome.save();

    // Prepare email details for Work From Home request
    const workFromHomeDetails = `
    <p><strong>Day:</strong> ${Day}</p>
    <p><strong>Start Date:</strong> ${Start_Date}</p>
    <p><strong>End Date:</strong> ${End_Date}</p>
    <p><strong>Reason:</strong> ${Reason}</p>
  `;

    // Prepare email content for Work From Home request
    for (const emp of employees) {
      const emailContent = `
      <p>Dear ${emp.First_name} ${emp.Last_name},</p>
      <p>I am writing to request your approval for my work from home request from <strong>${Start_Date}</strong> to <strong>${End_Date}</strong>.</p>
      <p><strong>Reason for taking WFH:</strong> ${Reason}</p>
        Mention the Dates - ${Start_Date} to ${End_Date}
      <p><strong>Total number of days:</strong> ${totalDays}</p>
      <p><strong>WFH Duration:</strong> ${Day}</p>
          <p>Please let me know if you require any additional information or arrangements. I appreciate your understanding and consideration.</p>
        <p>Looking forward to your approval.</p>
      <p>Best regards,<br>${emp.First_name} ${emp.Last_name}</p>
    `;

      await sendEmailTo(
        emp.Email,
        `${emp.First_name} ${emp.Last_name} - Work from Home Request - ${Start_Date}`,
        emailContent
      );
    }

    // for leave nottification
    const userData = await EmployeeModel.findById(Employee_ID);

    const notification = {
      title: "Work From Home Request",
      message: `${userData.First_name} request for ${req.body.Day} day work from home.`,
      createdBy: id,
      type: "admin",
    };
    const notificationUser = {
      title: "Work From Home Request",
      message: `Your ${req.body.Day} work from home request has been submited.`,
      createdBy: id,
      type: "user",
    };

    // find report_to from employee tabel to send notification
    const reportToEmployeeId = userData.Report_To;
    const notificationPm = {
      title: "Work From Home Request",
      message: `${userData.First_name} request for ${req.body.Day} day work from home.`,
      createdBy: id,
      type: "user",
    };

    await addNotificationInUserSection(Employee_ID, notification);
    // await addNotificationInUserSection(Employee_ID, notificationUser);
    await addNotificationInUserSection(reportToEmployeeId, notificationPm);

    // // Emit real-time notifications
    // await emitNotification(0, null, notification); // Broadcast to all admins
    // await emitNotification(null, Employee_ID.toString(), notificationUser); // Notify specific employee
    // await emitNotification(null, reportToEmployeeId.toString(), notificationPm); // Notify specific PM

    // scoket for real time notification
    await emitNotification();

    return res.status(200).json({
      message: messages.success.WORK_FROM_HOME_CREATED,
      data: newWorkFromHome,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Get All Work From Home (Only for logged-in employee)
async function getAllWorkFromHomeData(req, res, next) {
  try {
    const Employee_ID = req.user.id;

    const { page = 1, limit = 10, search = "", date, branch } = req.query;
    // Build the base query dynamically
    const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const query = {
      $and: [
        {
          Employee_ID,
          $or: [
            { Reason: { $regex: escapedSearch, $options: "i" } },
            { Status: { $regex: escapedSearch, $options: "i" } },
            { Day: { $regex: escapedSearch, $options: "i" } },
          ],
        },
        ...(date
          ? [
            {
              Start_Date: { $lte: new Date(date) },
              End_Date: { $gte: new Date(date) },
            },
          ]
          : []),
      ],
    };

    // Count total records before pagination
    const totalRecords = await WorkFromHomeModel.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    // Fetch data with pagination, sorting, and populating Employee details
    let workFromHomeData = await WorkFromHomeModel.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ Start_Date: -1 })
      .populate("Employee_ID", "First_name Last_name Branch");

    // Apply branch filter manually after populating Employee details
    if (branch) {
      const branchArray = branch.split(",").map((b) => b.trim().toLowerCase());
      workFromHomeData = workFromHomeData.filter((record) =>
        branchArray.includes(record.Employee_ID?.Branch?.toLowerCase())
      );
    }

    // Transform response to include Employee_Name and Branch
    const transformedData = workFromHomeData.map((record) => ({
      ...record.toObject(),
      Employee_ID: record.Employee_ID?._id || null,
      Employee_Name: record.Employee_ID
        ? `${record.Employee_ID.First_name} ${record.Employee_ID.Last_name}`
        : null,
      Branch: record.Employee_ID?.Branch || null,
    }));

    return res.status(200).json({
      data: transformedData,
      totalRecords,
      totalPages,
      currentPage: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Get All Work From Home (Admin access - fetch all records)
// async function getAllWorkFromHomeDataForAdmin(req, res, next) {
//   try {
//     const employee = await EmployeeModel.findById(req.user.id);
//     if (!employee || employee.Role !== parseInt(UserRole.ADMIN, 10)) {
//       return res.status(403).json({
//         message: messages.error.UNAUTHORIZED_ACCESS,
//       });
//     }

//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       date,
//       branch,
//       status,
//     } = req.query;

//     // Build the base query dynamically
//     const query = {
//       $and: [
//         ...(date
//           ? [
//             {
//               Start_Date: { $lte: new Date(date) },
//               End_Date: { $gte: new Date(date) },
//             },
//           ]
//           : []),
//       ],
//     };

//     // Fetch all data without limit for calculating total records
//     let allData = await WorkFromHomeModel.find(query).populate(
//       "Employee_ID",
//       "First_name Last_name Branch"
//     );

//     // Apply search for Reason, Status, Day, First_name, and Last_name
//     if (search) {
//       const searchLower = search.toLowerCase();
//       allData = allData.filter((record) => {
//         const reason = record.Reason || "";
//         const status = record.Status || "";
//         const day = record.Day || "";
//         const firstName = record.Employee_ID?.First_name || "";
//         const lastName = record.Employee_ID?.Last_name || "";

//         return (
//           reason.toLowerCase().includes(searchLower) ||
//           status.toLowerCase().includes(searchLower) ||
//           day.toLowerCase().includes(searchLower) ||
//           firstName.toLowerCase().includes(searchLower) ||
//           lastName.toLowerCase().includes(searchLower)
//         );
//       });
//     }

//     // Helper to parse comma-separated query params into an array
//     const parseToArray = (param) =>
//       typeof param === "string"
//         ? param.split(",").map((item) => item.trim())
//         : param;

//     // Apply branch filter manually after populating the Employee details
//     if (branch) {
//       const branchArray = parseToArray(branch);
//       allData = allData.filter((record) =>
//         branchArray.some(
//           (branch) =>
//             record.Employee_ID?.Branch &&
//             record.Employee_ID.Branch.toLowerCase() === branch.toLowerCase()
//         )
//       );
//     }

//     // Apply status filter manually after populating the data if needed
//     if (status) {
//       const statusArray = parseToArray(status);
//       allData = allData.filter((record) =>
//         statusArray.some(
//           (stat) =>
//             record.Status && record.Status.toLowerCase() === stat.toLowerCase()
//         )
//       );
//     }

//     const totalRecords = allData.length;
//     const totalPages = Math.ceil(totalRecords / limit);

//     // Paginate the filtered data
//     const paginatedData = allData
//       .slice((page - 1) * limit, page * limit)
//       .sort((a, b) => new Date(b.Created_at) - new Date(a.Created_at)); // Sort by Created_at descending


//     // Transform response to include Employee_Name and Branch
//     const transformedData = paginatedData.map((record) => ({
//       ...record.toObject(),
//       Employee_ID: record.Employee_ID?._id || null,
//       Employee_Name: record.Employee_ID
//         ? `${record.Employee_ID.First_name} ${record.Employee_ID.Last_name}`
//         : null,
//       Branch: record.Employee_ID?.Branch || null,
//     }));

//     return res.status(200).json({
//       data: transformedData,
//       totalRecords,
//       totalPages,
//       currentPage: parseInt(page),
//       limit: parseInt(limit),
//     });
//   } catch (error) {
//     console.error(error);
//     return next(error);
//   }
// }

async function getAllWorkFromHomeDataForAdmin(req, res, next) {
  try {
    const employee = await EmployeeModel.findById(req.user.id);
    if (!employee || employee.Role !== parseInt(UserRole.ADMIN, 10)) {
      return res.status(403).json({ message: messages.error.UNAUTHORIZED_ACCESS });
    }

    let { page = 1, limit = 10, search = "", date, branch, status } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Build MongoDB query dynamically
    const query = {};

    if (date) {
      query.Start_Date = { $lte: new Date(date) };
      query.End_Date = { $gte: new Date(date) };
    }

    if (branch) {
      const branchArray = branch.split(",").map((b) => b.trim().toLowerCase());
      query["Employee_ID.Branch"] = { $in: branchArray };
    }

    if (status) {
      const statusArray = status.split(",").map((s) => s.trim().toLowerCase());
      query.Status = { $in: statusArray };
    }

    // Fetch all data first without search filtering
    const data = await WorkFromHomeModel.find(query)
      .populate("Employee_ID", "First_name Last_name Branch")
      .sort({ Created_at: -1 });

    // Convert data to plain objects
    let transformedData = data.map((record) => ({
      ...record.toObject(),
      Employee_ID: record.Employee_ID?._id || null,
      Employee_Name: record.Employee_ID
        ? `${record.Employee_ID.First_name} ${record.Employee_ID.Last_name}`
        : null,
      Branch: record.Employee_ID?.Branch || null,
      isEdited: record.Created_at.toString() === record.Updated_at.toString() ? false : true
    }));

    // Apply search filter in JavaScript
    if (search) {
      const searchLower = search.toLowerCase();
      transformedData = transformedData.filter((record) => {
        const reason = record.Reason || "";
        const status = record.Status || "";
        const day = record.Day || "";
        const firstName = record.Employee_Name?.split(" ")[0] || "";
        const lastName = record.Employee_Name?.split(" ")[1] || "";
        const fullName = record.Employee_Name || "";

        return (
          reason.toLowerCase().includes(searchLower) ||
          status.toLowerCase().includes(searchLower) ||
          day.toLowerCase().includes(searchLower) ||
          firstName.toLowerCase().includes(searchLower) ||
          lastName.toLowerCase().includes(searchLower) ||
          fullName.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply pagination after filtering
    const totalRecords = transformedData.length;
    const paginatedData = transformedData.slice((page - 1) * limit, page * limit);

    return res.status(200).json({
      data: paginatedData,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
      limit,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}



// Get Work From Home by ID
async function getWorkFromHomeById(req, res, next) {
  try {
    const { id } = req.params;

    const workFromHome = await WorkFromHomeModel.findById(id);

    if (!workFromHome) {
      return res.status(404).json({
        message: messages.error.WORK_FROM_HOME_NOT_FOUND,
      });
    }

    return res.status(200).json({
      data: workFromHome,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Update Work From Home by ID
async function updateWorkFromHome(req, res, next) {
  try {
    const { id } = req.params;
    const { user } = req;
    const { Status, message, ...updateData } = req.body; // Separate Status from other fields
    const employee = await EmployeeModel.findById(req.user.id);

    if (!employee) {
      return res.status(404).json({
        message: messages.error.EMPLOYEE_NOT_FOUND,
      });
    }

    // Validate the ID format
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ID format.",
      });
    }

    // Fetch the work from home record and populate the necessary fields
    const workFromHome = await WorkFromHomeModel.findById(id)
      .populate("Employee_ID") // Populate the Employee_ID to access employee data (e.g., Email)
      .populate("Email_to"); // Populate the Email_to field to access employee details

    if (!workFromHome) {
      return res.status(404).json({
        message: messages.error.WORK_FROM_HOME_NOT_FOUND,
      });
    }

    // Allowed designations for approval
    const allowedDesignations = [
      "CEO",
      "COO",
      "Vice President",
      "HR Manager",
      "Project Manager",
    ];

    // Check if the approver is authorized based on designation
    if (Status && !allowedDesignations.includes(employee.Designation)) {
      return res.status(400).json({
        message: messages.error.UNAUTHORIZED_ACCESS_APPROVED,
      });
    }

    // Ensure the approver is part of the Email_to list
    if (
      Status &&
      !workFromHome.Email_to.some(
        (email) => email._id.toString() === employee._id.toString()
      )
    ) {
      return res.status(400).json({
        message: messages.error.UNAUTHORIZED_ACCESS_APPROVED,
      });
    }

    // If we have a valid status, we proceed with the status update
    if (Status) {
      workFromHome.Status = Status;
      workFromHome.Updated_at = new Date();

      // Send email notifications
      const employeeEmail = workFromHome.Employee_ID.Email; // Now this should be populated
      const emailRecipients = workFromHome.Email_to.filter(
        (email) => email._id.toString() !== employee._id.toString()
      ) // Exclude the approver
        .map((email) => email.Email); // Map to their email addresses
      // Get the employee's name and designation from req.user
      const senderName = user.name || "HR Team"; // Default to "HR Team" if no name is available
      const designation = user.designation || "HR Manager"; // Default to "HR Manager" if no designation is available
      const approvalEmailContent = `
              <p>Dear ${workFromHome.Employee_ID.First_name},</p>
              <p>Your Work From Home request has been ${Status} by ${employee.First_name} ${employee.Last_name}.</p>
           ${Status !== 'Pending' ? `<p>${message}</p>` : ''}
       <p>Best Regards,</p>
        <p>${senderName}</p>
        <p>${designation}</p>
        <p>GVM Technologies</p>
          `;

      const notificationEmailContent = `
              <p>The Work From Home request for ${workFromHome.Employee_ID.First_name} ${workFromHome.Employee_ID.Last_name} 
              has been ${Status} by ${employee.First_name} ${employee.Last_name}.</p>
          `;

      // Send emails
      await sendEmailTo(
        employeeEmail,
        "Work From Home Request Status Updated",
        approvalEmailContent
      );
      if (emailRecipients.length > 0) {
        await sendEmailTo(
          emailRecipients,
          "Work From Home Request Update Notification",
          notificationEmailContent
        );
      }
    }

    // Update other fields
    Object.assign(workFromHome, updateData);
    const updatedWFH = await workFromHome.save();

    // find report_to for sending notification
    const employeeData = await EmployeeModel.findById(updatedWFH.Employee_ID);
    const reportTo = await EmployeeModel.findById(employeeData.Report_To);

    // for leave nottification
    const notification = {
      title: "Work From Home Status",
      message: `${employee.First_name} ${workFromHome.Status} your ${workFromHome.Day} day work from home request`,
      createdBy: employee.id,
      type: "user",
    };
    const notificationPm = {
      title: "Work From Home Status",
      message: `${employee.First_name} ${workFromHome.Status} ${employeeData.First_name} ${workFromHome.Day} day work from home request`,
      createdBy: employee.id,
      type: "user",
    };
    const notificationAdmin = {
      title: "Work From Home Status",
      message: `${reportTo.First_name} ${workFromHome.Status} ${employeeData.First_name} ${workFromHome.Day} day work from home request`,
      createdBy: employee.id,
      type: "admin",
    };

    await addNotificationInUserSection(updatedWFH.Employee_ID, notification);

    // if there is admin then notification will sent to pm other wise to admin/hr
    if (employee.Role == 0) {
      // to add notification in employee report_to id
      await addNotificationInUserSection(reportTo._id, notificationPm);
    } else {
      await addNotificationInUserSection(
        updatedWFH.Employee_ID,
        notificationAdmin
      );
    }

    // scoket for real time notification
    await emitNotification();

    return res.status(200).json({
      message: messages.success.WORK_FROM_HOME_UPDATED,
      data: workFromHome,
    });
  } catch (error) {
    console.error("Error in updateWorkFromHome:", error);
    return next(error);
  }
}

// Get All workfromhome request (Only for those employee who is related to particular project manager)
async function getAllEmployeeWorkFromHomeDataForPm(req, res, next) {
  try {
    const { id: PM_ID } = req.user; // PM's ID
    const {
      page = 1,
      limit = 10,
      date,
      search = "",
      branch,
      status,
    } = req.query; // Pagination and search query

    // Find employees who report to the PM
    const subordinates = await EmployeeModel.find({ Report_To: PM_ID }).select(
      "_id"
    );

    // if (!subordinates.length) {
    //   return res.status(200).json({
    //     data: [],
    //   });
    // }

    const subordinateIDs = subordinates.map((subordinate) => subordinate._id);

    // Create the query for work from home
    const query = {
      Employee_ID: { $in: subordinateIDs },
      $or: [
        ...(date
          ? [
            {
              Start_Date: { $lte: new Date(date) },
              End_Date: { $gte: new Date(date) },
            },
          ]
          : []),
      ],
    };

    let workFromHome = await WorkFromHomeModel.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ Start_Date: -1 }) // Sort by Start_Date descending
      .populate(
        "Employee_ID",
        "First_name Last_name" // Include only these fields from the Employee collection
      );
    // Apply search for Reason, Status, Day, First_name, and Last_name
    if (search) {
      const searchLower = search.toLowerCase();
      workFromHome = workFromHome.filter((record) => {
        const reason = record.Reason || "";
        const status = record.Status || "";
        const day = record.Day || "";
        const firstName = record.Employee_ID?.First_name || "";
        const lastName = record.Employee_ID?.Last_name || "";

        return (
          reason.toLowerCase().includes(searchLower) ||
          status.toLowerCase().includes(searchLower) ||
          day.toLowerCase().includes(searchLower) ||
          firstName.toLowerCase().includes(searchLower) ||
          lastName.toLowerCase().includes(searchLower)
        );
      });
    }



    // Helper to parse comma-separated query params into an array
    const parseToArray = (param) =>
      typeof param === "string"
        ? param.split(",").map((item) => item.trim())
        : param;

    // Apply branch filter manually after populating the Employee details
    if (branch) {
      const branchArray = parseToArray(branch);
      allData = allData.filter((record) =>
        branchArray.some(
          (branch) =>
            record.Employee_ID?.Branch &&
            record.Employee_ID.Branch.toLowerCase() === branch.toLowerCase()
        )
      );
    }

    // Apply status filter manually after populating the data if needed
    if (status) {
      const statusArray = parseToArray(status);
      allData = allData.filter((record) =>
        statusArray.some(
          (stat) =>
            record.Status && record.Status.toLowerCase() === stat.toLowerCase()
        )
      );
    }

    const totalWorkFromHome = await WorkFromHomeModel.countDocuments(query);

    // if (!workFromHome.length) {
    //   return res.status(200).json({
    //     data: [],
    //   });
    // }

    // Transform the response to include Employee_Name and replace Employee_ID with the ID string
    const transformedWorkFromHome = workFromHome.map((workFromHome) => ({
      ...workFromHome.toObject(),
      Employee_ID: workFromHome.Employee_ID?._id || null,
      Employee_Name: workFromHome.Employee_ID
        ? `${workFromHome.Employee_ID.First_name} ${workFromHome.Employee_ID.Last_name}`
        : null,
    }));

    return res.status(200).json({
      data: transformedWorkFromHome,
      totalRecords: totalWorkFromHome,
      totalPages: Math.ceil(totalWorkFromHome / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching work from home  data:", error);
    return next(error);
  }
}

// Delete Work From Home by ID
async function deleteWorkFromHome(req, res, next) {
  try {
    const { id } = req.params;

    const workFromHome = await WorkFromHomeModel.findByIdAndDelete(id);

    if (!workFromHome) {
      return res.status(404).json({
        message: messages.error.WORK_FROM_HOME_NOT_FOUND,
      });
    }

    return res.status(200).json({
      message: messages.success.WORK_FROM_HOME_DELETED,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}


// Get All Wfh On the base of employeeID
async function getAllWfhDataEmployeeBasis(req, res, next) {
  try {

    const {
      page = 1,
      limit = 10,
      search = "",
      date,
      branch,
      status,
    } = req.query;

    const { employeeId } = req.params;
    // Build the base query dynamically
    // Validate the employeeId before using it in the query
    if (employeeId && !mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employeeId" });
    }

    // Basic query to filter by employeeId
    const query = {
      $and: [
        ...(employeeId ? [{ Employee_ID: new mongoose.Types.ObjectId(employeeId) }] : []), // Filter by employeeId
        ...(date
          ? [
            {
              Start_Date: { $lte: new Date(date) },
              End_Date: { $gte: new Date(date) },
            },
          ]
          : []),
      ],
    };


    // Fetch all data without limit for calculating total records
    let allData = await WorkFromHomeModel.find(query).populate(
      "Employee_ID",
      "First_name Last_name Branch"
    );

    // Apply search for Reason, Status, Day, First_name, and Last_name
    if (search) {
      const searchLower = search.toLowerCase();
      allData = allData.filter((record) => {
        const reason = record.Reason || "";
        const status = record.Status || "";
        const day = record.Day || "";
        const firstName = record.Employee_ID?.First_name || "";
        const lastName = record.Employee_ID?.Last_name || "";

        return (
          reason.toLowerCase().includes(searchLower) ||
          status.toLowerCase().includes(searchLower) ||
          day.toLowerCase().includes(searchLower) ||
          firstName.toLowerCase().includes(searchLower) ||
          lastName.toLowerCase().includes(searchLower)
        );
      });
    }

    // Helper to parse comma-separated query params into an array
    const parseToArray = (param) =>
      typeof param === "string"
        ? param.split(",").map((item) => item.trim())
        : param;

    // Apply branch filter manually after populating the Employee details
    if (branch) {
      const branchArray = parseToArray(branch);
      allData = allData.filter((record) =>
        branchArray.some(
          (branch) =>
            record.Employee_ID?.Branch &&
            record.Employee_ID.Branch.toLowerCase() === branch.toLowerCase()
        )
      );
    }

    // Apply status filter manually after populating the data if needed
    if (status) {
      const statusArray = parseToArray(status);
      allData = allData.filter((record) =>
        statusArray.some(
          (stat) =>
            record.Status && record.Status.toLowerCase() === stat.toLowerCase()
        )
      );
    }

    const totalRecords = allData.length;
    const totalPages = Math.ceil(totalRecords / limit);

    // Paginate the filtered data
    const paginatedData = allData
      .slice((page - 1) * limit, page * limit)
      .sort((a, b) => new Date(b.Start_Date) - new Date(a.Start_Date)); // Sort by Start_Date descending

    // Transform response to include Employee_Name and Branch
    const transformedData = paginatedData.map((record) => ({
      ...record.toObject(),
      Employee_ID: record.Employee_ID?._id || null,
      Employee_Name: record.Employee_ID
        ? `${record.Employee_ID.First_name} ${record.Employee_ID.Last_name}`
        : null,
      Branch: record.Employee_ID?.Branch || null,
    }));

    return res.status(200).json({
      data: transformedData,
      totalRecords,
      totalPages,
      currentPage: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

module.exports = {
  workFromHomeAdd,
  getAllWorkFromHomeData,
  getWorkFromHomeById,
  updateWorkFromHome,
  deleteWorkFromHome,
  getAllWorkFromHomeDataForAdmin,
  getAllEmployeeWorkFromHomeDataForPm,
  getAllWfhDataEmployeeBasis
};
