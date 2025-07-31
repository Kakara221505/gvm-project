const VariationModel = require('../models/variation');
const messages = require('../utils/messages');
const { Op } = require('sequelize');

// // Add Update Variation
async function addUpdateVariation(req, res, next) {
    // #swagger.tags = ['Variation']
    // #swagger.description = 'Add or update Variation details'
    let { ProductID, Type, Value, id } = req.body;
    try {
        let loginUser = req.user;
        if (!id) {
            // Check if the Variation already exists
            const existingVariation = await VariationModel.findOne({
                where: { ProductID, Type, Value }
            });
            if (existingVariation) {
                return res.status(400).json({ message: messages.error.VARIATION_DETAILS_EXISTS, status: messages.error.STATUS });
            }

            await VariationModel.create({
                ProductID,
                Type,
                Value,
                Created_by: loginUser.ID
            });

            return res.status(200).json({ message: messages.success.VARIATION_CREATED, status: messages.success.STATUS });
        }
        else {
            // Find the existing Variation record
            const existingVariation = await VariationModel.findByPk(id);
            if (!existingVariation) {
                return res.status(404).json({ message: messages.error.VARIATION_NOT_FOUND, status: messages.error.STATUS, });
            }
            // Check if the combination of ProductID, Type, and Value already exists
            if ((ProductID !== existingVariation.ProductID || Type !== existingVariation.Type || Value !== existingVariation.Value)) {
                const existingCombination = await VariationModel.findOne({
                    where: {
                        ProductID,
                        Type,
                        Value,
                        ID: { [Op.not]: id } // Exclude the current record being updated
                    }
                });

                if (existingCombination) {
                    return res.status(400).json({ message: messages.error.VARIATION_DETAILS_EXISTS, status: messages.error.STATUS });
                }
            }
            if (ProductID) {
                existingVariation.ProductID = ProductID;
            }
            if (Type) {
                existingVariation.Type = Type;
            }
            if (Value) {
                existingVariation.Value = Value;
            }

            existingVariation.Updated_by = loginUser.ID;
            // Save the updated details to database 
            await existingVariation.save();
            return res.status(200).json({ message: messages.success.VARIATION_UPDATE, status: messages.success.STATUS });
        }
    } catch (error) {
        return next(error);
    }

}

// // get Variation by ID
async function getVariationById(req, res, next) {
    // #swagger.tags = ['Variation']
    // #swagger.description = 'Get Variation by ID'
    try {
        const { id } = req.params;
        const variation = await VariationModel.findOne({
            where: { ID: id },
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] }
        });

        if (!variation) {
            return res.status(404).json({ message: messages.error.VARIATION_NOT_FOUND, status: messages.error.STATUS, });
        }
        return res.status(200).json({ data: variation, status: messages.success.STATUS });
    } catch (error) {
        return next(error);
    }

}

// // Delete a Variation by ID
async function deleteVariation(req, res, next) {
    // #swagger.tags = ['Variation']
    // #swagger.description = 'Delete Variation by id'
    try {
        const variation = await VariationModel.findByPk(req.params.id);
        if (variation) {
            await variation.destroy();
            return res.status(200).json({ message: messages.success.VARIATION_DELETED, status: messages.success.STATUS });
        } else {
            return res.status(404).json({ message: messages.error.VARIATION_NOT_FOUND, status: messages.error.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}

// get AllDATA
async function getAllVariationByProductID(req, res, next) {
    // #swagger.tags = ['Variation']
    // #swagger.description = 'Get Variation with pagination'
    try {
        const { id } = req.params;
        const variation = await VariationModel.findAll({
            where: { ProductID: id },
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] }
        });
        return res.status(200).json({ data: variation, status: messages.success.STATUS });
    } catch (error) {
        return next(error);
    }
}
module.exports = {
    addUpdateVariation,
    getVariationById,
    deleteVariation,
    getAllVariationByProductID
};

