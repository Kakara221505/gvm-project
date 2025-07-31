const Address = require('../models/Address'); // Import Address model
const messages = require('../utils/messages'); // Import messages file


async function createAddress(req, res, next) {
    try {
        const user_id = req.user.id; // Extract user ID from authenticated token
        const newAddress = new Address({ ...req.body, userId: user_id }); // Add userId to request body

        const savedAddress = await newAddress.save();

        res.status(200).json({
            status: messages.success.STATUS, // Changed `success` to `status`
            message: messages.success.ADDRESS_CREATED,
            data: savedAddress
        });
    } catch (error) {
        next(error);
    }
}


async function getAllAddresses(req, res, next) {
    try {
        // Set up pagination parameters
        const page = parseInt(req.query.page) || 1; // Default to page 1 if no page query is provided
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if no limit query is provided

        // Calculate total records
        const totalRecords = await Address.countDocuments();

        // Calculate total pages
        const totalPages = Math.ceil(totalRecords / limit);

        // Find the addresses for the current page
        const addresses = await Address.find()
            .skip((page - 1) * limit) // Skip items for the current page
            .limit(limit); // Limit the number of results

        res.status(200).json({
            status: messages.success.STATUS,
            message: messages.success.ADDRESS_FETCHED,
            data: addresses,
            totalPages: totalPages,
            currentPage: page,
            totalRecords: totalRecords
        });
    } catch (error) {
        next(error);
    }
}



async function getAddressById(req, res, next) {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) {
            return res.status(404).json({
                status: messages.error.STATUS,
                message: messages.error.ADDRESS_NOT_FOUND
            });
        }
        res.status(200).json({
            status: messages.success.STATUS,
            message: messages.success.ADDRESS_FETCHED,
            data: address
        });
    } catch (error) {
        next(error);
    }
}


async function updateShippingAddress(req, res, next) {
    try {
        const updatedAddress = await Address.findByIdAndUpdate(req.body.id, req.body, { new: true });
        if (!updatedAddress) {
            return res.status(404).json({
              status: messages.error.STATUS,
              message: messages.error.ADDRESS_NOT_FOUND
            });
        }
        res.status(200).json({
           status: messages.success.STATUS,
          message: messages.success.ADDRESS_UPDATED,
            data: updatedAddress
        });
    } catch (error) {
        next(error);
    }
}



async function updateAddress(req, res, next) {
    try {
        // Assuming the ID is part of the route parameter (e.g., /update/:id)
        const updatedAddress = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        if (!updatedAddress) {
            return res.status(404).json({
                status: messages.error.STATUS,
                message: messages.error.ADDRESS_NOT_FOUND
            });
        }
        
        res.status(200).json({
            status: messages.success.STATUS,
            message: messages.success.ADDRESS_UPDATED,
            data: updatedAddress
        });
    } catch (error) {
        next(error);
    }
}


async function deleteAddress(req, res, next) {
    try {
        const deletedAddress = await Address.findByIdAndDelete(req.params.id);
        if (!deletedAddress) {
            return res.status(404).json({
               status: messages.error.STATUS,
               message: messages.error.ADDRESS_NOT_FOUND
            });
        }
        res.status(200).json({
           status: messages.success.STATUS,
            message: messages.success.ADDRESS_DELETED
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createAddress,
    getAllAddresses,
    getAddressById,
    updateShippingAddress,
    deleteAddress,
    updateAddress
};
