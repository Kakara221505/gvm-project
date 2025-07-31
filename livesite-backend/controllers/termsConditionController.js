const TermsAndConditionModel = require('../models/TermsAndCondition');

const messages = require('../utils/messages');

const addUpdateTermsAndCondition = async (req, res, next) => {
    try {
        const { TermsCondition } = req.body; // HTML content from the frontend

        if (!TermsCondition) {
            return res.status(400).json({ message: messages.error.TERMS_CONDITION_REQUIRED, status: messages.error.STATUS });
        }

        // Check if a terms condition already exists
        const existingTermsCondition = await TermsAndConditionModel.findOne();

        if (existingTermsCondition) {
            // Update the existing existingTermsCondition
            existingTermsCondition.TermsCondition = TermsCondition;
            existingTermsCondition.Updated_at = new Date();
            await existingTermsCondition.save();

            return res.status(200).json({ message: messages.success.TERMS_CONDITION_UPDATE, status: messages.success.STATUS});
        }
        

        // Create a new TermsCondition
        await TermsAndConditionModel.create({ TermsCondition });

        return res.status(200).json({ message: messages.success.TERMS_CONDITION_ADDED, status: messages.success.STATUS});
    } catch (error) {
        return next(error);
    }
};



const getTermsCondition = async (req, res, next) => {
    try {
        // Fetch the latest TermsCondition policy
        const termsCondition = await TermsAndConditionModel.findOne({
            attributes: ['TermsCondition'], // Fetch only the Policy field
        });

        if (!termsCondition) {
            return res.status(200).json({ TermsCondition: [] });
        }

        return res.status(200).json({ TermsCondition: termsCondition.TermsCondition });
    } catch (error) {
        return next(error);
    }
};


module.exports = {
    addUpdateTermsAndCondition,
    getTermsCondition
};
