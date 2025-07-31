const commonFunctions = require('../utils/commonFunctions');
const fs = require('fs');
const path = require('path');
const CategoryModel = require('../models/Cateogry');
const SubCategoryModel = require('../models/SubCateogry');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const messages = require('../utils/messages');
const nodemailer = require('nodemailer');

// get Category

async function getCategoryData(req, res, next) {
    try {
        // Fetch all categories from the database
        const categories = await CategoryModel.findAll({
            attributes: ['ID', 'CategoryName',],
            where: {
                // You can add conditions here if you want to filter the categories
                // e.g., Is_deleted: false, User_type: 1, etc.
            },
            order: [['Created_at', 'DESC']] // Optional: Order by created date descending
        });

        // Return the list of categories in the response
        return res.status(200).json({
            status: messages.success.STATUS,
            data: categories,
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return next(error);
    }
}

async function getSubCategoryData(req, res, next) {
    try {
        const { CategoryID } = req.body;

        // Validate if CategoryID is provided and is an array
        if (!Array.isArray(CategoryID)) {
            return res.status(400).json({ message: 'CategoryID must be an array.' });
        }

        // Build the where clause based on the provided CategoryID array
        const whereClause = CategoryID.length > 0 ? { CategoryID } : {};

        // Fetch subcategories based on the where clause
        const subCategories = await SubCategoryModel.findAll({
            where: whereClause,
            attributes: ['ID', 'SubCategoryName'],
            order: [['Created_at', 'DESC']] // Optional: Sort by creation date descending
        });

        // Return the list of subcategories in the response
        return res.status(200).json({
            status: messages.success.STATUS,
            data: subCategories
        });
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        return next(error);
    }
}







module.exports = {
    getCategoryData,
    getSubCategoryData
   
};
