const CategoryModel = require('../models/category');
const messages = require('../utils/messages');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// // Add Update category
async function addUpdateCategory(req, res, next) {
    // #swagger.tags = ['Category']
    // #swagger.description = 'Add or update category details'
    let { Name, Description, CategoryImageURL, id } = req.body;
    try {
        let loginUser = req.user;
        let categoryImage = '';
        if (req.file) {
            categoryImage = `${process.env.CATEGORY_IMAGE_ROUTE}${req.file.filename}`
        }
        if (!id) {
            // Check if the Category name already exists
            const existingCategory = await CategoryModel.findOne({
                where: { Name }
            });

            if (existingCategory) {
                return res.status(400).json({ message: messages.error.CATEGORY_NAME_EXISTS, status: messages.error.STATUS });
            }
            await CategoryModel.create({
                Name,
                Description,
                Image_url: categoryImage,
                Created_by: loginUser.ID
            });

            return res.status(200).json({ message: messages.success.CATEGORY_CREATED, status: messages.success.STATUS });

        }
        else {
            // Find the existing Category record
            const existingCategory = await CategoryModel.findByPk(id);
            if (!existingCategory) {
                return res.status(404).json({ message: messages.error.CATEGORY_NOT_FOUND, status: messages.error.STATUS });
            }
            // Check if the Category name already exists
            if (Name && Name !== existingCategory.Name) {
                const existingCategoryName = await CategoryModel.findOne({
                    where: {
                        Name,
                        ID: { [Op.not]: id } // Exclude the current record being updated
                    }
                });
                if (existingCategoryName) {
                    return res.status(400).json({ message: messages.error.CATEGORY_NAME_EXISTS, status: messages.STATUS.STATUS });
                }
            }

            if (Name) {
                existingCategory.Name = Name;
            }
            if (Description) {
                existingCategory.Description = Description;
            }
            if (categoryImage !== "") {
                existingCategory.Image_url = categoryImage;
            }
            existingCategory.Updated_by = loginUser.ID;
            // Save the updated details to database 
            await existingCategory.save();

            return res.status(200).json({ message: messages.success.CATEGORY_UPDATE, status: messages.success.STATUS });
        }
    } catch (error) {
        return next(error);
    }

}

// // getCategoryBYID
async function getCategoryById(req, res, next) {
    // #swagger.tags = ['Category']
    // #swagger.description = 'Get category by ID'

    try {
        const { id } = req.params;

        const category = await CategoryModel.findOne({
            where: { ID: id },
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] }
        });

        if (!category) {
            return res.status(404).json({ message: messages.error.CATEGORY_NOT_FOUND, status: messages.error.STATUS });
        }
        if (category.Image_url)
            category.Image_url = process.env.BASE_URL + category.Image_url;

        return res.status(200).json({ data:category,status: messages.success.STATUS});
    } catch (error) {
        return next(error);
    }

}

// // Delete a Category by ID
async function deleteCategory(req, res, next) {
    // #swagger.tags = ['Category']
    // #swagger.description = 'Delete category by id'
    try {
        const category = await CategoryModel.findByPk(req.params.id);
        if (category) {
            await category.destroy();
            const fileName = path.basename(category.Image_url);
            const outputFilePath = path.join(process.env.CATEGORY_IMAGE_PATH, fileName)
            if (fs.existsSync(outputFilePath)) {
                // Delete the image file
                fs.unlinkSync(outputFilePath);
            }
            return res.status(200).json({ message: messages.success.CATEGORY_DELETED, status: messages.success.STATUS });
        } else {
            return res.status(404).json({ message: messages.error.CATEGORY_NOT_FOUND, status: messages.error.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}

// get AllDATA
async function getCategoryWithPagination(req, res, next) {
    // #swagger.tags = ['Category']
    // #swagger.description = 'Get categorys with pagination'
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

      
        const { count, rows: category } = await CategoryModel.findAndCountAll(options);
        category.forEach(category => {
            if (category.Image_url)
                category.Image_url = process.env.BASE_URL + category.Image_url;
        });

        const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);

        return res.status(200).json({ data: category, status: messages.success.STATUS, totalPages, currentPage, totalRecords: count });
    } catch (error) {
        return next(error);
    }
}
module.exports = {
    addUpdateCategory,
    getCategoryById,
    deleteCategory,
    getCategoryWithPagination
};