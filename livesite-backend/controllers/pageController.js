const commonFunctions = require('../utils/commonFunctions');
const fs = require('fs');
const path = require('path');
const PageModel = require('../models/page');
const LayerModel = require('../models/layer');
const UserModel = require('../models/user');
const CalenderModel = require('../models/calender');
const BackgroundItemModel = require('../models/BackGroundItems');
const { Op } = require('sequelize');
const messages = require('../utils/messages');



// AddUpdate Page
async function addUpdatePage(req, res, next) {
    // #swagger.tags = ['Page']
    // #swagger.description = 'Add or update Page details'
    const { UserID, ProjectID, Name, Page_order, BackGroundColor, id } = req.body; // Destructure fields from request body
    try {
            // Check if the Page name already exists for the same ProjectID
            const existingPage = await PageModel.findOne({
                where: { Name, ProjectID }
            });
            if (existingPage) {
                return res.status(400).json({ message: messages.error.PAGE_NAME_EXISTS, status: messages.error.STATUS });
            }
            // Check if the Page order is unique for the same page ID
            const existingPageOrder = await PageModel.findOne({
                where: { ProjectID, Page_order }
            });
            if (existingPageOrder) {
                return res.status(400).json({ message: messages.error.PAGE_ORDER_EXISTS, status: messages.error.STATUS });
            }
            const Type = 'SOLID';
            // Validate Type
            if (!['SOLID', 'IMAGES', 'PDF'].includes(Type)) {
                return res.status(400).json({message: messages.error.INVALID_TYPE, status: messages.error.STATUS });
            }
            const newPage = await PageModel.create({
                UserID,
                ProjectID,
                Name,
                Page_order
            });
            const newPageID = newPage.ID;
            const backgroundType = commonFunctions.Type[Type];
        // Create BackgroundItems entry
    const newBackground=  await BackgroundItemModel.create({
            UserID,
            ProjectID,
            PageID:newPageID,
            Type: backgroundType,
            BackGroundColor: BackGroundColor || '',
            Is_default: true
        });
        const backgroundID = newBackground.ID;
          
        //     const userInfo = await UserModel.findByPk(UserID);
        // const firstName = userInfo.First_name;
        // const lastName = userInfo.Last_name;

        // const newLayer = await LayerModel.create({
        //     UserID,
        //     PageID: newPageID,
        //     Name: `user 1`,
        //     Layer_order: 1, 
        //     IsLocked: false,
        //     IsVisible: true,
        //     FillColor: '#ffffff',
        //     StrokeColor: '#000000',
        //     StrokeWidth: 2,
        //     Font_size: 20,
        //     Font_family: 'Arial',
        //     StrokeType: 'solid',
        //     IsGroup: false,
        //     collapsed:true,
        //     AssignDate: new Date(),
        //      Group_Name:''
        // });

        // const newLayerID = newLayer.ID

        // Create Calendar entry
       const newCalender = await CalenderModel.create({
            UserID,
            PageID: newPageID,
            Date: new Date(),
            Notes: '', // Empty for now,
            BgID: newBackground.ID
        });
        const newCalenderID = newCalender.ID


            return res.status(200).json({ message: messages.success.PAGE_CREATED, status: messages.success.STATUS, pageID: newPageID, calenderID: newCalenderID, backgroundID:backgroundID });
        } 
     catch (error) {
        return next(error);
    }
}




// get AllDATA Admin
async function getPageAllDataWithPagination(req, res, next) {
    // #swagger.tags = ['Page']
    // #swagger.description = 'Get Page with pagination'
    try {
        const { page = 1, limit, search = '', projectId } = req.query;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
        const user = req.user;
        const userID = user.ID;
        const whereClause = { UserID: userID };
        // Check if projectID is provided and not empty
        if (!projectId || projectId === '') {
            return res.status(400).json({  message: messages.error.INVALID_PROJECTID, status: 'error' });
        }

        // const whereClause = {};
        if (projectId !== undefined && projectId !== '') { // Check if pageId is provided and not empty
            whereClause.ProjectID = projectId;
        }

        if (search) {
            whereClause.Name = { [Op.like]: `%${search}%` };
        }

        const options = {
            attributes: { exclude: ['UserID','ProjectID', 'Created_at', 'Updated_at'] },
            where: whereClause,
            offset: offset,
            limit: limit ? parseInt(limit, 10) : null,
            order: [['ID', 'DESC']],
        };
        const { count, rows: data } = await PageModel.findAndCountAll(options);
        const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);
        return res.status(200).json({ data: data, status: messages.success.STATUS, totalPages, currentPage, totalRecords: count });
    } catch (error) {
        return next(error);
    }
}

// Delete a Page by ID
async function deletePage(req, res, next) {
    // #swagger.tags = ['Page']
    // #swagger.description = 'Delete Page by id'
    const { id } = req.params;
    try {
        const pageDeleted = await PageModel.destroy({
            where: { ID:id }
        });
        const layerDeleted = await LayerModel.destroy({
            where: { PageID:id }
        });
        const calenderDeleted = await CalenderModel.destroy({
            where: { PageID:id }
        });
        if (pageDeleted || layerDeleted || calenderDeleted) {
            return res.status(200).json({ message: messages.success.PAGE_DELETED,status: messages.success.STATUS});
        } else {
            return res.status(404).json({ message: messages.error.PAGE_NOT_FOUND,status: messages.error.STATUS});
        }
    } catch (error) {
        return next(error);
    }
}


// async function getPageAllDataByProjectId(req, res, next) {
//     // #swagger.tags = ['Page']
//     // #swagger.description = 'Get Page with pagination based on ProjectID and Calendar Date'
//     try {
//         const { page = 1, limit, search = '', projectId, calendarDate } = req.body;
//         const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
//         const userID = req.user.ID;
//      console.log("jdj",projectId,calendarDate)
//         // Validate the required parameters
//         if (!projectId || !calendarDate) {
//             return res.status(400).json({ message: "ProjectID and calendarDate are required." });
//         }

//         // Find pages associated with the given projectId and userId
//         const whereClause = { 
//             ProjectID: projectId,
//             UserID: userID
//         };
        
//         if (search) {
//             whereClause.Name = { [Op.like]: `%${search}%` };
//         }

//         const pages = await PageModel.findAndCountAll({
//             where: whereClause,
//             attributes: { exclude: ['Created_at', 'Updated_at'] },
//             offset: offset,
//             limit: limit ? parseInt(limit, 10) : null,
//             order: [['Page_order', 'ASC']],  // Sort by Page_order if necessary
//         });

//         // Filter pages by the given calendar date
//         const filteredPages = await Promise.all(pages.rows.map(async page => {
//             const calendarEntry = await CalenderModel.findOne({
//                 where: {
//                     PageID: page.ID,
//                     Date: {
//                         [Op.gte]: new Date(calendarDate),  // Start of the calendar date
//                         [Op.lt]: new Date(new Date(calendarDate).setDate(new Date(calendarDate).getDate() + 1)),  // End of the calendar date
//                     },
//                 },
//                 attributes: { exclude: ['Created_at', 'Updated_at'] },
//             });

//             // If a calendar entry exists, include this page in the result
//             if (calendarEntry) {
//                 return {
//                     ...page.toJSON(), // Convert Sequelize instance to JSON object
//                     CalendarEntry: calendarEntry.toJSON() // Add calendar entry details to the page
//                 };
//             }
//             return null; // Exclude pages without calendar entry
//         }));

//         // Remove null entries (pages without corresponding calendar entries)
//         const pagesWithCalendarEntries = filteredPages.filter(page => page !== null);

//         const totalPages = limit ? Math.ceil(pages.count / parseInt(limit, 10)) : 1;
//         const currentPage = parseInt(page, 10);

//         return res.status(200).json({
//             data: pagesWithCalendarEntries,
//             totalPages,
//             status: messages.success.STATUS,
//             currentPage,
//             totalRecords: pagesWithCalendarEntries.length
//         });
//     } catch (error) {
//         console.error('Error fetching pages with pagination:', error);
//         return next(error);
//     }
// }

async function getPageAllDataByProjectId(req, res, next) {
    // #swagger.tags = ['Page']
    // #swagger.description = 'Get Page with pagination based on ProjectID'
    try {
        const { page = 1, limit, search = '', projectId } = req.body;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
        const userID = req.user.ID;

        // Validate the required parameters
        if (!projectId) {
            return res.status(400).json({ message: "ProjectID is required." });
        }

        // Build the where clause to filter pages by projectId and userId
        const whereClause = { 
            ProjectID: projectId,
            UserID: userID
        };
        
        // Add search functionality (optional)
        if (search) {
            whereClause.Name = { [Op.like]: `%${search}%` };
        }

        // Fetch pages associated with the given projectId and userId
        const pages = await PageModel.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['Created_at', 'Updated_at'] },
            offset: offset,
            limit: limit ? parseInt(limit, 10) : null,
            order: [['Page_order', 'ASC']],  // Sort by Page_order if necessary
        });

        const totalPages = limit ? Math.ceil(pages.count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);

        return res.status(200).json({
            data: pages.rows,  // Return the fetched pages directly
            totalPages,
            status: messages.success.STATUS, // Assuming you have a success status in your messages object
            currentPage,
            totalRecords: pages.count  // Total records found
        });
    } catch (error) {
        console.error('Error fetching pages:', error);
        return next(error);
    }
}






module.exports = {
    addUpdatePage,
    getPageAllDataWithPagination,
    deletePage,
    getPageAllDataByProjectId
};
