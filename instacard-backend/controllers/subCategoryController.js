const SubCategoryModel = require('../models/SubCategory');
const messages = require('../utils/messages');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

function convertToObjectId(id) {
    return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
}

async function addUpdateSubCategory(req, res, next) {
    // #swagger.tags = ['SubCategory']
    // #swagger.description = 'Add or update subcategory details'
    let { CategoryID, SubCategoryName, SubCategoryImageUrl, id } = req.body; // Use SubCategoryImageURL here

    try {
        let loginUser = req.user;
        let subCategoryImage = '';
        const categoryID = convertToObjectId(CategoryID);
        // Handle file upload for subcategory image
        if (req.file) {
            subCategoryImage = `${process.env.SUB_CATEGORY_IMAGE_ROUTE}${req.file.filename}`;
        }

        if (!id) {
            // Check if the SubCategory name already exists under the same category
            const existingSubCategory = await SubCategoryModel.findOne({ 
                SubCategoryName, 
                CategoryID:categoryID 
            });

            if (existingSubCategory) {
                return res.status(400).json({ message: messages.error.SUB_CATEGORY_NAME_EXISTS, status: messages.error.STATUS });
            }

            // Create new subcategory
            const newSubCategory = new SubCategoryModel({
                CategoryID,
                SubCategoryName,
                SubCategoryImageUrl: subCategoryImage,  // Save image URL as SubcategoryImageUrl
                Created_at: new Date(),
            });
            await newSubCategory.save();

            return res.status(200).json({ message: messages.success.SUB_CATEGORY_CREATED, status: messages.success.STATUS });
        } else {
            // Update existing subcategory
            const existingSubCategory = await SubCategoryModel.findById(id);
            if (!existingSubCategory) {
                return res.status(404).json({ message: messages.error.SUB_CATEGORY_NOT_FOUND, status: messages.error.STATUS });
            }

            // Check if the SubCategory name already exists under the same category, excluding the current subcategory
            if (SubCategoryName && SubCategoryName !== existingSubCategory.SubCategoryName) {
                const existingSubCategoryName = await SubCategoryModel.findOne({ 
                    SubCategoryName, 
                    CategoryID, 
                    _id: { $ne: id }
                });
                if (existingSubCategoryName) {
                    return res.status(400).json({ message: messages.error.SUB_CATEGORY_NAME_EXISTS, status: messages.error.STATUS });
                }
            }

            // Update fields
            if (SubCategoryName) {
                existingSubCategory.SubCategoryName = SubCategoryName;
            }
            if (subCategoryImage) {
                existingSubCategory.SubcategoryImageUrl = subCategoryImage;
            }
            existingSubCategory.Updated_at = new Date();

            // Save updated subcategory
            await existingSubCategory.save();

            return res.status(200).json({ message: messages.success.SUB_CATEGORY_UPDATE, status: messages.success.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}


// Get SubCategory by ID
async function getSubCategoryById(req, res, next) {
    // #swagger.tags = ['SubCategory']
    // #swagger.description = 'Get subcategory by ID'
    try {
        const { id } = req.params;

        const subCategory = await SubCategoryModel.findById(id)
            .populate('CategoryID', 'Name')  // Assuming you want to also return the category name
            .select('-Created_at -Updated_at');

        if (!subCategory) {
            return res.status(404).json({ message: messages.error.SUB_CATEGORY_NOT_FOUND, status: messages.error.STATUS });
        }

        if (subCategory.SubcategoryImageUrl) {
            subCategory.SubcategoryImageUrl = process.env.BASE_URL + subCategory.SubcategoryImageUrl;
        }

        return res.status(200).json({ data: subCategory, status: messages.success.STATUS });
    } catch (error) {
        return next(error);
    }
}

// Delete SubCategory
async function deleteSubCategory(req, res, next) {
    try {
        const subCategory = await SubCategoryModel.findById(req.params.id);

        if (!subCategory) {
            return res.status(404).json({ message: messages.error.SUB_CATEGORY_NOT_FOUND, status: messages.error.STATUS });
        }

        // Delete subcategory image if it exists
        if (subCategory.SubcategoryImageUrl) {
            const fileName = path.basename(subCategory.SubcategoryImageUrl);
            const outputFilePath = path.join(process.env.SUB_CATEGORY_IMAGE_PATH, fileName);

            if (fs.existsSync(outputFilePath)) {
                try {
                    fs.unlinkSync(outputFilePath);
                } catch (err) {
                    console.error("Error deleting image file:", err);
                }
            }
        }

        // Delete the subcategory from the database
        await SubCategoryModel.deleteOne({ _id: req.params.id });

        return res.status(200).json({ message: messages.success.SUB_CATEGORY_DELETED, status: messages.success.STATUS });
    } catch (error) {
        return next(error);
    }
}

// Get SubCategories with Pagination
async function getSubCategoryWithPagination(req, res, next) {
    try {
        const { page = 1, limit, search = '', categoryIds } = req.query;

        const skip = (page - 1) * (limit ? parseInt(limit, 10) : 0);
        const whereClause = {};

        // Case-insensitive search for SubCategoryName
        if (search) {
            whereClause.SubCategoryName = { $regex: search, $options: 'i' };
        }

        // Filter by array of categoryIds (if provided)
        if (categoryIds) {
            let parsedCategoryIds = Array.isArray(categoryIds)
                ? categoryIds // Already an array
                : [categoryIds]; // Convert to an array if it's a single value

            if (parsedCategoryIds.length > 0) {
                whereClause.CategoryID = { $in: parsedCategoryIds };
            }
        }

        // Find subcategories with limit and offset
        const subCategories = await SubCategoryModel.find(whereClause)
            .skip(skip)
            .limit(limit ? parseInt(limit, 10) : 10)
            .select('-Created_at -Updated_at')
            .lean();

        // Get total count of filtered subcategories
        const totalCount = await SubCategoryModel.countDocuments(whereClause);
        const totalPages = limit ? Math.ceil(totalCount / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);

        // Adjust image URLs if available
        subCategories.forEach(subCategory => {
            if (subCategory.SubCategoryImageUrl) {
                subCategory.SubCategoryImageUrl = `${process.env.BASE_URL}${subCategory.SubCategoryImageUrl}`;
            }
        });

        return res.status(200).json({
            data: subCategories,
            status: messages.success.STATUS,
            totalPages,
            currentPage,
            totalRecords: totalCount
        });

    } catch (error) {
        return next(error);
    }
}




module.exports = {
    addUpdateSubCategory,
    getSubCategoryById,
    deleteSubCategory,
    getSubCategoryWithPagination
};
