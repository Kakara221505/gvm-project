const ContactUsModel = require('../models/ContactUs');
const messages = require('../utils/messages');

// Add or Update ContactUs
async function addContactUs(req, res, next) {
    // #swagger.tags = ['ContactUs']
    // #swagger.description = 'Add or update ContactUs details'
    const { Name, Email, Subject, Message, Phone } = req.body;

    try {
        const newContact = new ContactUsModel({
            Name,
            Email,
            Subject,
            Message,
            Phone
        });

        await newContact.save();

        return res.status(200).json({ message: messages.success.CONTACTUS_CREATED, status: messages.success.STATUS });

    } catch (error) {
        return next(error);
    }
}


// Get ContactUs with Pagination
async function getContactUsPagination(req, res, next) {
    // #swagger.tags = ['ContactUs']
    // #swagger.description = 'Get ContactUs with pagination'
    try {
        const { page = 1, limit, search = '' } = req.query;

        // Calculate pagination
        const pageNumber = parseInt(page, 10);
        const pageLimit = limit ? parseInt(limit, 10) : 10; // default limit to 10
        const skip = (pageNumber - 1) * pageLimit;

        // Search filter
        const searchRegex = new RegExp(search, 'i');  // Case-insensitive search regex

        // MongoDB query for pagination and search
        const filter = {
            $or: [
                { Name: { $regex: searchRegex } },
                { Email: { $regex: searchRegex } }
            ]
        };

        // Fetch data from MongoDB
        const contactUs = await ContactUsModel.find(filter)
            .skip(skip)
            .limit(pageLimit)
            .sort({ _id: -1 }) // Sort by descending order of the _id field (similar to 'ID DESC' in Sequelize)

        const count = await ContactUsModel.countDocuments(filter);  // Get total count of matching documents

        const totalPages = Math.ceil(count / pageLimit);
        const currentPage = pageNumber;

        return res.status(200).json({
            data: contactUs,
            status: messages.success.STATUS,
            totalPages,
            currentPage,
            totalRecords: count
        });

    } catch (error) {
        return next(error);
    }
}

module.exports = {
    addContactUs,
    getContactUsPagination
};
