const EventModel = require("../models/EventMaster");
const EmployeeModel = require("../models/Employee");
const messages = require("../utils/messages");
const { UserRole } = require("../utils/commonFunctions");
const GlobalNotification = require("../models/NotificationMaster");
const { emitNotification } = require("./notificationController");

// Middleware to check admin role
function isAdmin(employee) {
  return employee.Role === parseInt(UserRole.ADMIN, 10);
}

async function addNotification(eventName, date, time, id) {
  await GlobalNotification.create({
    title: "Event",
    message: `We are celebrating ${eventName} on ${date} at ${time}`,
    createdBy: id,
  });
}

// Add event (Only Admin)
async function eventAdd(req, res, next) {
  try {
    const employee = await EmployeeModel.findById(req.user.id);
    if (!employee || !isAdmin(employee)) {
      return res.status(403).json({
        message: messages.error.UNAUTHORIZED_ACCESS,
      });
    }

    const { Event_Name, Date, Time } = req.body; // Replace fields based on your schema
    const isEventExist = await EventModel.findOne({ Event_Name, Date });
    if (isEventExist) {
      return res.status(400).json({
        message: "This event already exists!",
      });
    }
    const newevent = new EventModel({
      Event_Name,
      Date,
      Time,
    });

    await addNotification(Event_Name, Date, Time, req.user.id);

    await newevent.save();
    // scoket for real time notification
    await emitNotification();

    return res.status(200).json({
      message: messages.success.EVENT_CREATED,
      data: newevent,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Get All event

async function getAlleventData(req, res, next) {
  try {
    // Get pagination and search query parameters
    const { page = 1, limit = 10, search = "" } = req.query;

    // Query to find events with optional search functionality
    const query = {
      $or: [
        { Event_Name: { $regex: search, $options: "i" } }, // Case-insensitive search on event_Name
      ],
    };

    // Get total number of records for pagination
    const totalRecords = await EventModel.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit); // Calculate total pages

    // Fetch the events with pagination
    const events = await EventModel.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ Date: -1 });

    // If no events are found, return an empty list
    if (!events.length) {
      return res.status(200).json({
        data: [],
        totalRecords,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      });
    }

    // Return the events with pagination info
    return res.status(200).json({
      data: events,
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

// Get event by ID (Visible to all employees)
async function geteventById(req, res, next) {
  try {
    const { id } = req.params;
    const event = await EventModel.findById(id);

    if (!event) {
      return res.status(404).json({
        message: messages.error.EVENT_NOT_FOUND,
      });
    }

    return res.status(200).json({
      data: event,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Update event by ID (Only Admin)
async function updateevent(req, res, next) {
  try {
    const employee = await EmployeeModel.findById(req.user.id);
    if (!employee || !isAdmin(employee)) {
      return res.status(403).json({
        message: messages.error.UNAUTHORIZED_ACCESS,
      });
    }

    const { id } = req.params;
    const { Event_Name, Date: eventDate, Time: eventTime } = req.body; // Rename Date to eventDate
    const event = await EventModel.findById(id);

    if (!event) {
      return res.status(404).json({
        message: messages.error.EVENT_NOT_FOUND,
      });
    }

    if ((Event_Name && event.Event_Name !== Event_Name) || (eventDate && event.Date !== eventDate)) {
      const isEventExist = await EventModel.findOne({
        Event_Name,
        Date: eventDate,
        _id: { $ne: id }, 
      });

      if (isEventExist) {
        return res.status(400).json({
          message: "This event already exists!",
        });
      }
    }

    if (Event_Name) event.Event_Name = Event_Name;
    if (eventDate) event.Date = eventDate;
    if (eventTime) event.Time = eventTime;
    event.Updated_at = new Date();

    await event.save();

    return res.status(200).json({
      message: messages.success.EVENT_UPDATED,
      data: event,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Delete event by ID (Only Admin)
async function deleteevent(req, res, next) {
  try {
    const employee = await EmployeeModel.findById(req.user.id);
    if (!employee || !isAdmin(employee)) {
      return res.status(403).json({
        message: messages.error.UNAUTHORIZED_ACCESS,
      });
    }

    const { id } = req.params;
    const deletedevent = await EventModel.findByIdAndDelete(id);

    if (!deletedevent) {
      return res.status(404).json({
        message: messages.error.EVENT_NOT_FOUND,
      });
    }

    return res.status(200).json({
      message: messages.success.EVENT_DELETED,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

module.exports = {
  eventAdd,
  getAlleventData,
  geteventById,
  updateevent,
  deleteevent,
};
