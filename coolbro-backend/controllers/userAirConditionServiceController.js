
const UserAirConditionServiceModel = require('../models/userAirConditionService');
const UserModel = require('../models/user');
const messages = require('../utils/messages');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');

// Add Update Service
async function addUpdateService(req, res, next) {
    // #swagger.tags = ['Service']
    // #swagger.description = 'Add or update Service details'
    let { UserID, AC_name, Purchase_date, Last_serviced_date, UserAirConditionServiceURL, id } = req.body;
    try {
        let loginUser = req.user;
        let userAirConditionServiceImage = '';
        if (req.file) {
            userAirConditionServiceImage = `${process.env.SERVICE_MEDIA_ROUTE}${req.file.filename}`
        }
        if (!id) {
            await UserAirConditionServiceModel.create({
                UserID,
                AC_name,
                Purchase_date,
                Last_serviced_date,
                Media_url: userAirConditionServiceImage,
                Created_by: loginUser.ID
            });

            return res.status(200).json({ message: messages.success.SERVICE_CREATED, status: messages.success.STATUS });

        }
        else {
            // Find the existing UserAirConditionService record
            const existingUserAirConditionService = await UserAirConditionServiceModel.findByPk(id);
            if (!existingUserAirConditionService) {
                return res.status(404).json({ message: messages.error.SERVICE_NOT_FOUND, status: messages.error.STATUS });
            }

            if (UserID) {
                existingUserAirConditionService.UserID = UserID;
            }
            if (AC_name) {
                existingUserAirConditionService.AC_name = AC_name;
            }
            if (Purchase_date) {
                existingUserAirConditionService.Purchase_date = Purchase_date;
            }
            if (Last_serviced_date) {
                existingUserAirConditionService.Last_serviced_date = Last_serviced_date;
            }
            if (userAirConditionServiceImage !== "") {
                existingUserAirConditionService.Media_url = userAirConditionServiceImage;
            }
            existingUserAirConditionService.Updated_by = loginUser.ID;
            // Save the updated details to database 
            await existingUserAirConditionService.save();

            return res.status(200).json({ message: messages.success.SERVICE_UPDATE, status: messages.success.STATUS });
        }
    } catch (error) {
        return next(error);
    }

}

//  getServiceBYID
async function getServiceById(req, res, next) {
    try {
        const { id } = req.params;
        const userAirConditionService = await UserAirConditionServiceModel.findOne({
            where: { ID: id },
            attributes: [
                'ID',
                'UserID',
                'AC_name',
                'Media_url',  // Include Media_url in the selected attributes
                [Sequelize.literal('DATE_FORMAT(Purchase_date, "%d/%m/%Y")'), 'Purchase_date'],
                [Sequelize.literal('DATE_FORMAT(Last_serviced_date, "%d/%m/%Y")'), 'Last_serviced_date'],
                [Sequelize.literal('DATE_FORMAT(DATE_ADD(Last_serviced_date, INTERVAL 3 MONTH), "%d/%m/%Y")'), 'Next_serviced_date'],
            ],
        });

        if (!userAirConditionService) {
            return res.status(404).json({ message: messages.error.SERVICE_NOT_FOUND, status: messages.error.STATUS });
        }

        if (userAirConditionService.Media_url) {
            userAirConditionService.Media_url = process.env.BASE_URL + userAirConditionService.Media_url;
        }

        const responseData = userAirConditionService.get();

        return res.status(200).json({
            data: responseData,
            status: messages.success.STATUS
        });
    } catch (error) {
        return next(error);
    }
}



// Delete Service by ID
async function deleteServiceBYID(req, res, next) {
    // #swagger.tags = ['Service']
    // #swagger.description = 'Delete Service by id'
    try {
        const userAirConditionService = await UserAirConditionServiceModel.findByPk(req.params.id);
        if (userAirConditionService) {
            await userAirConditionService.destroy();
            const fileName = path.basename(userAirConditionService.Media_url);
            const outputFilePath = path.join(process.env.USERAIRCONDITIONSERVICE_MEDIA_PATH, fileName)
            if (fs.existsSync(outputFilePath)) {
                // Delete the image file
                fs.unlinkSync(outputFilePath);
            }
            return res.status(200).json({ message: messages.success.USERAIRCONDITIONSERVICE_DELETED, status: messages.success.STATUS });
        } else {
            return res.status(404).json({ message: messages.error.USERAIRCONDITIONSERVICE_NOT_FOUND, status: messages.error.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}

// get AllDATA
async function getServiceWithPagination(req, res, next) {
    // #swagger.tags = ['Service']
    // #swagger.description = 'Get Service with pagination'
    try {
        const { page = 1, limit, search = '' } = req.query;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
        const whereClause = {};
        if (search) {
            whereClause.AC_name = { [Op.like]: `%${search}%` };
        }
        const options = {
            attributes: [
                'ID',
                'UserID',
                'AC_name',
                'Media_url',  // Include Media_url in the selected attributes
                [Sequelize.literal('DATE_FORMAT(Purchase_date, "%d/%m/%Y")'), 'Purchase_date'],
                [Sequelize.literal('DATE_FORMAT(Last_serviced_date, "%d/%m/%Y")'), 'Last_serviced_date'],
                [Sequelize.literal('DATE_FORMAT(DATE_ADD(Last_serviced_date, INTERVAL 3 MONTH), "%d/%m/%Y")'), 'Next_serviced_date'],
            ],
            where: whereClause,
            offset: offset,
            limit: limit ? parseInt(limit, 10) : null,
        };
        const { count, rows: userAirConditionService } = await UserAirConditionServiceModel.findAndCountAll(options);

        // Fetch user names based on UserID values in userAirConditionService
        const userIds = userAirConditionService.map(service => service.UserID);
        const userNames = await UserModel.findAll({
            attributes: ['ID', 'NAME'],
            where: {
                ID: userIds
            },
            raw: true
        });
        // Calculate Next_serviced_date for each record based on Last_serviced_date
        const mappedServices = userAirConditionService.map(service => {
            const user = userNames.find(data => data.ID === service.UserID);
            const userName = user ? user.NAME : null;
            return {
                ...service.get(),
                Media_url: process.env.BASE_URL + service.Media_url,
                User_name: userName || null
            };
        });

        const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);
        return res.status(200).json({
            data: mappedServices,
            totalPages,
            status: messages.success.STATUS,
            currentPage,
            totalRecords: count
        });
    } catch (error) {
        return next(error);
    }
}

//get all databy userid
async function getAllServiceByUserID(req, res, next) {
    // #swagger.tags = ['Service']
    // #swagger.description = 'Get Service with pagination'
    try {
        const { id } = req.params;
        const userAirConditionService = await UserAirConditionServiceModel.findAll({
            where: { UserID: id },
            attributes: [
                'ID',
                'UserID',
                'AC_name',
                'Media_url',  // Include Media_url in the selected attributes
                [Sequelize.literal('DATE_FORMAT(Purchase_date, "%d/%m/%Y")'), 'Purchase_date'],
                [Sequelize.literal('DATE_FORMAT(Last_serviced_date, "%d/%m/%Y")'), 'Last_serviced_date'],
                [Sequelize.literal('DATE_FORMAT(DATE_ADD(Last_serviced_date, INTERVAL 3 MONTH), "%d/%m/%Y")'), 'Next_serviced_date'],
            ],
        });

        // Fetch user names based on UserID values in userAirConditionService
        const userIds = userAirConditionService.map(service => service.UserID);
        const userNames = await UserModel.findAll({
            attributes: ['ID', 'NAME'],
            where: {
                ID: userIds
            },
            raw: true
        });
        // Calculate Next_serviced_date for each record based on Last_serviced_date
        const mappedServices = userAirConditionService.map(service => {
            const user = userNames.find(data => data.ID === service.UserID);
            const userName = user ? user.NAME : null;

            return {
                ...service.get(),
                Media_url: process.env.BASE_URL + service.Media_url,
                User_name: userName || null
            };
        });
        return res.status(200).json({
            data: mappedServices,
            status: messages.success.STATUS
        });
    } catch (error) {
        return next(error);
    }
}




module.exports = {
    addUpdateService,
    getServiceById,
    deleteServiceBYID,
    getServiceWithPagination,
    getAllServiceByUserID
};