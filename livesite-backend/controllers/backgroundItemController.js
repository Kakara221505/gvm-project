const commonFunctions = require("../utils/commonFunctions");
const fs = require("fs");
const path = require("path");
const BackgroundModel = require("../models/BackGroundItems");
// const { Op } = require('sequelize');
const messages = require("../utils/messages");
const CalenderModel = require("../models/calender");
const moment = require("moment");
const momentTime = require("moment-timezone");
const { Op, fn, col, Sequelize } = require("sequelize");

async function addBackground(req, res, next) {
  let { UserID, ProjectID, PageID, Type, BackgroundMedia, Is_default } =
    req.body;
  try {
    let BackgroundUrl = "";
    if (req.file) {
      BackgroundUrl = `${process.env.BACKGROUND_IMAGE_ROUTE}${req.file.filename}`;
    }
    if (!["SOLID", "IMAGES", "PDF"].includes(Type) && Type !== undefined) {
      return res.status(400).json({
        message: messages.error.INVALID_TYPE,
        status: messages.error.STATUS,
      });
    }

    let value = BackgroundMedia; // Assign BackgroundMedia to value by default

    if (Type === "IMAGES" || Type === "PDF") {
      if (!req.file) {
        return res.status(400).json({
          message: "File is required for IMAGES and PDF types",
          status: messages.error.STATUS,
        });
      }
      value = BackgroundUrl; // Assign BackgroundUrl to value for IMAGES and PDF types
    }
    const backgroundType = commonFunctions.Type[Type];

    await BackgroundModel.create({
      UserID,
      ProjectID,
      PageID,
      Type: backgroundType,
      BackGroundColor: value,
      Is_default,
    });

    return res.status(200).json({
      message: messages.success.BACKGROUND_CREATED,
      status: messages.success.STATUS,
    });
  } catch (error) {
    return next(error);
  }
}

function generateDateRange(startDate, endDate) {
  let dates = [];
  let currentDate = moment(startDate, "YYYY-MM-DD");
  let lastDate = moment(endDate, "YYYY-MM-DD");

  while (currentDate <= lastDate) {
    dates.push(currentDate.format("YYYY-MM-DD"));
    currentDate = currentDate.add(1, "days");
  }
//   console.log("teerr", dates, startDate, endDate);
  return dates;
}

// this api will use for assigning background for particular dates and if background already assigned for particular dates you can replace that background for same the dates.
// assign and replace for both use this api

async function addBackgroundInitiate(req, res, next) {
    let { ID, UserID, PageID, Date } = req.body;
  
    try {
      let datesToSave = [];
  
      // Parse the Date if it's in string array format
      if (
        typeof Date === "string" &&
        Date.startsWith("[") &&
        Date.endsWith("]")
      ) {
        try {
          Date = JSON.parse(Date);
        } catch (e) {
          return res
            .status(400)
            .json({ message: "Invalid date format", status: 400 });
        }
      }
  
      // Determine the dates to save based on the Date parameter
      if (Date === "All") {
         // Set Is_default to 0 for all entries where it was previously 1
         await BackgroundModel.update(
          { Is_default: 0 },
          { where: { Is_default: 1 } }
      );

      // Set Is_default to 1 for the specified ID
      await BackgroundModel.update(
          { Is_default: 1 },
          { where: { ID } }
      );
      
      } else if (Array.isArray(Date) && Date.length === 2) {
        // If Date is an array with a start and end date, generate a range of dates
        datesToSave = generateDateRange(Date[0], Date[1]);
      } else if (typeof Date === "string") {
        // If Date is a single string date, format and add it to datesToSave
        datesToSave.push(moment(Date, "YYYY-MM-DD").format("YYYY-MM-DD"));
      } else {
        return res.status(400).json({ message: "Date is required", status: 400 });
      }
  
      // Retrieve the background entry based on the provided ID
      let backgroundEntry = await BackgroundModel.findByPk(ID);
      if (!backgroundEntry) {
        return res
          .status(404)
          .json({ message: "Background image not found", status: 404 });
      }
  
      // Extract the background color from the retrieved background entry
      const backgroundColor = backgroundEntry.BackGroundColor;
  
      // Remove existing calendar entries that conflict with the new ones
      const deletedRows = await CalenderModel.destroy({
        where: {
          PageID,
          UserID,
          Date: {
            [Op.between]: [
              moment(datesToSave[0]).startOf("day").toDate(),
              moment(datesToSave[datesToSave.length - 1])
                .endOf("day")
                .toDate(),
            ],
          },
          BgID: { [Op.ne]: ID }, // Exclude entries with the same BgID
        },
      });
  
      // Array to store newly created calendar entries
      const calendarEntries = [];
      for (let date of datesToSave) {
        const formattedDate = moment(date).startOf("day").format("YYYY-MM-DD");
  
        // Check if an entry already exists for the given date
        const existingEntry = await CalenderModel.findOne({
          where: {
            UserID,
            PageID,
            Date: formattedDate,
            BgID: ID,
          },
        });
  
        if (!existingEntry) {
          // Create a new calendar entry if it doesn't already exist
          const calendarEntry = await CalenderModel.create({
            UserID,
            PageID,
            Date: formattedDate,
            BackGroundColor: backgroundColor,
            BgID: ID,
          });
  
          // Add the newly created entry to the calendarEntries array
          calendarEntries.push({
            ID: calendarEntry.ID,
            UserID: calendarEntry.UserID,
            PageID: calendarEntry.PageID,
            Date: calendarEntry.Date,
            BackGroundColor: calendarEntry.BackGroundColor,
          });
        }
      }
  
      return res
        .status(200)
        .json({
          message: messages.success.BACKGROUND_CREATED,
          status: messages.success.STATUS,
        });
    } catch (error) {
      return next(error);
    }
  }
  
  // in this api we return all dates in array form for particular pageid and projectid with uniques date to remove duplication of dates
  async function getBackgroundAllDataWithPagination(req, res, next) {
    const { projectID } = req.query;
    const baseUrl = process.env.BASE_URL; // Assuming you have BASE_URL in your environment variables
  
    try {
      // Step 1: Retrieve PageIDs and UserIDs from BackgroundItems
      const backgroundItems = await BackgroundModel.findAll({
        attributes: [
          "ID",
          "PageID",
          "UserID",
          "BackGroundColor",
          "Type",
          "Is_default",
        ],
        where: { ProjectID: projectID },
      });
  
      if (!backgroundItems.length) {
        return res.status(404).json({
          message: "No background items found for this project",
          status: "error",
        });
      }
  
      // Extract PageIDs and UserIDs
      const pageIDs = [...new Set(backgroundItems.map((item) => item.PageID))];
      const userIDs = [...new Set(backgroundItems.map((item) => item.UserID))];
  
      // Step 2: Retrieve Calendar entries based on PageIDs, UserIDs, and bgid
      const calendarEntries = await CalenderModel.findAll({
        attributes: ["Date", "PageID", "UserID", "BgID"],
        where: {
          PageID: pageIDs,
          UserID: userIDs,
          BgID: backgroundItems.map((item) => item.ID), // Ensure that we filter based on BgID
        },
        order: [["Date", "ASC"]],
      });
  
      // Generate DateRanges for each background item
      const generateDateRanges = (calendarData) => {
        const dates = calendarData.map((entry) => entry.Date);
        const uniqueDates = [...new Set(dates)];
        return uniqueDates; // You might want to sort or format these dates
      };
  
      // Step 3: Combine Data and Attach Base URL
      const combinedData = backgroundItems.map((backgroundItem) => {
        const calendarData = calendarEntries.filter(
          (entry) =>
            entry.PageID === backgroundItem.PageID &&
            entry.UserID === backgroundItem.UserID &&
            entry.BgID === backgroundItem.ID // Match BgID with BackgroundItem ID
        );
  
        // Generate DateRanges for the current background item
        const dateRanges = generateDateRanges(calendarData);
  
        // Attach base URL for Type 1 and 2, skip if BackGroundColor is empty
        const backgroundColor =
          backgroundItem.Type === "0" || !backgroundItem.BackGroundColor
            ? backgroundItem.BackGroundColor
            : `${baseUrl}/${backgroundItem.BackGroundColor}`;
  
        return {
          BackGroundColor: backgroundColor,
          ID: backgroundItem.ID,
          PageID: backgroundItem.PageID,
          Type: backgroundItem.Type,
          Is_default: backgroundItem.Is_default,
          DateRanges: dateRanges, // Include dynamically generated DateRanges
        };
      });
  
      // return res.status(200).json({
      //   message: "Background and calendar data retrieved successfully",
      //   status: "success",
      //   data: combinedData,
      // });
      return res
        .status(200)
        .json({
          message: messages.success.BACKGROUND_RETRIEVED,
          status: messages.success.STATUS,
          data: combinedData,
        });
    } catch (error) {
      return next(error);
    }
  }
  
  
// this api will use for both unassign and set default becuase in both we have to remove background and set default background color #f7f7fa for this it create new entry in backgroundItem as well as in calander for date which we remove
  async function unassignBackground(req, res, next) {
    let { ID, ProjectID, UserID, PageID, Dates } = req.body;
  
    try {
      // Validate Dates input
      if (
        !Array.isArray(Dates) ||
        Dates.some((date) => !moment(date, "YYYY-MM-DD", true).isValid())
      ) {
        return res
          .status(400)
          .json({ message: "Invalid date format", status: 400 });
      }
  
      // Format dates for the query
      const formattedDates = Dates.map((date) =>
        moment(date).format("YYYY-MM-DD")
      );
  
      // Convert dates to the start and end of the day for the query
      const startOfDayDates = formattedDates.map((date) =>
        moment(date).startOf("day").toDate()
      );
      const endOfDayDates = formattedDates.map((date) =>
        moment(date).endOf("day").toDate()
      );
  
      // Delete existing calendar entries for the specified background image
      const deletedRows = await CalenderModel.destroy({
        where: {
          UserID,
          PageID,
          Date: {
            [Op.and]: [
              { [Op.gte]: startOfDayDates[0] }, // Greater than or equal to the start of the first day
              { [Op.lte]: endOfDayDates[endOfDayDates.length - 1] }, // Less than or equal to the end of the last day
            ],
          },
          BgID: ID,
        },
      });
  
      // Array to store newly created calendar entries
      const calendarEntries = [];
  
      for (let date of formattedDates) {
        // Create a new entry in BackgroundItems and get its ID
        const backgroundEntry = await BackgroundModel.create({
          UserID,
          PageID,
          ProjectID,
          BackGroundColor: "#f7f7fa",
          Type: 0,
          Is_default: 0,
        });
  
        // Create a new entry in Calendar with the new Background ID
        const calendarEntry = await CalenderModel.create({
          UserID,
          PageID,
          Date: date,
          Notes: "",
          BgID: backgroundEntry.ID, // Use the new Background ID here
        });
  
        // Add the newly created entry to the array
        calendarEntries.push({
          ID: calendarEntry.ID,
          UserID: calendarEntry.UserID,
          PageID: calendarEntry.PageID,
          Date: calendarEntry.Date,
          Notes: calendarEntry.Notes,
          BgID: calendarEntry.BgID,
        });
      }
  
      //   return res.status(200).json({
      //     message: "Background successfully unassigned and new entries created for specified dates",
      //     status: 200,
      //     // calendarEntries,
      //   });
      return res
        .status(200)
        .json({
          message: messages.success.BACKGROUND_UNASSIGNED,
          status: messages.success.STATUS,
        });
    } catch (error) {
      console.error("Error in unassignBackground:", error);
      return next(error);
    }
  }


// async function addBackgroundInitiate(req, res, next) {
//     let { UserID, ProjectID, PageID, Type, BackgroundMedia, Is_default, Date } = req.body;
//     try {
//         let BackgroundUrl = '';
//         if (req.file) {
//             BackgroundUrl = `${process.env.BACKGROUND_IMAGE_ROUTE}${req.file.filename}`;
//         }
//         if (!['SOLID', 'IMAGES', 'PDF'].includes(Type) && Type !== undefined) {
//             return res.status(400).json({ message: messages.error.INVALID_TYPE, status: messages.error.STATUS });
//         }

//         let value = BackgroundMedia; // Assign BackgroundMedia to value by default

//         if (Type === 'IMAGES' || Type === 'PDF') {
//             if (!req.file) {
//                 return res.status(400).json({ message: "File is required for IMAGES and PDF types", status: messages.error.STATUS });
//             }
//             value = BackgroundUrl; // Assign BackgroundUrl to value for IMAGES and PDF types
//         }
//         const backgroundType = commonFunctions.Type[Type];

//         // Handle Date field
//         let datesToSave = [];

//         if (typeof Date === 'string' && Date.startsWith('[') && Date.endsWith(']')) {
//             try {
//                 Date = JSON.parse(Date);
//             } catch (e) {
//                 return res.status(400).json({ message: messages.error.INVALID_DATE_FORMAT, status: messages.error.STATUS });
//             }
//         }

//         if (Date === 'All') {
//             datesToSave.push(moment().format('YYYY-MM-DD'));
//         } else if (Array.isArray(Date) && Date.length === 2) {
//             datesToSave = generateDateRange(Date[0], Date[1]);
//         } else if (typeof Date === 'string') {
//             datesToSave.push(moment(Date, 'YYYY-MM-DD').format('YYYY-MM-DD'));
//         } else {
//             return res.status(400).json({ message: "Date is required", status: messages.error.STATUS });
//         }

//         // Save background items and calendar entries with the provided dates
//         for (let date of datesToSave) {

//             // Create BackgroundItem entry
//             const backgroundEntry = await BackgroundModel.create({
//                 UserID,
//                 ProjectID,
//                 PageID,
//                 Type: backgroundType,
//                 BackGroundColor: value,
//                 Is_default
//             });
//             // Create Calendar entry
//             const calendarEntry = await CalenderModel.create({
//                 UserID,
//                 PageID,
//                 Date: date,
//                 Notes: ''
//             });
//         }

//         return res.status(200).json({ message: messages.success.BACKGROUND_CREATED, status: messages.success.STATUS });
//     } catch (error) {
//         return next(error);
//     }
// }

// async function addBackgroundInitiate(req, res, next) {
//     let { ID, UserID, ProjectID, PageID, Type, BackgroundMedia, Is_default, Date } = req.body;
//     try {
//         let BackgroundUrl = '';
//         if (req.file) {
//             BackgroundUrl = `${process.env.BACKGROUND_IMAGE_ROUTE}${req.file.filename}`;
//         }
//         if (!['SOLID', 'IMAGES', 'PDF'].includes(Type) && Type !== undefined) {
//             return res.status(400).json({ message: messages.error.INVALID_TYPE, status: messages.error.STATUS });
//         }

//         let value = BackgroundMedia; // Assign BackgroundMedia to value by default

//         if (Type === 'IMAGES' || Type === 'PDF') {
//             if (!req.file) {
//                 return res.status(400).json({ message: "File is required for IMAGES and PDF types", status: messages.error.STATUS });
//             }
//             value = BackgroundUrl; // Assign BackgroundUrl to value for IMAGES and PDF types
//         }
//         const backgroundType = commonFunctions.Type[Type];

//         // Handle Date field
//         let datesToSave = [];

//         if (typeof Date === 'string' && Date.startsWith('[') && Date.endsWith(']')) {
//             try {
//                 Date = JSON.parse(Date);
//             } catch (e) {
//                 return res.status(400).json({ message: messages.error.INVALID_DATE_FORMAT, status: messages.error.STATUS });
//             }
//         }

//         if (Date === 'All') {
//             datesToSave.push(moment().format('YYYY-MM-DD'));
//         } else if (Array.isArray(Date) && Date.length === 2) {
//             datesToSave = generateDateRange(Date[0], Date[1]);
//         } else if (typeof Date === 'string') {
//             datesToSave.push(moment(Date, 'YYYY-MM-DD').format('YYYY-MM-DD'));
//         } else {
//             return res.status(400).json({ message: "Date is required", status: messages.error.STATUS });
//         }

//         // Save or update background items and calendar entries with the provided dates
//         for (let date of datesToSave) {
//             let backgroundEntry;
//             if (ID) {
//                 backgroundEntry = await BackgroundModel.findByPk(ID);
//             } else {
//                 backgroundEntry = await BackgroundModel.findOne({
//                     where: {
//                         ProjectID,
//                         PageID
//                     }
//                 });
//             }

//             if (backgroundEntry) {
//                 // Update the existing BackgroundItem entry
//                 await backgroundEntry.update({
//                     UserID,
//                     ProjectID,
//                     PageID,
//                     Type: backgroundType,
//                     BackGroundColor: value,
//                     Is_default
//                 });
//             } else {
//                 // Create a new BackgroundItem entry
//                 backgroundEntry = await BackgroundModel.create({
//                     UserID,
//                     ProjectID,
//                     PageID,
//                     Type: backgroundType,
//                     BackGroundColor: value,
//                     Is_default
//                 });
//             }

//             // Format Date to extract just the date part
//             const formattedDate = moment(date).format('YYYY-MM-DD');

//             // Check for existing Calendar entry
//             let calendarEntry = await CalenderModel.findOne({
//                 where: {
//                     PageID,
//                     [Op.and]: Sequelize.where(Sequelize.fn('DATE', Sequelize.col('Date')), formattedDate)
//                 }
//             });
//             if (calendarEntry) {
//                 // Update the existing Calendar entry
//                 await calendarEntry.update({
//                     UserID,
//                     Notes: '' // Update other parameters as necessary
//                 });
//             } else {
//                 // Create a new Calendar entry
//                 await CalenderModel.create({
//                     UserID,
//                     PageID,
//                     Date: formattedDate,
//                     Notes: ''
//                 });
//             }
//         }

//         return res.status(200).json({ message: messages.success.BACKGROUND_CREATED, status: messages.success.STATUS });
//     } catch (error) {
//         return next(error);
//     }
// }

// async function getBackgroundAllDataWithPagination(req, res, next) {
//     try {
//         const { page = 1, limit, search = '', projectID } = req.query;

//         // Check if projectID is provided and not empty
//         if (!projectID || projectID === '') {
//             return res.status(400).json({ message: "Invalid ProjectID", status: "error" });
//         }

//         const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
//         const whereClause = { ProjectID: projectID };

//         if (search) {
//             whereClause.Type = { [Op.like]: `%${search}%` };
//         }

//         const options = {
//             attributes: { exclude: ['UserID', 'ProjectID', 'Created_at', 'Updated_at'] },
//             where: whereClause,
//             offset: offset,
//             limit: limit ? parseInt(limit, 10) : null,
//             order: [['ID', 'DESC']],
//         };

//         // Fetch background items
//         const { count, rows: backgroundItems } = await BackgroundModel.findAndCountAll(options);

//         // Fetch related calendar entries based on PageID of BackgroundItems
//         const pageIds = backgroundItems.map(item => item.PageID);
//         const calendarEntries = await CalenderModel.findAll({
//             where: {
//                 PageID: {
//                     [Op.in]: pageIds
//                 }
//             },
//             attributes: ['PageID', 'Date'],
//             order: [['Date', 'DESC']]
//         });

//         // Map calendar entries by PageID
//         const calendarMap = new Map();
//         calendarEntries.forEach(entry => {
//             if (!calendarMap.has(entry.PageID)) {
//                 calendarMap.set(entry.PageID, []);
//             }
//             calendarMap.get(entry.PageID).push(entry.Date);
//         });

//         // Concatenate base URL to the 'Value' field where a file path is present
//         const baseUrl = process.env.BASE_URL;
//         const modifiedBackground = backgroundItems.map(item => {
//             const value = item.BackGroundColor;
//             const backgroundColor = (item.Type === '2' || item.Type === '1') ? `${baseUrl}${value}` : item.dataValues.BackGroundColor;
//             const dates = calendarMap.get(item.PageID) || [];

//             // Assign the first available date to this item and remove it from the list
//             const assignedDate = dates.length > 0 ? dates.shift() : null;
//             if (assignedDate) {
//                 calendarMap.set(item.PageID, dates);
//             }

//             return {
//                 ...item.dataValues,
//                 BackGroundColor: backgroundColor,
//                 Date: assignedDate
//             };
//         });

//         // Group by BackGroundColor and create date ranges
//         const backgroundColorMap = new Map();
//         modifiedBackground.forEach(item => {
//             const { ID, PageID, Type, Is_default, BackGroundColor, Date } = item;
//             if (!backgroundColorMap.has(BackGroundColor)) {
//                 backgroundColorMap.set(BackGroundColor, { ID, PageID, Type, Is_default, Dates: [] });
//             }
//             if (Date) {
//                 backgroundColorMap.get(BackGroundColor).Dates.push(Date);
//             }
//         });

//         // Function to generate all dates between two dates
//         const generateAllDatesBetween = (startDate, endDate) => {
//             const dates = [];
//             let currentDate = moment(startDate);
//             const lastDate = moment(endDate);
//             while (currentDate <= lastDate) {
//                 dates.push(currentDate.format('YYYY-MM-DD'));
//                 currentDate = currentDate.add(1, 'day');
//             }
//             return dates;
//         };

//         // Process the dates into a full list of dates
//         const groupedBackground = Array.from(backgroundColorMap.entries()).map(([color, data]) => {
//             const allDates = [];
//             const sortedDates = data.Dates.sort();
//             for (let i = 0; i < sortedDates.length - 1; i++) {
//                 const start = sortedDates[i];
//                 const end = sortedDates[i + 1];
//                 allDates.push(...generateAllDatesBetween(start, end));
//             }

//             // Include the start and end date if there is only one range
//             if (sortedDates.length === 1) {
//                 allDates.push(sortedDates[0]);
//             }

//             return {
//                 BackGroundColor: color,
//                 ID: data.ID,
//                 PageID: data.PageID,
//                 Type: data.Type,
//                 Is_default: data.Is_default,
//                 DateRanges: allDates
//             };
//         });

//         const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
//         const currentPage = parseInt(page, 10);

//         return res.status(200).json({
//             data: groupedBackground,
//             status: "success",
//             totalPages,
//             currentPage,
//             totalRecords: count
//         });
//     } catch (error) {
//         console.error("Error processing request:", error); // Log the error
//         return next(error);
//     }
// }


// async function unassignBackground(req, res, next) {
//   const { PageID, Date } = req.body;

//   try {
//     // Validate input
//     if (!PageID || !Date) {
//       return res
//         .status(400)
//         .json({ message: "PageID and Date are required", status: "error" });
//     }

//     // Split the comma-separated list of dates and validate each date
//     const dates = Date.split(",").map((date) => date.trim());
//     const formattedDates = dates.map((date) => {
//       const parsedDate = moment(date, ["YYYY-M-D", "YYYY-MM-DD"], true);
//       if (!parsedDate.isValid()) {
//         throw new Error(`Invalid date: ${date}`);
//       }
//       return parsedDate.format("YYYY-MM-DD");
//     });

//     console.log("Formatted Dates:", formattedDates);

//     // Find all calendar entries matching the PageID and Dates
//     const calendarEntries = await CalenderModel.findAll({
//       where: {
//         PageID: PageID,
//         Date: {
//           [Op.in]: formattedDates,
//         },
//       },
//     });

//     if (!calendarEntries.length) {
//       return res.status(404).json({
//         message: "No entries found for the given PageID and Dates",
//         status: "error",
//       });
//     }

//     // Extract all UserIDs from the calendar entries
//     const userIds = calendarEntries.map((entry) => entry.UserID);

//     // Delete corresponding background items
//     await BackgroundModel.destroy({
//       where: {
//         UserID: {
//           [Op.in]: userIds,
//         },
//         PageID: PageID,
//       },
//     });

//     // Delete calendar entries
//     await CalenderModel.destroy({
//       where: {
//         PageID: PageID,
//         Date: {
//           [Op.in]: formattedDates,
//         },
//       },
//     });

//     return res.status(200).json({
//       message: "Background items and calendar entries unassigned successfully",
//       status: "success",
//     });
//   } catch (error) {
//     return next(error);
//   }
// }




module.exports = {
  addBackground,
  getBackgroundAllDataWithPagination,
  addBackgroundInitiate,
  unassignBackground,
};
