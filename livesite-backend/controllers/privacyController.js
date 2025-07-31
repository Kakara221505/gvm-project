const PrivacyModel = require('../models/Privacy');
const messages = require('../utils/messages');

const addUpdatePrivacy = async (req, res, next) => {
    try {
        const { Policy } = req.body; // HTML content from the frontend

        if (!Policy) {
            return res.status(400).json({ message: messages.error.POLICY_REQUIRED, status: messages.error.STATUS });
        }

        // Check if a privacy policy already exists
        const existingPolicy = await PrivacyModel.findOne();

        if (existingPolicy) {
            // Update the existing policy
            existingPolicy.Policy = Policy;
            existingPolicy.Updated_at = new Date();
            await existingPolicy.save();

            return res.status(200).json({ message: messages.success.PRIVACY_POLICY_ADDED, status: messages.success.STATUS});
        }
        

        // Create a new policy
        await PrivacyModel.create({ Policy });

        return res.status(200).json({ message: messages.success.PRIVACY_POLICY_ADDED, status: messages.success.STATUS});
    } catch (error) {
        return next(error);
    }
};



const getPrivacy = async (req, res, next) => {
    try {
        // Fetch the latest privacy policy
        const privacyPolicy = await PrivacyModel.findOne({
            attributes: ['Policy'], // Fetch only the Policy field
        });

        if (!privacyPolicy) {
            return res.status(200).json({ Policy: [] });
        }

        return res.status(200).json({ Policy: privacyPolicy.Policy });
    } catch (error) {
        return next(error);
    }
};



module.exports = {
    addUpdatePrivacy,
    getPrivacy
};
