const HolidayModel = require("../models/HolidayMaster");
const EmployeeModel = require("../models/Employee");
const messages = require("../utils/messages");
const { UserRole } = require("../utils/commonFunctions");
const { emitNotification } = require("./notificationController");

// Middleware to check admin role
function isAdmin(employee) {
  return employee.Role === parseInt(UserRole.ADMIN, 10);
}

// Add holiday (Only Admin)
async function holidayAdd(req, res, next) {
  try {
    const employee = await EmployeeModel.findById(req.user.id);
    if (!employee || !isAdmin(employee)) {
      return res.status(403).json({
        message: messages.error.UNAUTHORIZED_ACCESS,
      });
    }

    const { Holiday_Name, Date } = req.body; // Replace fields based on your schema

    const isHolidayExist = await HolidayModel.findOne({ Holiday_Name, Date });
    if (isHolidayExist) {
      return res.status(400).json({ message: "This holiday already exists!" });
    }

    const newHoliday = new HolidayModel({
      Holiday_Name,
      Date,
    });

    await newHoliday.save();

    return res.status(200).json({
      message: messages.success.HOLIDAY_CREATED,
      data: newHoliday,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Get All holiday (Only for logged-in employee)

async function getAllholidayData(req, res, next) {
  try {
    // Get pagination and search query parameters
    const { page = 1, limit = 10, search = "" } = req.query;

    // Build the query object
    const query = {
      is_view: true, // Only fetch holidays where is_view is true
    };

    // If search is not empty, add conditions to search by Holiday_Name or Date
    // if (search) {
    //     query.$or = [];

    //     // Search by Holiday_Name with regex if it's a string
    //     query.$or.push({ Holiday_Name: { $regex: search, $options: "i" } });

    //     // If search is a valid date format, perform a date range search
    //     const parsedDate = Date.parse(search); // Try to parse search as a date
    //     if (!isNaN(parsedDate)) {
    //         query.$or.push({ Date: new Date(parsedDate) });
    //     }
    // }

    if (search) {
      query.$or = [];

      // Search by Holiday_Name with regex if it's a string
      query.$or.push({ Holiday_Name: { $regex: search, $options: "i" } });

      // If search is a valid date format, perform a date range search
      const parsedDate = Date.parse(search); // Try to parse search as a date

      if (!isNaN(parsedDate)) {
        // If the search is a valid date, search by exact date (no regex)
        query.$or.push({ Date: new Date(parsedDate) });
      } else {
        // Optional: handle cases where search is a partial date (like a month or year)
        // For example, if search is '2024', search for all holidays in 2024
        const yearSearch = new Date(search);
        if (yearSearch.getFullYear()) {
          query.$or.push({
            Date: {
              $gte: new Date(yearSearch.getFullYear(), 0, 1), // Start of the year
              $lt: new Date(yearSearch.getFullYear() + 1, 0, 1), // Start of next year
            },
          });
        }
      }
    }

    // Get total number of records for pagination
    const totalRecords = await HolidayModel.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit); // Calculate total pages

    // Fetch the holidays with pagination
    const holidays = await HolidayModel.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ Date: 1 }); // Sort by Date descending

    // Return the holidays with pagination info
    return res.status(200).json({
      data: holidays,
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

// Get holiday by ID (Visible to all employees)
async function getholidayById(req, res, next) {
  try {
    const { id } = req.params;
    const holiday = await HolidayModel.findById(id);

    if (!holiday) {
      return res.status(404).json({
        message: messages.error.HOLIDAY_NOT_FOUND,
      });
    }

    return res.status(200).json({
      data: holiday,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Get holiday  (admin)
async function getAllholidayDataAdmin(req, res, next) {
  try {
    // Get pagination and search query parameters
    const { page = 1, limit = 10, search = "" } = req.query;

    // Build the query object
    const query = {};

    // If search is not empty, add conditions to search by Holiday_Name or Date
    if (search) {
      query.$or = [];

      // Search by Holiday_Name with regex if it's a string
      query.$or.push({ Holiday_Name: { $regex: search, $options: "i" } });

      // If search is a valid date format, perform a date range search
      const parsedDate = Date.parse(search); // Try to parse search as a date

      if (!isNaN(parsedDate)) {
        // If the search is a valid date, search by exact date (no regex)
        query.$or.push({ Date: new Date(parsedDate) });
      } else {
        // Optional: handle cases where search is a partial date (like a month or year)
        // For example, if search is '2024', search for all holidays in 2024
        const yearSearch = new Date(search);
        if (yearSearch.getFullYear()) {
          query.$or.push({
            Date: {
              $gte: new Date(yearSearch.getFullYear(), 0, 1), // Start of the year
              $lt: new Date(yearSearch.getFullYear() + 1, 0, 1), // Start of next year
            },
          });
        }
      }
    }

    // Get total number of records for pagination
    const totalRecords = await HolidayModel.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit); // Calculate total pages

    // Fetch the holidays with pagination
    const holidays = await HolidayModel.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ Date: 1 }); // Sort by Date descending

    // If no holidays are found, return an empty list
    if (!holidays.length) {
      return res.status(200).json({
        data: [],
      });
    }

    // Return the holidays with pagination info
    return res.status(200).json({
      data: holidays,
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

// Update holiday by ID (Only Admin)
async function updateholiday(req, res, next) {
  try {
    const employee = await EmployeeModel.findById(req.user.id);
    if (!employee || !isAdmin(employee)) {
      return res.status(403).json({
        message: messages.error.UNAUTHORIZED_ACCESS,
      });
    }

    const { id } = req.params;
    const { Holiday_Name, Date: holidayDate, is_view } = req.body; // Rename Date to holidayDate
    const holiday = await HolidayModel.findById(id);

    if (!holiday) {
      return res.status(404).json({
        message: messages.error.HOLIDAY_NOT_FOUND,
      });
    }

    // Check if another holiday with the same Holiday_Name and Date exists, excluding the current holiday
    if (
      (Holiday_Name && holiday.Holiday_Name !== Holiday_Name) ||
      (holidayDate && holiday.Date !== holidayDate)
    ) {
      const isHolidayExist = await HolidayModel.findOne({
        Holiday_Name,
        Date: holidayDate,
        _id: { $ne: id }, // Exclude the current holiday from the check
      });

      if (isHolidayExist) {
        return res.status(400).json({
          message: "This holiday already exists!",
        });
      }
    }

    if (Holiday_Name) holiday.Holiday_Name = Holiday_Name;
    if (holidayDate) holiday.Date = holidayDate;
    if (typeof is_view === "boolean") {
      holiday.is_view = is_view;
    }
    holiday.Updated_at = new Date();

    await holiday.save();
    // scoket for real time notification & adding of holidays in global notification was done from frontend side
    if (is_view === true) {
      await emitNotification();
    }

    return res.status(200).json({
      message: messages.success.HOLIDAY_UPDATED,
      data: holiday,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Delete holiday by ID (Only Admin)
async function deleteholiday(req, res, next) {
  try {
    const employee = await EmployeeModel.findById(req.user.id);
    if (!employee || !isAdmin(employee)) {
      return res.status(403).json({
        message: messages.error.UNAUTHORIZED_ACCESS,
      });
    }

    const { id } = req.params;
    const deletedHoliday = await HolidayModel.findByIdAndDelete(id);

    if (!deletedHoliday) {
      return res.status(404).json({
        message: messages.error.HOLIDAY_NOT_FOUND,
      });
    }

    return res.status(200).json({
      message: messages.success.HOLIDAY_DELETED,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

module.exports = {
  holidayAdd,
  getAllholidayData,
  getholidayById,
  updateholiday,
  deleteholiday,
  getAllholidayDataAdmin,
};
