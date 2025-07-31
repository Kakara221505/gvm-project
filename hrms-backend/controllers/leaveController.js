const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const LeaveModel = require("../models/Leave");
const EmployeeModel = require("../models/Employee");
const messages = require("../utils/messages");
const commonFunctions = require("../utils/commonFunctions");
const { sendEmailOTP } = require("../utils/emailUtility");
const { UserRole } = require("../utils/commonFunctions");
const mongoose = require("mongoose");
const {
  addNotificationInUserSection,
  emitNotification,
} = require("./notificationController");
const { sendEmailTo } = require("../utils/emailUtility");

// Add Leave
async function leaveAdd(req, res, next) {
  try {
    const {
      Employee_ID,
      Email_to,
      Leave_Type,
      Start_Date,
      Start_Time,
      End_Time,
      End_Date,
      Reason,
      Report_To,
      Day,
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
    const reportToEmployee = await EmployeeModel.findById(
      Report_To,
      "First_name Last_name"
    );
    if (!reportToEmployee) {
      return res.status(404).json({ message: "Report_To employee not found." });
    }

    // Calculate total days based on conditions
    let totalDays = 0;
    const startDate = new Date(Start_Date);
    const endDate = new Date(End_Date);

    if (Start_Date === End_Date) {
      totalDays = 1;
    } else if (
      Day === "Half Day (First Half)" ||
      Day === "Half Day (Second Half)"
    ) {
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

    const leaveData = {
      ...req.body,
      Created_at: new Date(),
      Updated_at: new Date(),
    };

    const newLeave = new LeaveModel(leaveData);
    await newLeave.save();

    // Prepare leave details for email
    const leaveDetails = `
      <p><strong>Leave Type:</strong> ${Leave_Type}</p>
      <p><strong>Start Date:</strong> ${Start_Date}</p>
      <p><strong>End Date:</strong> ${End_Date}</p>
      <p><strong>Reason:</strong> ${Reason}</p>
      <p><strong>Reported To:</strong> ${reportToEmployee.First_name} ${reportToEmployee.Last_name}</p>
    `;

    // Prepare email content for leave request
    for (const emp of employees) {
      const emailContent = `
      <p>Dear ${emp.First_name} ${emp.Last_name},</p>
      <p>I am writing to request your approval for my leave request from <strong>${Start_Date}</strong> to <strong>${End_Date}</strong>.</p>
      <p><strong>Reason for taking leave:</strong> ${Reason}</p>
      Mention the Dates - ${Start_Date} to ${End_Date}
      <p><strong>Total number of days:</strong> ${totalDays}</p>
      <p><strong>Leave Duration:</strong> ${Day}</p>
      <p><strong>Leave Type:</strong> ${Leave_Type}</p>
          <p>Please let me know if you require any additional information or arrangements. I appreciate your understanding and consideration.</p>
        <p>Looking forward to your approval.</p>
      <p>Best regards,<br>${emp.First_name} ${emp.Last_name}</p>
    `;

      await sendEmailTo(
        emp.Email,
        `${emp.First_name} ${emp.Last_name} - Leave Application - ${Start_Date}`,
        emailContent
      );
    }

    // for leave nottification
    const userData = await EmployeeModel.findById(Employee_ID);

    const notification = {
      title: "Leave",
      message: `${userData.First_name} request for ${req.body.Leave_Type}.`,
      createdBy: id,
      type: "admin",
    };
    const notificationUser = {
      title: "Leave",
      message: `Your ${req.body.Leave_Type} request has been submited.`,
      createdBy: id,
      type: "user",
    };

    // find report_to from employee tabel to send notification
    const reportToEmployeeId = userData.Report_To;
    const notificationPm = {
      title: "Leave",
      message: `${userData.First_name} request for ${req.body.Leave_Type}.`,
      createdBy: id,
      type: "user",
    };

    await addNotificationInUserSection(Employee_ID, notification);
    // await addNotificationInUserSection(Employee_ID, notificationUser);
    await addNotificationInUserSection(reportToEmployeeId, notificationPm);

    // scoket for real time notification
    await emitNotification();

    return res.status(200).json({
      message: messages.success.LEAVE_CREATED,
      data: newLeave,
    });
  } catch (error) {
    console.error("Error in leaveAdd:", error.message);
    return next(error);
  }
}

// Get All Leave (Only for logged-in employee)
async function getAllLeaveData(req, res, next) {
  try {
    const Employee_ID = req.user.id;
    const { page = 1, limit = 10, search = "", leaveType, status } = req.query;

    // Construct the query
    const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const query = {
      Employee_ID,

      $or: [
        { Reason: { $regex: escapedSearch, $options: "i" } }, // Case-insensitive search on Reason
        { Status: { $regex: escapedSearch, $options: "i" } }, // Case-insensitive search on Status
        { Leave_Type: { $regex: escapedSearch, $options: "i" } },
        { Day: { $regex: escapedSearch, $options: "i" } },
      ],
    };
    // Helper to parse comma-separated query params into an array
    const parseToArray = (param) =>
      typeof param === "string"
        ? param.split(",").map((item) => item.trim())
        : param;

    // Parse and handle multiple leaveType, statusfilters
    if (leaveType) {
      const leaveArray = parseToArray(leaveType);
      query.Leave_Type = { $in: leaveArray.map((b) => new RegExp(b, "i")) };
    }

    if (status) {
      const statusArray = parseToArray(status);
      query.Status = { $in: statusArray.map((b) => new RegExp(b, "i")) };
    }

    // Fetch leaves with pagination and sorting
    const leaves = await LeaveModel.find(query)
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .sort({ Created_at: -1 }) // Sort by Start_Date descending
      .populate(
        "Employee_ID",
        "First_name Last_name" // Include only these fields from the Employee collection
      )
      .populate("Report_To", "First_name Last_name");

    const totalLeaves = await LeaveModel.countDocuments(query);

    if (!leaves.length) {
      return res.status(200).json({
        data: [],
        totalRecords: 0,
        totalPages: 0,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      });
    }

    // Transform the response
    const transformedLeaves = leaves.map((leave) => ({
      ...leave.toObject(),
      Employee_ID: leave.Employee_ID?._id || null,
      Employee_Name: leave.Employee_ID
        ? `${leave.Employee_ID.First_name} ${leave.Employee_ID.Last_name}`
        : null,
      Reported_To: leave.Report_To?._id || null, // Return only the Report_To's _id
      Reported_Person_Name: leave.Report_To
        ? `${leave.Report_To.First_name} ${leave.Report_To.Last_name}`
        : null,
    }));

    return res.status(200).json({
      data: transformedLeaves,
      totalRecords: totalLeaves,
      totalPages: Math.ceil(totalLeaves / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Get All Leave (Only for those employee who is related to particular project manager)
async function getAllEmployeeLeaveDataForPm(req, res, next) {
  try {
    const { id: PM_ID } = req.user; // PM's ID
    const {
      page = 1,
      limit = 10,
      search = "",
      branch,
      date,
      leaveType,
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

    // Create the query for leaves
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

    // Helper to parse comma-separated query params into an array
    const parseToArray = (param) =>
      typeof param === "string"
        ? param.split(",").map((item) => item.trim())
        : param;

    // Parse and handle multiple leaveType, statusfilters
    if (leaveType) {
      const leaveArray = parseToArray(leaveType);
      query.Leave_Type = { $in: leaveArray.map((b) => new RegExp(b, "i")) };
    }

    if (status) {
      const statusArray = parseToArray(status);
      query.Status = { $in: statusArray.map((b) => new RegExp(b, "i")) };
    }

    let leaves = await LeaveModel.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ Start_Date: -1 }) // Sort by Start_Date descending
      .populate(
        "Employee_ID",
        "First_name Last_name" // Include only these fields from the Employee collection
      )
      .populate("Report_To", "First_name Last_name");

    if (search) {
      const searchLower = search.toLowerCase();
      leaves = leaves.filter((record) => {
        const reason = record.Reason || "";
        const status = record.Status || "";
        const leaveType = record.Leave_Type || "";
        const day = record.Day || "";
        const firstName = record.Employee_ID?.First_name || "";
        const lastName = record.Employee_ID?.Last_name || "";

        return (
          reason.toLowerCase().includes(searchLower) ||
          status.toLowerCase().includes(searchLower) ||
          leaveType.toLowerCase().includes(searchLower) ||
          day.toLowerCase().includes(searchLower) ||
          firstName.toLowerCase().includes(searchLower) ||
          lastName.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply branch filter manually after populating the Employee data
    if (branch) {
      leaves = leaves.filter((leave) => leave.Employee_ID?.Branch === branch);
    }

    const totalLeaves = await LeaveModel.countDocuments(query);

    // if (!leaves.length) {
    //   return res.status(200).json({
    //     data: [],
    //   });
    // }

    // Transform the response to include Employee_Name and replace Employee_ID with the ID string
    const transformedLeaves = leaves.map((leave) => ({
      ...leave.toObject(),
      Employee_ID: leave.Employee_ID?._id || null,
      Employee_Name: leave.Employee_ID
        ? `${leave.Employee_ID.First_name} ${leave.Employee_ID.Last_name}`
        : null,
      Reported_To: leave.Report_To?._id || null, // Return only the Report_To's _id
      Reported_Person_Name: leave.Report_To
        ? `${leave.Report_To.First_name} ${leave.Report_To.Last_name}`
        : null,
    }));

    return res.status(200).json({
      data: transformedLeaves,
      totalRecords: totalLeaves,
      totalPages: Math.ceil(totalLeaves / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching leave data:", error);
    return next(error);
  }
}

// Get All Leave (Admin: Fetch all leaves in DB)
async function getAllLeaveDataForAdmin(req, res, next) {
  try {
    const employee = await EmployeeModel.findById(req.user.id);
    if (!employee || employee.Role !== parseInt(UserRole.ADMIN, 10)) {
      return res.status(403).json({
        message: messages.error.UNAUTHORIZED_ACCESS,
      });
    }

    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      search = "",
      branch,
      date,
      leaveType,
      status,
    } = req.query;

    // Construct the base query
    const query = {
      $and: [
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

    // Helper to parse comma-separated query params into an array
    const parseToArray = (param) =>
      typeof param === "string"
        ? param.split(",").map((item) => item.trim())
        : param;

    // Handle multiple leaveType and status filters
    if (leaveType) {
      const leaveArray = parseToArray(leaveType);
      query.Leave_Type = { $in: leaveArray.map((b) => new RegExp(b, "i")) };
    }

    if (status) {
      const statusArray = parseToArray(status);
      query.Status = { $in: statusArray.map((b) => new RegExp(b, "i")) };
    }

    // Fetch all matching records without pagination
    let leaves = await LeaveModel.find(query)
      .sort({ Created_at: -1 }) // Sort by Created_at descending
      .populate("Employee_ID", "First_name Last_name Branch") // Include Branch field from Employee
      .populate("Report_To", "First_name Last_name");

    // Apply search filter manually after fetching all records
    if (search) {
      const searchLower = search.toLowerCase();
      leaves = leaves.filter((record) => {
        const reason = record.Reason || "";
        const status = record.Status || "";
        const leaveType = record.Leave_Type || "";
        const day = record.Day || "";
        const firstName = record.Employee_ID?.First_name || "";
        const lastName = record.Employee_ID?.Last_name || "";
        const branch = record.Employee_ID?.Branch || "";
        const fullName = `${firstName} ${lastName}`.trim(); // Full name search

        return (
          reason.toLowerCase().includes(searchLower) ||
          status.toLowerCase().includes(searchLower) ||
          leaveType.toLowerCase().includes(searchLower) ||
          day.toLowerCase().includes(searchLower) ||
          firstName.toLowerCase().includes(searchLower) ||
          lastName.toLowerCase().includes(searchLower) ||
          fullName.toLowerCase().includes(searchLower) || // Full name search
          branch.toLowerCase().includes(searchLower) // Branch search
        );
      });
    }

    // Apply branch filter manually after populating Employee data
    if (branch) {
      leaves = leaves.filter((leave) => leave.Employee_ID?.Branch === branch);
    }

    // Total records after filtering
    const totalRecords = leaves.length;
    const totalPages = Math.ceil(totalRecords / parseInt(limit));

    // Apply pagination manually
    const paginatedLeaves = leaves.slice((page - 1) * limit, page * limit);

    // Transform the response
    const transformedLeaves = paginatedLeaves.map((leave) => ({
      ...leave.toObject(),
      Employee_ID: leave.Employee_ID?._id || null,
      Employee_Name: leave.Employee_ID
        ? `${leave.Employee_ID.First_name} ${leave.Employee_ID.Last_name}`
        : null,
      Branch: leave.Employee_ID?.Branch || null, // Add Branch from Employee
      Reported_To: leave.Report_To?._id || null,
      Reported_Person_Name: leave.Report_To
        ? `${leave.Report_To.First_name} ${leave.Report_To.Last_name}`
        : null,
      isEdited: leave.Created_at.toString() === leave.Updated_at.toString() ? false : true
    }));

    return res.status(200).json({
      data: transformedLeaves,
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

// Get Leave by ID
async function getLeaveById(req, res, next) {
  try {
    const { id } = req.params;
    const leave = await LeaveModel.findById(id);

    if (!leave) {
      return res.status(404).json({
        message: messages.error.LEAVE_NOT_FOUND,
      });
    }

    return res.status(200).json({
      message: messages.success.LEAVE_FETCHED,
      data: leave,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Update Leave by ID
async function updateLeave(req, res, next) {
  try {
    const { id } = req.params;
    const { user } = req;
    const { Status, Approved_By, message, ...otherUpdates } = req.body;
    const Employee_ID = req.user;

    // Fetch the employee making the request
    const employee = await EmployeeModel.findById(Employee_ID.id);

    if (!employee) {
      return res.status(404).json({
        message: messages.error.EMPLOYEE_NOT_FOUND,
      });
    }

    // Allowed designations for leave approval
    const allowedDesignations = [
      "CEO",
      "COO",
      "Vice President",
      "HR Manager",
      "Project Manager",
    ];

    // Fetch the leave request
    const leaveRequest = await LeaveModel.findById(id)
      .populate("Email_to")
      .populate("Employee_ID");
    if (!leaveRequest) {
      return res.status(404).json({
        message: messages.error.LEAVE_NOT_FOUND,
      });
    }
    // Check if the approver is authorized based on designation
    if (!allowedDesignations.includes(employee.Designation)) {
      return res.status(403).json({
        message: messages.error.UNAUTHORIZED_ACCESS_APPROVED,
      });
    }

    // Ensure the approver is part of the Email_to list
    if (
      !leaveRequest.Email_to.some(
        (email) => email._id.toString() === employee._id.toString()
      )
    ) {
      return res.status(403).json({
        message: messages.error.UNAUTHORIZED_ACCESS_APPROVED,
      });
    }

    // Update the leave request
    const updateData = {
      ...otherUpdates,
      Status: Status || leaveRequest.Status,
      Approved_By: employee._id,
      Updated_at: new Date(),
    };

    const updatedLeave = await LeaveModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedLeave) {
      return res.status(404).json({
        message: messages.error.LEAVE_NOT_FOUND,
      });
    }

    // Send approval email to the employee and other recipients in the Email_to list
    const employeeEmail = leaveRequest.Employee_ID.Email;
    const Leave_Type = leaveRequest.Leave_Type;
    
    const emailRecipients = leaveRequest.Email_to.filter(
      (email) => email._id.toString() !== employee._id.toString()
    ) // Exclude approver
      .map((email) => email.Email);
    // Get the employee's name and designation from req.user
    const senderName = user.name || "HR Team"; // Default to "HR Team" if no name is available
    const designation = user.designation || "HR Manager"; // Default to "HR Manager" if no designation is available

    // Email Content
    const approvalEmailContent = `
        <p>Hello ${leaveRequest.Employee_ID.First_name},</p>
        <p>Your leave request has been ${Status} by ${employee.First_name} ${
      employee.Last_name
    }.</p>
         ${Status !== "Pending" ? `<p>${message}</p>` : ""}
       <p>Best Regards,</p>
        <p>${senderName}</p>
        <p>${designation}</p>
        <p>GVM Technologies</p>
    `;

    const notificationEmailContent = `
        <p>The leave request for ${leaveRequest.Employee_ID.First_name} ${leaveRequest.Employee_ID.Last_name} 
        has been ${Status} by ${employee.First_name} ${employee.Last_name}.</p>
    `;

    // Send emails
    await sendEmailTo(
      employeeEmail,
      `Leave Request ${Status}`,
      approvalEmailContent
    );
    if (emailRecipients.length > 0) {
      await sendEmailTo(
        emailRecipients,
        "Leave Request Approval Notification",
        notificationEmailContent
      );
    }

    // find report_to for sending notification
    const employeeData = await EmployeeModel.findById(updatedLeave.Employee_ID);
    const reportTo = await EmployeeModel.findById(employeeData.Report_To);

    // for leave nottification
    const notification = {
      title: "Leave",
      message: `${employee.First_name} ${req.body.Status} your ${Leave_Type} request`,
      createdBy: employee._id,
      type: "user",
    };
    const notificationPm = {
      title: "Leave",
      message: `${employee.First_name} ${req.body.Status} ${employeeData.First_name} ${Leave_Type} request`,
      createdBy: employee._id,
      type: "user",
    };
    const notificationAdmin = {
      title: "Leave",
      message: `${reportTo.First_name} ${req.body.Status} ${employeeData.First_name} ${Leave_Type} request`,
      createdBy: employee._id,
      type: "admin",
    };

    await addNotificationInUserSection(updatedLeave.Employee_ID, notification);

    // if there is admin then notification will sent to pm other wise to admin/hr
    if (employee.Role == 0) {
      // to add notification in employee report_to id
      await addNotificationInUserSection(reportTo._id, notificationPm);
    } else {
      await addNotificationInUserSection(
        updatedLeave.Employee_ID,
        notificationAdmin
      );
    }

    // scoket for real time notification
    await emitNotification();

    // Return success response
    return res.status(200).json({
      message: messages.success.LEAVE_UPDATED,
      data: updatedLeave,
    });
  } catch (error) {
    console.error("Error in updateLeave:", error);
    return next(error);
  }
}

// Delete Leave by ID
async function deleteLeave(req, res, next) {
  try {
    const { id } = req.params;

    const deletedLeave = await LeaveModel.findByIdAndDelete(id);
    if (!deletedLeave) {
      return res.status(404).json({
        message: messages.error.LEAVE_NOT_FOUND,
      });
    }

    return res.status(200).json({
      message: messages.success.LEAVE_DELETED,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Get All Leave On the base of employeeID
async function getAllLeaveDataEmployeeBasis(req, res, next) {
  try {
    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      search = "",
      branch,
      date,
      leaveType,
      status,
    } = req.query;
    const { employeeId } = req.params;

    // Validate the employeeId before using it in the query
    if (employeeId && !mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employeeId" });
    }

    // Basic query to filter by employeeId
    const query = {
      $and: [
        ...(employeeId
          ? [{ Employee_ID: new mongoose.Types.ObjectId(employeeId) }]
          : []), // Filter by employeeId
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

    // Helper function to parse comma-separated query params into an array
    const parseToArray = (param) =>
      typeof param === "string"
        ? param.split(",").map((item) => item.trim())
        : param;

    // Parse and handle multiple leaveType, status filters
    if (leaveType) {
      const leaveArray = parseToArray(leaveType);
      query.Leave_Type = { $in: leaveArray.map((b) => new RegExp(b, "i")) };
    }

    if (status) {
      const statusArray = parseToArray(status);
      query.Status = { $in: statusArray.map((b) => new RegExp(b, "i")) };
    }

    // Fetch data with pagination and sorting
    let leaves = await LeaveModel.find(query)
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .sort({ Start_Date: -1 }) // Sort by Start_Date descending
      .populate(
        "Employee_ID",
        "First_name Last_name Branch" // Include Branch field from Employee
      )
      .populate("Report_To", "First_name Last_name");

    if (search) {
      const searchLower = search.toLowerCase();
      leaves = leaves.filter((record) => {
        const reason = record.Reason || "";
        const status = record.Status || "";
        const leaveType = record.Leave_Type || "";
        const day = record.Day || "";
        const firstName = record.Employee_ID?.First_name || "";
        const lastName = record.Employee_ID?.Last_name || "";

        return (
          reason.toLowerCase().includes(searchLower) ||
          status.toLowerCase().includes(searchLower) ||
          leaveType.toLowerCase().includes(searchLower) ||
          day.toLowerCase().includes(searchLower) ||
          firstName.toLowerCase().includes(searchLower) ||
          lastName.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply branch filter manually after populating the Employee data
    if (branch) {
      leaves = leaves.filter((leave) => leave.Employee_ID?.Branch === branch);
    }

    // Count total records before pagination
    const totalRecords = await LeaveModel.countDocuments(query);

    if (!leaves.length) {
      return res.status(200).json({
        data: [],
        totalRecords: 0,
        totalPages: 0,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      });
    }

    // Transform the response
    const transformedLeaves = leaves.map((leave) => ({
      ...leave.toObject(),
      Employee_ID: leave.Employee_ID?._id || null,
      Employee_Name: leave.Employee_ID
        ? `${leave.Employee_ID.First_name} ${leave.Employee_ID.Last_name}`
        : null,
      Branch: leave.Employee_ID?.Branch || null, // Add Branch from Employee
      Reported_To: leave.Report_To?._id || null,
      Reported_Person_Name: leave.Report_To
        ? `${leave.Report_To.First_name} ${leave.Report_To.Last_name}`
        : null,
    }));

    return res.status(200).json({
      data: transformedLeaves,
      totalRecords, // Total number of records before pagination
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

module.exports = {
  leaveAdd,
  getAllLeaveData,
  getAllLeaveDataForAdmin,
  getLeaveById,
  updateLeave,
  getAllEmployeeLeaveDataForPm,
  deleteLeave,
  getAllLeaveDataEmployeeBasis,
};
