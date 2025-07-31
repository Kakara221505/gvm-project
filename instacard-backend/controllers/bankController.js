const Bank = require('../models/Bank');
const messages = require('../utils/messages');

async function createBankDetails(req, res, next) {
    try {
        const userID = req.user.id;
        const { account_holder_name, account_number, bank_name, ifcs_code } = req.body;

        // Check if the bank details already exist
        const existingBank = await Bank.findOne({ account_number });
        if (existingBank) {
            return res.status(400).json({status: messages.error.STATUS,message: messages.error.BANK_ALREADY_EXISTS });
        }

        const newBank = new Bank({ userID, account_holder_name, account_number, bank_name, ifcs_code });
        await newBank.save();

        return res.status(200).json({status:messages.success.STATUS, message: messages.success.BANK_DETAILS_ADDED, data: newBank });
    } catch (error) {
        next(error);
    }
}


async function getBankDetails(req, res, next) {
    try {
        const userID = req.user.id;

        const bankDetails = await Bank.findOne({ userID });
        if (!bankDetails) {
            return res.status(404).json({status: messages.error.STATUS, message: messages.error.BANK_NOT_FOUND});
        }

        return res.status(200).json({status: messages.success.STATUS, message:messages.success.BANK_FETCHED, data: bankDetails });
    } catch (error) {
        next(error);
    }
}


async function updateBankDetails(req, res, next) {
    try {
        const userID = req.user.id;
        const { account_holder_name, account_number, bank_name, ifcs_code } = req.body;

        const bankDetails = await Bank.findOne({ userID });
        if (!bankDetails) {
            return res.status(404).json({ status: messages.error.STATUS,message: messages.error.BANK_NOT_FOUND });
        }

        if (account_holder_name) bankDetails.account_holder_name = account_holder_name;
        if (account_number) {
            const existingAccount = await Bank.findOne({ account_number, _id: { $ne: bankDetails._id } });
            if (existingAccount) {
                return res.status(400).json({ status: messages.error.STATUS,message: messages.error.BANK_ALREADY_EXISTS  });
            }
            bankDetails.account_number = account_number;
        }
        if (bank_name) bankDetails.bank_name = bank_name;
        if (ifcs_code) bankDetails.ifcs_code = ifcs_code;

        await bankDetails.save();

        return res.status(200).json({  status: messages.success.STATUS,message:messages.success.BANK_DETAILS_UPDATED, data: bankDetails });
    } catch (error) {
        next(error);
    }
}
async function deleteBankDetails(req, res, next) {
    try {
        const { id } = req.body; 

        const bankDetails = await Bank.findByIdAndDelete(id);
        if (!bankDetails) {
            return res.status(404).json({ 
                status: messages.error.STATUS, 
                message: messages.error.BANK_NOT_FOUND 
            });
        }

        return res.status(200).json({  
            status: messages.success.STATUS, 
            message: messages.success.BANK_DETAILS_DELETED 
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { createBankDetails, getBankDetails, updateBankDetails,deleteBankDetails };
