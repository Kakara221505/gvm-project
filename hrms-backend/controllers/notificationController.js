const { validationResult } = require("express-validator");
const messages = require("../utils/messages");
const GlobalNotification = require("../models/NotificationMaster");
const Employee = require("../models/Employee");
const { connectedUsers, io } = require("../app");
const moment = require("moment");
const Leave = require("../models/Leave");
const { sendEmailTo, sendMailWithCC } = require("../utils/emailUtility");
const WorkFromHome = require("../models/WorkFromHome");

async function addNotification(req, res, next) {
  const { title, message } = req.body;
  const { id } = req.user;
  try {
    const notification = await GlobalNotification.create({
      title,
      message,
      createdBy: id,
    });
    res.status(200).json({
      message: messages.success.NOTIFICATION_CREATED,
      data: {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
      },
    });
  } catch (error) {
    console.error("Error in add notification:", error);
    return next(error);
  }
}

async function getUsersNotification(req, res, next) {
  const { id } = req.user;
  const { page = 1, limit = 10 } = req.query;

  try {
    const user = await Employee.findById(id).lean();

    if (!user)
      return res
        .status(404)
        .json({ message: messages.error.EMPLOYEE_NOT_FOUND });

    const personalNotifications = (user.notifications || [])
      .filter((notif) => notif.type === "user")
      .map((notif) => ({
        ...notif,
        //   isGlobal: false,
      }));

    // Fetch global notifications
    const globalNotifications = await GlobalNotification.find().lean();
    const updatedGlobalNotifications = globalNotifications
      .map((notif) => {
        const isRead = notif.readBy.map(String).includes(String(id));
        return {
          ...notif,
          read: isRead, // Dynamically determine read status
          // isGlobal: true,
        };
      })
      .filter((notif) => {
        // Exclude birthday & work anniversary notifications for this user
        if (
          (notif.type === "birthday" || notif.type === "workAnniversary") &&
          notif.userId?.toString() === id.toString()
        ) {
          return false;
        }
        return true;
      });

    // Combine personal and global notifications
    const allNotifications = [
      ...personalNotifications,
      ...updatedGlobalNotifications,
    ];

    // Sort notifications by date in descending order
    allNotifications.sort((a, b) => {
      const dateA = new Date(a.created_at || a.Created_at || a.date).getTime();
      const dateB = new Date(b.created_at || b.Created_at || b.date).getTime();
      return dateB - dateA;
    });

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedNotifications = allNotifications.slice(startIndex, endIndex);

    // Calculate unread count
    const unreadCount = allNotifications.filter((notif) => !notif.read).length;

    res.status(200).json({
      message: messages.success.NOTIFICATION_FETCHED,
      data: paginatedNotifications,
      unreadCount,
      totalNotifications: allNotifications.length,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(allNotifications.length / limit),
    });
  } catch (error) {
    console.error("Error in get notification:", error);
    return next(error);
  }
}

async function markAllNotificationAsRead(req, res, next) {
  const { id } = req.user;

  try {
    // Mark all personal notifications as read
    await Employee.updateOne(
      { _id: id, "notifications.read": false },
      { $set: { "notifications.$[elem].read": true } },
      { arrayFilters: [{ "elem.read": false }] }
    );

    // Add the user to the readBy field for all global notifications
    await GlobalNotification.updateMany(
      { readBy: { $ne: id } },
      { $addToSet: { readBy: id } }
    );

    res
      .status(200)
      .json({ message: messages.success.NOTIFICATION_MARKED_READ });
  } catch (error) {
    console.error("Error in mark read notification:", error);
    return next(error);
  }
}

async function markNotificationReadById(req, res, next) {
  const { id } = req.user;
  const { notifyId } = req.params;

  try {
    const globalNotification = await GlobalNotification.findOne({
      _id: notifyId,
    });

    if (globalNotification) {
      await GlobalNotification.updateOne(
        { _id: notifyId, readBy: { $ne: id } }, // Only if not already read by the user
        { $addToSet: { readBy: id } } // Add user ID to readBy array
      );
      return res
        .status(200)
        .json({ message: "Global notification marked as read." });
    }

    const employeeWithNotification = await Employee.findOne({
      "notifications._id": notifyId, // Find a user with the notification
    });

    if (employeeWithNotification) {
      await Employee.updateOne(
        { _id: employeeWithNotification._id, "notifications._id": notifyId },
        { $set: { "notifications.$.read": true } }
      );
      return res.status(200).json({
        message: `Personal notification marked as read for user ${employeeWithNotification._id}.`,
      });
    }

    // If the notification is not found in either
    return res.status(200).json({ message: "Notification not found" });
  } catch (error) {
    console.error("Error in marking notification as read:", error);
    return next(error);
  }
}

async function addNotificationInUserSection(userId, notification) {
  try {
    // Find the user by ID
    const user = await Employee.findById(userId);

    // Ensure the notifications array exists
    if (!Array.isArray(user.notifications)) {
      user.notifications = [];
    }

    // Add the notification to the notifications array
    user.notifications.push({
      title: notification.title,
      message: notification.message,
      createdBy: notification.createdBy,
      type: notification.type,
    });

    await user.save();

    return {
      message: messages.success.NOTIFICATION_ADDED_TO_USER,
      data: user,
    };
  } catch (error) {
    console.error("Error adding notification in user array:", error);
    return {
      message: error.message || "Failed to add notification",
    };
  }
}

// HR means - management/admin
async function getAllHRNotification(req, res, next) {
  // ensure user is hr/management/vp/admin
  const { id } = req.user;
  const { page = 1, limit = 10 } = req.query;

  try {
    const user = await Employee.findById(id).lean();

    if (!user)
      return res
        .status(404)
        .json({ message: messages.error.EMPLOYEE_NOT_FOUND });

    // Fetch HR's own notifications
    const hrNotifications = (user.notifications || []).map((notif) => ({
      _id: notif._id,
      title: notif.title,
      message: notif.message,
      createdBy: notif.createdBy,
      date: notif.date,
      read: notif.read,
      type: notif.type || null,
    }));

    // Fetch leave notifications from other users
    const leaveNotifications = await Employee.aggregate([
      { $unwind: "$notifications" },
      {
        $match: {
          "notifications.type": "admin",
          _id: { $ne: user._id }, // Exclude HR's own notifications
        },
      },
      {
        $project: {
          userId: "$_id",
          _id: "$notifications._id",
          title: "$notifications.title",
          message: "$notifications.message",
          createdBy: "$notifications.createdBy",
          date: "$notifications.date",
          type: "$notifications.type",
          read: "$notifications.read",
        },
      },
    ]);

    // Fetch global notifications
    const globalNotifications = await GlobalNotification.find().lean();
    const updatedGlobalNotifications = globalNotifications
      .map((notif) => {
        const isRead = notif.readBy.map(String).includes(String(id));
        return {
          ...notif,
          read: isRead, // Dynamically determine read status
          // isGlobal: true,
        };
      })
      .filter((notif) => {
        // Exclude birthday & work anniversary notifications for this user
        if (
          (notif.type === "birthday" || notif.type === "workAnniversary") &&
          notif.userId?.toString() === id.toString()
        ) {
          return false;
        }
        return true;
      });

    // Combine HR's notifications with leave notifications
    const allNotifications = [
      ...hrNotifications,
      ...leaveNotifications,
      ...updatedGlobalNotifications,
    ];

    // Sort notifications by date in descending order
    allNotifications.sort((a, b) => {
      const dateA = new Date(a.created_at || a.Created_at || a.date).getTime();
      const dateB = new Date(b.created_at || b.Created_at || b.date).getTime();
      return dateB - dateA;
    });

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedNotifications = allNotifications.slice(startIndex, endIndex);

    // Calculate unread count
    const unreadCount = allNotifications.filter((notif) => !notif.read).length;

    res.status(200).json({
      message: messages.success.NOTIFICATION_FETCHED,
      data: paginatedNotifications,
      unreadCount,
      totalNotifications: allNotifications.length,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(allNotifications.length / limit),
    });
  } catch (error) {
    console.error("Error in get notification:", error);
    return next(error);
  }
}

// pm notifications
async function getAllPMNotification(req, res, next) {
  // ensure user is pm
  const { id } = req.user;
  const { page = 1, limit = 10 } = req.query;

  try {
    const user = await Employee.findById(id).lean();

    if (!user)
      return res
        .status(404)
        .json({ message: messages.error.EMPLOYEE_NOT_FOUND });

    // Fetch PM's own notifications
    const pmNotifications = (user.notifications || []).map((notif) => ({
      _id: notif._id,
      title: notif.title,
      message: notif.message,
      createdBy: notif.createdBy,
      date: notif.date,
      read: notif.read,
      type: notif.type || null,
    }));

    // Fetch global notifications
    const globalNotifications = await GlobalNotification.find().lean();
    const updatedGlobalNotifications = globalNotifications
      .map((notif) => {
        const isRead = notif.readBy.map(String).includes(String(id));
        return {
          ...notif,
          read: isRead, // Dynamically determine read status
          // isGlobal: true,
        };
      })
      .filter((notif) => {
        // Exclude birthday & work anniversary notifications for this user
        if (
          (notif.type === "birthday" || notif.type === "workAnniversary") &&
          notif.userId?.toString() === id.toString()
        ) {
          return false;
        }
        return true;
      });

    // Combine PM's notifications with global notification
    const allNotifications = [
      ...pmNotifications,
      ...updatedGlobalNotifications,
    ];

    // Sort notifications by date in descending order
    allNotifications.sort((a, b) => {
      const dateA = new Date(a.created_at || a.Created_at || a.date).getTime();
      const dateB = new Date(b.created_at || b.Created_at || b.date).getTime();
      return dateB - dateA;
    });

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedNotifications = allNotifications.slice(startIndex, endIndex);

    // Calculate unread count
    const unreadCount = allNotifications.filter((notif) => !notif.read).length;

    res.status(200).json({
      message: messages.success.NOTIFICATION_FETCHED,
      data: paginatedNotifications,
      unreadCount,
      totalNotifications: allNotifications.length,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(allNotifications.length / limit),
    });
  } catch (error) {
    console.error("Error in get notification:", error);
    return next(error);
  }
}

function emitNotification() {
  for (socketId of connectedUsers) {
    io.to(socketId).emit("notification", true);
  }
}

function emitAttendanceNotification() {
  for (socketId of connectedUsers) {
    io.to(socketId).emit("attendance", true);
  }
}

async function sendBirthdayNotifications() {
  try {
    const today = moment().format("MM-DD");

    const employees = await Employee.find().lean();

    // Identify employees whose birthday matches today's date
    const birthdayEmployees = employees.filter((emp) => {
      const dob = moment(emp.Date_of_birth).format("MM-DD");
      return dob === today;
    });

    if (birthdayEmployees.length === 0) {
      console.log("No birthdays today.");
      return;
    }

    for (const birthdayEmployee of birthdayEmployees) {
      const birthdayEmployeeId = birthdayEmployee._id.toString();

      // notification message
      const notificationMessage = `${birthdayEmployee.First_name} ${birthdayEmployee.Last_name} has a birthday today! 🎉`;
      const notificationMessageUser = `Wish you a very happy birthday ${birthdayEmployee.First_name} ${birthdayEmployee.Last_name}! 🎉`;

      const notification = new GlobalNotification({
        title: ` ${birthdayEmployee.First_name}'s Birthday 🎉`,
        message: notificationMessage,
        userId: birthdayEmployeeId,
        type: "birthday",
      });
      const notificationForUser = {
        title: `Happy Birthday 🎉 ${birthdayEmployee.First_name}`,
        message: notificationMessageUser,
        createdBy: birthdayEmployeeId,
        type: "user",
      };
      // add birthday notification for particular user
      await addNotificationInUserSection(
        birthdayEmployeeId,
        notificationForUser
      );

      // Save the notification in the database
      await notification.save();
      // scoket for real time notification
      await emitNotification();

      console.log(
        `Birthday notification sent for: ${birthdayEmployee.First_name}`
      );
    }
  } catch (error) {
    console.error("Error sending birthday notifications:", error);
  }
}

async function sendAnniversaryNotifications() {
  try {
    const today = moment().format("MM-DD");

    const employees = await Employee.find().lean();

    // Identify employees whose birthday matches today's date
    const workAnniversaryEmployees = employees.filter((emp) => {
      const dob = moment(emp.Date_of_join).format("MM-DD");
      return dob === today;
    });

    if (workAnniversaryEmployees.length === 0) {
      console.log("No work anniversary today.");
      return;
    }

    for (let i = 0; i < workAnniversaryEmployees.length; i++) {
      const workAnniversaryEmployee = workAnniversaryEmployees[i];
      const workAnniversaryEmployeeId = workAnniversaryEmployee._id.toString();

      //delay of 1 minutes between notifications
      const delay = i * 1 * 60 * 1000;

      setTimeout(async () => {
        try {
          // notification message
          const notificationMessage = `${workAnniversaryEmployee.First_name} ${workAnniversaryEmployee.Last_name} has work anniversary today! 🎉`;
          const notificationMessageUser = `Wish you a very happy work anniversary ${workAnniversaryEmployee.First_name} ${workAnniversaryEmployee.Last_name}! 🎉`;

          const notification = new GlobalNotification({
            title: `${workAnniversaryEmployee.First_name}'s Work Anniversary 🎉`,
            message: notificationMessage,
            userId: workAnniversaryEmployeeId,
            type: "workAnniversary",
          });
          const notificationForUser = {
            title: `Happy Work Anniversary 🎉 ${workAnniversaryEmployee.First_name}`,
            message: notificationMessageUser,
            createdBy: workAnniversaryEmployeeId,
            type: "user",
          };
          // add birthday notification for particular user
          await addNotificationInUserSection(
            workAnniversaryEmployeeId,
            notificationForUser
          );

          // Save the notification in the database
          await notification.save();
          // scoket for real time notification
          await emitNotification();

          console.log(
            `Work Anniversary notification sent for: ${workAnniversaryEmployee.First_name}`
          );
        } catch (error) {
          console.error(
            `Error sending notification for ${workAnniversaryEmployee.First_name}:`,
            error
          );
        }
      }, delay);
    }
  } catch (error) {
    console.error("Error sending work anniversary notifications:", error);
  }
}

const sendMailForLeave = async (employeeInfo, leaveInfo) => {
  const ccMails = [
    "hardi1@gvmtechnologies.com",
    "sweeta1@gvmtechnologies.com",
    "pragya1@gvmtechnologies.com",
    "arun@gvmtechnologies.com",
  ];
  const emailContent = `
  <p>Dear Team,</p>
  <p>${employeeInfo.First_name}'s Leave request is still ${leaveInfo.Status}. Please look forward!</p>
  <p>Thankyou!</p>
`;

  await sendMailWithCC(
    employeeInfo.Report_To.Email,
    `${employeeInfo.First_name} ${employeeInfo.Last_name} - Leave Application Follow up`,
    emailContent,
    ccMails
  );
};

async function leaveReminder() {
  try {
    // today will be one day afetr date form date now()
    const today = await moment().add(1, "days").format("MM-DD-YYYY");

    const leaveData = await Leave.find().lean();

    const employeeLeaves = await leaveData.filter((emp) => {
      const startDate = moment(emp.Start_Date).format("MM-DD-YYYY");
      return startDate === today && emp.Status == "Pending";
    });

    if (employeeLeaves.length === 0) {
      console.log("No leaves found for tomorrow.");
      return;
    }

    for (let i = 0; i < employeeLeaves.length; i++) {
      const employeeLeave = employeeLeaves[i];
      const employeeLeaveId = employeeLeave._id.toString();
      const employeeID = employeeLeave.Employee_ID;
      const employeeInfo = await Employee.find(employeeID).lean().populate({
        path: "Report_To",
        select: "First_name Last_name Email",
      });

      //delay of 1 minutes between notifications
      const delay = i * 1 * 60 * 1000;

      setTimeout(async () => {
        try {
          const notificationAdmin = {
            title: `Leave Status`,
            message: `${employeeInfo[0].First_name}'s ${employeeLeave.Leave_Type} request is still ${employeeLeave.Status}.`,
            createdBy: employeeID,
            type: "admin",
          };
          const notificationPm = {
            title: `Leave Status`,
            message: `${employeeInfo[0].First_name}'s ${employeeLeave.Leave_Type} request is still ${employeeLeave.Status}.`,
            createdBy: employeeID,
            type: "user",
          };
          sendMailForLeave(employeeInfo[0], employeeLeave);

          await addNotificationInUserSection(employeeID, notificationAdmin);
          await addNotificationInUserSection(
            employeeInfo[0].Report_To,
            notificationPm
          );

          // scoket for real time notification
          await emitNotification();

          console.log(
            `Leave reminder sent for: ${employeeInfo[0].First_name} to PM and Admin`
          );
        } catch (error) {
          console.error(
            `Error sending leave reminder notification for ${employeeInfo[0].First_name}:`,
            error
          );
        }
      }, delay);
    }
  } catch (error) {
    console.error("Error sending wfh notifications:", error);
  }
}

const sendMailForWFH = async (employeeInfo, wfhInfo) => {
  const ccMails = [
    "hardi1@gvmtechnologies.com",
    "sweeta1@gvmtechnologies.com",
    "pragya1@gvmtechnologies.com",
    "arun@gvmtechnologies.com",
  ];
  const emailContent = `
  <p>Dear Team,</p>
  <p>${employeeInfo.First_name}'s work from home request is still ${wfhInfo.Status}. Please look forward!</p>
  <p>Thankyou!</p>
`;

  await sendMailWithCC(
    employeeInfo.Report_To.Email,
    `${employeeInfo.First_name} ${employeeInfo.Last_name} - Work from home request Follow up`,
    emailContent,
    ccMails
  );
};

async function wfhReminder() {
  try {
    // today will be one day afetr date form date now()
    const today = await moment().add(1, "days").format("MM-DD-YYYY");

    const wfhData = await WorkFromHome.find().lean();

    const employeesWfh = await wfhData.filter((emp) => {
      const startDate = moment(emp.Start_Date).format("MM-DD-YYYY");
      return startDate === today && emp.Status == "Pending";
    });

    if (employeesWfh.length === 0) {
      console.log("No Work from home request found for tomorrow.");
      return;
    }

    for (let i = 0; i < employeesWfh.length; i++) {
      const employeeWfh = employeesWfh[i];
      const employeeID = employeeWfh.Employee_ID;
      const employeeInfo = await Employee.find(employeeID).lean().populate({
        path: "Report_To",
        select: "First_name Last_name Email",
      });

      //delay of 1 minutes between notifications
      const delay = i * 1 * 60 * 1000;

      setTimeout(async () => {
        try {
          const notificationAdmin = {
            title: `Work From Home Status`,
            message: `${employeeInfo[0].First_name}'s ${employeeWfh.Day} day work from home request is still ${employeeWfh.Status}.`,
            createdBy: employeeID,
            type: "admin",
          };
          const notificationPm = {
            title: `Work From Home Status`,
            message: `${employeeInfo[0].First_name}'s ${employeeWfh.Day} day work from home request is still ${employeeWfh.Status}.`,
            createdBy: employeeID,
            type: "user",
          };
          sendMailForWFH(employeeInfo[0], employeeWfh);

          await addNotificationInUserSection(employeeID, notificationAdmin);
          await addNotificationInUserSection(
            employeeInfo[0].Report_To,
            notificationPm
          );

          // scoket for real time notification
          await emitNotification();

          console.log(
            `WFH reminder sent for: ${employeeInfo[0].First_name} to PM and Admin`
          );
        } catch (error) {
          console.error(
            `Error sending wfh reminder notification for ${employeeInfo[0].First_name}:`,
            error
          );
        }
      }, delay);
    }
  } catch (error) {
    console.error("Error sending wfh notifications:", error);
  }
}

const sendMailForwfhCodePushReminder = async (employeeInfo) => {
  const ccMails = [
    `${employeeInfo.Report_To.Email}`,
    "hardi1@gvmtechnologies.com",
    "sweeta1@gvmtechnologies.com",
    "pragya1@gvmtechnologies.com",
    "arun@gvmtechnologies.com",
  ];
  const emailContent = `
  <p>Dear ${employeeInfo.First_name},</p>
  <p>Make sure to push and commit your code before leaving the office.</p>
  <p>Thankyou!</p>
`;

  await sendMailWithCC(
    employeeInfo.Email,
    `${employeeInfo.First_name} ${employeeInfo.Last_name} - Work from home request Follow up`,
    emailContent,
    ccMails
  );
};

async function wfhCodePushReminder() {
  try {
    // today will be one day afetr date form date now()
    const today = await moment().add(1, "days").format("MM-DD-YYYY");

    const wfhData = await WorkFromHome.find().lean();

    const employeesWfh = await wfhData.filter((emp) => {
      const startDate = moment(emp.Start_Date).format("MM-DD-YYYY");
      return startDate === today && emp.Status == "Approved";
    });

    if (employeesWfh.length === 0) {
      console.log(
        "No Work from home request found for tomorrow. to commit and push code reminder."
      );
      return;
    }

    for (let i = 0; i < employeesWfh.length; i++) {
      const employeeWfh = employeesWfh[i];
      const employeeID = employeeWfh.Employee_ID;
      const employeeInfo = await Employee.find(employeeID).lean().populate({
        path: "Report_To",
        select: "First_name Last_name Email",
      });

      //delay of 1 minutes between notifications
      const delay = i * 1 * 60 * 1000;

      setTimeout(async () => {
        try {
          const notificationUser = {
            title: `Work From Home Status`,
            message: `Hi, ${employeeInfo[0].First_name} make sure to push and commit your code before leaving office because your work from home start from tomorrow.`,
            createdBy: employeeID,
            type: "user",
          };
          sendMailForwfhCodePushReminder(employeeInfo[0]);

          await addNotificationInUserSection(employeeID, notificationUser);
          // scoket for real time notification
          await emitNotification();

          console.log(
            `WFH reminder sent for: code commit to ${employeeInfo[0].First_name}`
          );
        } catch (error) {
          console.error(
            `Error sending wfh reminder notification for code to ${employeeInfo[0].First_name}:`,
            error
          );
        }
      }, delay);
    }
  } catch (error) {
    console.error("Error sending wfh notifications for code commit:", error);
  }
}

async function leaveCodePushReminder() {
  try {
    // today will be one day afetr date form date now()
    const today = await moment().add(1, "days").format("MM-DD-YYYY");

    const leaveData = await Leave.find().lean();

    const employeesLeave = await leaveData.filter((emp) => {
      const startDate = moment(emp.Start_Date).format("MM-DD-YYYY");
      return startDate === today && emp.Status == "Approved";
    });

    if (employeesLeave.length === 0) {
      console.log(
        "No leave request found for tomorrow. to commit and push code reminder."
      );
      return;
    }

    for (let i = 0; i < employeesLeave.length; i++) {
      const employeeLeave = employeesLeave[i];
      const employeeID = employeeLeave.Employee_ID;
      const employeeInfo = await Employee.find(employeeID).lean().populate({
        path: "Report_To",
        select: "First_name Last_name Email",
      });

      //delay of 1 minutes between notifications
      const delay = i * 1 * 60 * 1000;

      setTimeout(async () => {
        try {
          const notificationUser = {
            title: `Leave Status`,
            message: `Hi, ${employeeInfo[0].First_name} make sure to push and commit your code before leaving office because your leave start from tomorrow.`,
            createdBy: employeeID,
            type: "user",
          };
          sendMailForwfhCodePushReminder(employeeInfo[0]);

          await addNotificationInUserSection(employeeID, notificationUser);
          // scoket for real time notification
          await emitNotification();

          console.log(
            `Leave reminder sent for: code commit to ${employeeInfo[0].First_name}`
          );
        } catch (error) {
          console.error(
            `Error sending Leave reminder notification for code to ${employeeInfo[0].First_name}:`,
            error
          );
        }
      }, delay);
    }
  } catch (error) {
    console.error("Error sending Leave notifications for code commit:", error);
  }
}

module.exports = {
  addNotification,
  getUsersNotification,
  markAllNotificationAsRead,
  addNotificationInUserSection,
  getAllHRNotification,
  getAllPMNotification,
  emitNotification,
  sendBirthdayNotifications,
  sendAnniversaryNotifications,
  leaveReminder,
  wfhReminder,
  wfhCodePushReminder,
  leaveCodePushReminder,
  markNotificationReadById,
  emitAttendanceNotification
};
