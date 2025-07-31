const ContactUsModel = require('../models/contactUs');
const messages = require('../utils/messages');
const { Op } = require('sequelize');

//Add Update ContactUs
async function addContactUs(req, res, next) {
    // #swagger.tags = ['ContactUs']
    // #swagger.description = 'Add or update ContactUs details'
    let { Name,Email,Subject,Message,Phone} = req.body;
    try {
            await ContactUsModel.create({
                Name,
                Email,
                Subject,
                Message,
                Phone
            });

            return res.status(200).json({ message: messages.success.CONTACTUS_CREATED,status: messages.success.STATUS});
        
    } catch (error) {
        return next(error);
    }

}


// get AllDATA
async function getContactUsPagination(req, res, next) {
    // #swagger.tags = ['ContactUs']
    // #swagger.description = 'Get ContactUs with pagination'
    try {
        const { page = 1, limit, search = '' } = req.query;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
        const whereClause = {
            [Op.or]: [
                {
                    Name: {
                        [Op.like]: `%${search}%`,
                    },
                },
                {
                    Email: {
                        [Op.like]: `%${search}%`,
                    },
                },
            ],
        };

        const options = {
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] },
            where: whereClause,
            offset: offset,
            order: [['ID', 'DESC']], 
            limit: limit ? parseInt(limit, 10) : null,
        };
        const { count, rows: contactUs } = await ContactUsModel.findAndCountAll(options);
        const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);
        return res.status(200).json({ data:contactUs,status: messages.success.STATUS,totalPages, currentPage, totalRecords: count });
    } catch (error) {
        return next(error);
    }
}
module.exports = {
    addContactUs,
    getContactUsPagination
};