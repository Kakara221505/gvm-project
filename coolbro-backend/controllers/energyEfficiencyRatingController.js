
const EnergyEfficiencyRatingModel = require('../models/energyEfficiencyRating');
const messages = require('../utils/messages');
const { Op } = require('sequelize');

// // Add Update EnergyEfficiencyRating
async function addUpdateEnergyEfficiencyRating(req, res, next) {
    // #swagger.tags = ['EnergyEfficiencyRating']
    // #swagger.description = 'Add or update EnergyEfficiencyRating details'
    let { Name, id } = req.body;
    try {
        let loginUser = req.user;
        if (!id) {
            // Check if the EnergyEfficiencyRating name already exists
            const existingEnergyEfficiencyRating = await EnergyEfficiencyRatingModel.findOne({
                where: { Name }
            });
            if (existingEnergyEfficiencyRating) {
                return res.status(400).json({ message: messages.error.ENERGY_EFFICIENCY_RATING_NAME_EXISTS,status: messages.error.STATUS});
            }
            await EnergyEfficiencyRatingModel.create({
                Name,
                Created_by: loginUser.ID
            });

            return res.status(200).json({ message: messages.success.ENERGY_EFFICIENCY_RATING_CREATED,status: messages.success.STATUS});
        }
        else {
            // Find the existing EnergyEfficiencyRating record
            const existingEnergyEfficiencyRating = await EnergyEfficiencyRatingModel.findByPk(id);
            if (!existingEnergyEfficiencyRating) {
                return res.status(404).json({ message: messages.error.ENERGY_EFFICIENCY_RATING_NOT_FOUND,status: messages.error.STATUS, });
            }
            // Check if the updated EnergyEfficiencyRatingName already exists
            if (Name && Name !== existingEnergyEfficiencyRating.Name) {
                const existingEnergyEfficiencyRatingName = await EnergyEfficiencyRatingModel.findOne({
                    where: {
                        Name,
                        ID: { [Op.not]: id } // Exclude the current record being updated
                    }
                });

                if (existingEnergyEfficiencyRatingName) {
                    return res.status(400).json({ message: messages.error.ENERGY_EFFICIENCY_RATING_NAME_EXISTS,status: messages.error.STATUS});
                }
            }
            if (Name) {
                existingEnergyEfficiencyRating.Name = Name;
            }

            existingEnergyEfficiencyRating.Updated_by = loginUser.ID;
            // Save the updated details to database 
            await existingEnergyEfficiencyRating.save();
            return res.status(200).json({ message: messages.success.ENERGY_EFFICIENCY_RATING_UPDATE,status: messages.success.STATUS});
        }
    } catch (error) {
        return next(error);
    }

}

// // get EnergyEfficiencyRating BY ID
async function getEnergyEfficiencyRatingId(req, res, next) {
    // #swagger.tags = ['EnergyEfficiencyRating']
    // #swagger.description = 'Get EnergyEfficiencyRating by ID'
    try {
        const { id } = req.params;
        const energyEfficiencyRating = await EnergyEfficiencyRatingModel.findOne({
            where: { ID: id },
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] }
        });

        if (!energyEfficiencyRating) {
            return res.status(404).json({ message: messages.error.ENERGY_EFFICIENCY_RATING_NOT_FOUND,status: messages.error.STATUS});
        }
        return res.status(200).json({ data:energyEfficiencyRating,status: messages.success.STATUS});
    } catch (error) {
        return next(error);
    }

}

// // Delete a EnergyEfficiencyRating by ID
async function deleteEnergyEfficiencyRating(req, res, next) {
    // #swagger.tags = ['EnergyEfficiencyRating']
    // #swagger.description = 'Delete EnergyEfficiencyRating by id'
    try {
        const energyEfficiencyRating = await EnergyEfficiencyRatingModel.findByPk(req.params.id);
        if (energyEfficiencyRating) {
            await energyEfficiencyRating.destroy();
            return res.status(200).json({ message: messages.success.ENERGY_EFFICIENCY_RATING_DELETED,status: messages.success.STATUS});
        } else {
            return res.status(404).json({ message: messages.error.ENERGY_EFFICIENCY_RATING_NOT_FOUND,status: messages.error.STATUS});
        }
    } catch (error) {
        return next(error);
    }
}

// get AllDATA
async function getEnergyEfficiencyRatingWithPagination(req, res, next) {
    // #swagger.tags = ['EnergyEfficiencyRating']
    // #swagger.description = 'Get EnergyEfficiencyRating with pagination'
    try {
        const { page = 1, limit, search = '' } = req.query;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
        const whereClause = {};
        if (search) {
            whereClause.Name  = { [Op.like]: `%${search}%` };
        }

        const options = {
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] },
            where: whereClause,
            offset: offset,
            limit: limit ? parseInt(limit, 10) : null,
            order: [['ID', 'DESC']],
        };
        const { count, rows: energyEfficiencyRating } = await EnergyEfficiencyRatingModel.findAndCountAll(options);
        const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);
        return res.status(200).json({ data:energyEfficiencyRating,status: messages.success.STATUS,totalPages, currentPage, totalRecords: count });
    } catch (error) {
        return next(error);
    }
}
module.exports = {
    addUpdateEnergyEfficiencyRating,
    getEnergyEfficiencyRatingId,
    deleteEnergyEfficiencyRating,
    getEnergyEfficiencyRatingWithPagination
};