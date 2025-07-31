
const Variation = require('../models/Variation');
const messages = require('../utils/messages');


async function addVariation(req, res, next) {
    try {
        const { ProductID, Type, Value } = req.body;
        const newVariation = new Variation({ ProductID, Type, Value });
        await newVariation.save();
        res.status(200).json({ message: 'Variation added successfully', variation: newVariation });
    } catch (error) {
        next(error);
    }
}
async function getVariations(req, res, next) {
    try {
        const variations = await Variation.find().populate('ProductID');
        res.status(200).json({status:messages.success.STATUS,message:messages.success.VARIATION_FETCHED, data:variations });
    } catch (error) {
        next(error);
    }
}
async function getVariationById(req, res, next) {
    try {
        const { id } = req.params;
        const variation = await Variation.findById(id).populate('ProductID');
        res.status(200).json({ status:messages.success.STATUS,message:messages.success.VARIATION_FETCHED,data:variation });
    } catch (error) {
        next(error);
    }
}
async function updateVariation(req, res, next) {
    try {
        const { id } = req.params;
        const { Type, Value } = req.body;
        const updatedVariation = await Variation.findByIdAndUpdate(
            id,
            { Type, Value },
            { new: true, runValidators: true }
        );
        res.status(200).json({ status:messages.success.STATUS,message:messages.success.VARIATION_UPDATED,data: updatedVariation });
    } catch (error) {
        next(error);
    }
}
async function deleteVariation(req, res, next) {
    try {
        const { id } = req.params;
        const deletedVariation = await Variation.findByIdAndDelete(id);
        if (!deletedVariation) {
            return res.status(404).json({ status:messages.error.STATUS,message: messages.error.VARIATION_NOT_FOUND});
        }
        res.status(200).json({ status:messages.success.STATUS,message:messages.success.VARIATION_DELETED});
    } catch (error) {
        next(error);
    }
}
module.exports = {
    addVariation,
    getVariations,
    getVariationById,
    updateVariation,
    deleteVariation
};