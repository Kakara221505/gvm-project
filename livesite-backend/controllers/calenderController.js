const commonFunctions = require('../utils/commonFunctions');
const fs = require('fs');
const path = require('path');
const CalenderModel = require('../models/calender');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const messages = require('../utils/messages');

// AddUpdate Calendar
async function addUpdateCalender(req, res, next) {
    // #swagger.tags = ['Calendar']
    // #swagger.description = 'Add or update Calendar details'
    let { UserID, PageID, Notes,id } = req.body; // Updated field names
    try {
        let loginUser = req.user;
        if (!id) {
            const currentDate = new Date();
            await CalenderModel.create({
                UserID,
                PageID,
                Notes,
               Date: currentDate
            });

            return res.status(200).json({ message: messages.success.CALENDER_CREATED, status: messages.success.STATUS });
        } else {
            // Find the existing calendar record
            const existingCalendar = await CalenderModel.findByPk(id);
            if (!existingCalendar) {
                return res.status(404).json({ message: messages.error.CALENDER_NOT_FOUND, status: messages.error.STATUS });
            }
            // // Check if the updated date already exists
            // if (Date && Date !== existingCalendar.Date) {
            //     const existingDate = await CalenderModel.findOne({
            //         where: {
            //             Date,
            //             ID: { [Op.not]: id }
            //         }
            //     });

            //     if (existingDate) {
            //         return res.status(400).json({ message: messages.error.CALENDAR_DATE_EXISTS, status: messages.error.STATUS });
            //     }
            // }
            // Update calendar fields
            if (UserID) {
                existingCalendar.UserID = UserID;
            }
            if (PageID) {
                existingCalendar.PageID = PageID;
            }
            if (Notes) {
                existingCalendar.Notes = Notes;
            }
            // Save the updated details to database 
            await existingCalendar.save();
            return res.status(200).json({ message: messages.success.CALENDER_UPDATE, status: messages.success.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}

// get Calendar BY ID
async function getCalendarById(req, res, next) {
    // #swagger.tags = ['Calendar']
    // #swagger.description = 'Get Calendar by ID'
    try {
        const { id } = req.params;
        const calender= await CalenderModel.findOne({
            where: { ID: id },
            attributes: { exclude: ['Created_at', 'Updated_at'] }
        });

        if (!calender) {
            return res.status(404).json({ message: messages.error.CALENDER_NOT_FOUND,status: messages.error.STATUS});
        }
        return res.status(200).json({ data:calender,status: messages.success.STATUS});
    } catch (error) {
        return next(error);
    }

}

// Delete a Calendar by ID
async function deleteCalendar(req, res, next) {
    // #swagger.tags = ['Calendar']
    // #swagger.description = 'Delete Calendar by id'
    try {
        const calendar = await CalenderModel.findByPk(req.params.id);
        if (calendar) {
            await calendar.destroy();
            return res.status(200).json({ message: messages.success.CALENDER_DELETED,status: messages.success.STATUS});
        } else {
            return res.status(404).json({ message: messages.error.CALENDER_NOT_FOUND,status: messages.error.STATUS});
        }
    } catch (error) {
        return next(error);
    }
}

// get AllDATA Calendar
async function getCalendarWithPagination(req, res, next) {
    // #swagger.tags = ['Calendar']
    // #swagger.description = 'Get Calendar with pagination for user'
    try {
        const { page = 1, limit, search = '',pageId } = req.query;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
        const user = req.user;
        const userID = user.ID;
          // Check if projectID is provided and not empty
          if (!pageId || pageId === '') {
            return res.status(400).json({  message: messages.error.INVALID_PAGEID, status: 'error' });
        }

        const whereClause = {};

        if (pageId !== undefined && pageId !== '') { // Check if pageId is provided and not empty
            whereClause.PageID = pageId;
        }

        const options = {
            attributes: { exclude: ['UserID','PageID', 'Created_at', 'Updated_at',] },
            offset: offset,
            where: whereClause,
            order: [['ID', 'DESC']], 
            limit: limit ? parseInt(limit, 10) : null,
        };
        const { count, rows: calendar } = await CalenderModel.findAndCountAll(options);
        const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);
        return res.status(200).json({ data:calendar, totalPages,status: messages.success.STATUS, currentPage, totalRecords: count });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    addUpdateCalender,
    getCalendarById,
    deleteCalendar,
    getCalendarWithPagination
};
