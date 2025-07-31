const CategoryModel = require('../models/Category');
const SubCategoryModel = require('../models/SubCategory');
const messages = require('../utils/messages');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Add or Update Category
async function addUpdateCategory(req, res, next) {
    // #swagger.tags = ['Category']
    // #swagger.description = 'Add or update category details'
    let { Name, Description, CategoryImageURL, id } = req.body;
    try {
        let loginUser = req.user;
        let categoryImage = '';

        // Handle file upload for category image
        if (req.file) {
            categoryImage = `${process.env.CATEGORY_IMAGE_ROUTE}${req.file.filename}`;
        }

        if (!id) {
            // Check if the Category name already exists
            const existingCategory = await CategoryModel.findOne({ Name });

            if (existingCategory) {
                return res.status(400).json({ message: messages.error.CATEGORY_NAME_EXISTS, status: messages.error.STATUS });
            }

            // Create new category
            const newCategory = new CategoryModel({
                Name,
                Description,
                Image_url: categoryImage,
                Created_by: loginUser.ID
            });
            await newCategory.save();

            return res.status(200).json({ message: messages.success.CATEGORY_CREATED, status: messages.success.STATUS });
        } else {
            // Update existing category
            const existingCategory = await CategoryModel.findById(id);
            if (!existingCategory) {
                return res.status(404).json({ message: messages.error.CATEGORY_NOT_FOUND, status: messages.error.STATUS });
            }

            // Check if the Category name already exists, excluding current category
            if (Name && Name !== existingCategory.Name) {
                const existingCategoryName = await CategoryModel.findOne({ Name, _id: { $ne: id } });
                if (existingCategoryName) {
                    return res.status(400).json({ message: messages.error.CATEGORY_NAME_EXISTS, status: messages.STATUS.STATUS });
                }
            }

            // Update fields
            if (Name) {
                existingCategory.Name = Name;
            }
            if (Description) {
                existingCategory.Description = Description;
            }
            if (categoryImage) {
                existingCategory.Image_url = categoryImage;
            }
            existingCategory.Updated_by = loginUser.ID;

            // Save updated category
            await existingCategory.save();

            return res.status(200).json({ message: messages.success.CATEGORY_UPDATE, status: messages.success.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}
// Get Category by ID
async function getCategoryById(req, res, next) {
    // #swagger.tags = ['Category']
    // #swagger.description = 'Get category by ID'
    try {
        const { id } = req.params;

        const category = await CategoryModel.findById(id, { createdAt: 0, updatedAt: 0, createdBy: 0, updatedBy: 0 });

        if (!category) {
            return res.status(404).json({ message: messages.error.CATEGORY_NOT_FOUND, status: messages.error.STATUS });
        }

        if (category.Image_url) {
            category.Image_url = process.env.BASE_URL + category.Image_url;
        }

        return res.status(200).json({ data: category, status: messages.success.STATUS });
    } catch (error) {
        return next(error);
    }
}


async function deleteCategory(req, res, next) {
    try {
        const category = await CategoryModel.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: messages.error.CATEGORY_NOT_FOUND, status: messages.error.STATUS });
        }

        // Delete category image if it exists
        if (category.Image_url) {  
            const fileName = path.basename(category.Image_url);
            const outputFilePath = path.join(process.env.CATEGORY_IMAGE_PATH, fileName);

            if (fs.existsSync(outputFilePath)) {
                try {
                    fs.unlinkSync(outputFilePath);
                } catch (err) {
                    console.error("Error deleting image file:", err);
                }
            }
        }

        // Delete the category from the database
        await CategoryModel.deleteOne({ _id: req.params.id });

        return res.status(200).json({ message: messages.success.CATEGORY_DELETED, status: messages.success.STATUS });

    } catch (error) {
        return next(error);
    }
}



// Get categories with pagination
async function getCategoryWithPagination(req, res, next) {
    // #swagger.tags = ['Category']
    // #swagger.description = 'Get categories with pagination, including subcategories'

    try {
        const { page = 1, limit, search = '' } = req.query;

        // Pagination calculation (skip and limit)
        const skip = (page - 1) * (limit ? parseInt(limit, 10) : 0);
        const whereClause = {};

        // If search query exists, apply regex search for Name
        if (search) {
            whereClause.Name = { $regex: search, $options: 'i' };  // Case insensitive search
        }

        // Find categories with limit, skip, and whereClause filter
        const categories = await CategoryModel.find(whereClause)
            .skip(skip)
            .limit(limit ? parseInt(limit, 10) : 10)
            .select('-Created_at -CreatedBy -UpdatedAt -UpdatedBy')  // Exclude unnecessary fields
            .lean()  // Convert Mongoose documents to plain JavaScript objects
            .exec();

        // Get Subcategories for each Category
        for (let category of categories) {
            // Fetch subcategories for the current category
            const subCategories = await SubCategoryModel.find({ CategoryID: category._id })
                .select('SubCategoryName SubCategoryImageUrl');  // Select only the needed fields for subcategories

            // Add subcategories to the current category
            category.subcategories = subCategories;
        }

        // Adjust image URLs if available
        categories.forEach(category => {
            category._id = category._id.toString();  // Convert ObjectId to string
            if (category.Image_url) {
                category.Image_url = process.env.BASE_URL + category.Image_url;
            }
            // Ensure subcategories have their _id as string
            if (category.subcategories) {
                category.subcategories = category.subcategories.map(sub => {
                    sub._id = sub._id.toString();  // Convert ObjectId to string
                    // Prepend base URL to SubCategoryImageUrl
                    if (sub.SubCategoryImageUrl) {
                        sub.SubCategoryImageUrl = process.env.BASE_URL + sub.SubCategoryImageUrl;
                    }
                    return sub;
                });
            }
        });

        // Total count of categories (for pagination)
        const totalCount = await CategoryModel.countDocuments(whereClause);
        const totalPages = limit ? Math.ceil(totalCount / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);

        // Return response with categories, pagination, and status
        return res.status(200).json({
            data: categories,  // Ensure subcategories are included here
            status: messages.success.STATUS,
            totalPages,
            currentPage,
            totalRecords: totalCount
        });

    } catch (error) {
        // Error handling
        return next(error);
    }
}








module.exports = {
    addUpdateCategory,
    getCategoryById,
    deleteCategory,
    getCategoryWithPagination
};