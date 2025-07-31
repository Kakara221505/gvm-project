
const BrandModel = require('../models/brand');
const messages = require('../utils/messages');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// // Add Update Brand
async function addUpdateBrand(req, res, next) {
    // #swagger.tags = ['Brand']
    // #swagger.description = 'Add or update Brand details'
    let { Name, BrandImageURL, id } = req.body;
    try {
        let loginUser = req.user;
        let brandImage = '';
        if (req.file) {
            brandImage = `${process.env.BRAND_IMAGE_ROUTE}${req.file.filename}`
        }
        if (!id) {
            // Check if the Brand name already exists
            const existingBrand = await BrandModel.findOne({
                where: { Name }
            });

            if (existingBrand) {
                return res.status(400).json({ message: messages.error.BRAND_NAME_EXISTS,status: messages.error.STATUS});
            }
            await BrandModel.create({
                Name,
                Image_url: brandImage,
                Created_by: loginUser.ID
            });

            return res.status(200).json({ message: messages.success.BRAND_CREATED,status: messages.success.STATUS});

        }
        else {
            // Find the existing Brand record
            const existingBrand = await BrandModel.findByPk(id);
            if (!existingBrand) {
                return res.status(404).json({ message: messages.error.BRAND_NOT_FOUND,status: messages.error.STATUS});
            }
            // Check if the Brand name already exists
            if (Name && Name !== existingBrand.Name) {
                const existingBrandName = await BrandModel.findOne({
                    where: {
                        Name,
                        ID: { [Op.not]: id } // Exclude the current record being updated
                    }
                });
                if (existingBrandName) {
                    return res.status(400).json({ message: messages.error.BRAND_NAME_EXISTS,status: messages.error.STATUS });
                }
            }

            if (Name) {
                existingBrand.Name = Name;
            }
            if (brandImage !== "") {
                existingBrand.Image_url = brandImage;
            }
            existingBrand.Updated_by = loginUser.ID;
            // Save the updated details to database 
            await existingBrand.save();

            return res.status(200).json({ message: messages.success.BRAND_UPDATE,status: messages.success.STATUS});
        }
    } catch (error) {
        return next(error);
    }

}

// // getBrandBYID
async function getBrandById(req, res, next) {
    // #swagger.tags = ['Brand']
    // #swagger.description = 'Get Brand by ID'
    try {
        const { id } = req.params;
        const brand = await BrandModel.findOne({
            where: { ID: id },
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] }
        });

        if (!brand) {
            return res.status(404).json({ message: messages.error.BRAND_NOT_FOUND,status: messages.error.STATUS});
        }
        if (brand.Image_url)
            brand.Image_url = process.env.BASE_URL + brand.Image_url;
        return res.status(200).json({ data:brand,status: messages.success.STATUS, });
    } catch (error) {
        return next(error);
    }

}

// // Delete a Brand by ID
async function deleteBrand(req, res, next) {
    // #swagger.tags = ['Brand']
    // #swagger.description = 'Delete Brand by id'
    try {
        const brand = await BrandModel.findByPk(req.params.id);
        if (brand) {
            await brand.destroy();
            const fileName = path.basename(brand.Image_url);
            const outputFilePath = path.join(process.env.BRAND_IMAGE_PATH, fileName)
            if (fs.existsSync(outputFilePath)) {
                // Delete the image file
                fs.unlinkSync(outputFilePath);
            }
            return res.status(200).json({ message: messages.success.BRAND_DELETED,status: messages.success.STATUS});
        } else {
            return res.status(404).json({ message: messages.error.BRAND_NOT_FOUND,status: messages.error.STATUS});
        }
    } catch (error) {
        return next(error);
    }
}

// get AllDATA
async function getBrandWithPagination(req, res, next) {
    // #swagger.tags = ['Brand']
    // #swagger.description = 'Get Brand with pagination'
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
            order: [['ID', 'DESC']], 
            limit: limit ? parseInt(limit, 10) : null,
        };
        const { count, rows: brand } = await BrandModel.findAndCountAll(options);
        brand.forEach(brand => {
            if (brand.Image_url)
                brand.Image_url = process.env.BASE_URL + brand.Image_url;
        });
        const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);
        return res.status(200).json({ data:brand, totalPages,status: messages.success.STATUS, currentPage, totalRecords: count });
    } catch (error) {
        return next(error);
    }
}
module.exports = {
    addUpdateBrand,
    getBrandById,
    deleteBrand,
    getBrandWithPagination
};