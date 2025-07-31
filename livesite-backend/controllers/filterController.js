const commonFunctions = require('../utils/commonFunctions');
const fs = require('fs');
const path = require('path');
const FilterModel = require('../models/Filter');
const ProjectModel = require('../models/Project'); // Adjust the path as per your structure
const PageModel = require('../models/page');
const LayerModel = require('../models/layer');
const BackgroundItemsModel = require('../models/BackGroundItems');
const AnnotationModel = require('../models/annotation');
const CategoryModel = require('../models/Cateogry');
const OrganizationUserRealtionModel = require('../models/OrganizationUserRelation');
const SubCategoryModel = require('../models/SubCateogry');
// const UserModel = require('../models/user');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const messages = require('../utils/messages');
const nodemailer = require('nodemailer');

// AddUpdate Filter

async function addUpdateFilter(req, res, next) {
    // #swagger.tags = ['Filter']
    // #swagger.description = 'Add or update Filter details'
    let { Name, UserID, Filter, id } = req.body;
    try {
        let loginUser = req.user;
        if (!id) {
            // Check if the Filter name already exists
            const FilterData = await FilterModel.findOne({
                where: { Name,UserID }
            });
            if (FilterData) {
                return res.status(400).json({ message: messages.error.FILTER_NAME_EXISTS,status: messages.error.STATUS});
            }
            await FilterModel.create({
                Name,
                UserID,
                Filter
            });

            return res.status(200).json({ message: messages.success.FILTER_CREATED,status: messages.success.STATUS});
        }
        else {
            // Find the existing Filter record
            const filter = await FilterModel.findByPk(id);
            if (!filter) {
                return res.status(404).json({ message: messages.error.Filter_NOT_FOUND,status: messages.error.STATUS, });
            }
            // Check if the updated filter already exists
            if (Name && Name !== filter.Name) {
                const filter = await FilterModel.findOne({
                    where: {
                        Name,
                        ID: { [Op.not]: id } // Exclude the current record being updated
                    }
                });

                if (filter) {
                    return res.status(400).json({ message: messages.error.FILTER_NAME_EXISTS,status: messages.error.STATUS});
                }
            }
            if (Name) {
                filter.Name = Name;
            }
            if (Filter) {
                filter.Filter = Filter;
            }

            // Save the updated details to database 
            await filter.save();
            return res.status(200).json({ message: messages.success.FILTER_UPDATED,status: messages.success.STATUS});
        }
    } catch (error) {
        return next(error);
    }

}





async function getFilterAllData(req, res, next) {
    // #swagger.tags = ['Filter']
    // #swagger.description = 'Get Filter with pagination'
    try {
        const { page = 1, limit, search = '', UserID } = req.query;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);

        const whereClause = {};

        // Add UserID to the where clause if provided
        if (UserID) {
            whereClause.UserID = UserID;
        }

        // Add search functionality if provided
        if (search) {
            whereClause.Name  = { [Op.like]: `%${search}%` };
        }

        const options = {
            attributes: { exclude: ['Created_at', 'Updated_at','Filter'] },
            where: whereClause,
            offset: offset,
            limit: limit ? parseInt(limit, 10) : null,
            order: [['ID', 'DESC']],
        };

        const { count, rows: filters } = await FilterModel.findAndCountAll(options);

        const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);

        return res.status(200).json({ 
            data: filters, 
            status: messages.success.STATUS, 
            totalPages, 
            currentPage, 
            totalRecords: count 
        });
    } catch (error) {
        return next(error);
    }
}

async function getFilterByID(req, res, next) {
    // #swagger.tags = ['Filter']
    // #swagger.description = 'Get Filter by ID'
    try {
        const { id } = req.query;

        // Validate if ID is provided
        if (!id) {
            return res.status(400).json({ message: 'ID is required.' });
        }

        // Fetch the filter by ID
        const filter = await FilterModel.findOne({
            where: { ID: id },
            attributes: { exclude: ['Created_at', 'Updated_at'] }
        });

        // Check if filter exists
        if (!filter) {
            return res.status(404).json({ message: messages.error.Filter_NOT_FOUND,status: messages.success.STATUS, });
        }

        // Return the filter data in the response
        return res.status(200).json({ data: filter, status: messages.error.STATUS,  });
    } catch (error) {
        console.error('Error fetching filter:', error);
        return next(error);
    }
}

async function applyFilter(req, res, next) {
    // #swagger.tags = ['Filter']
    // #swagger.description = 'Get Filter by ID'
    try {
        let loginUser = req.user; 
        const { organizationId, userId, layerId, categoryIds, subCategoryIds, Type } = req.body;

        // Step 1: Fetch Projects based on User ID and Organization IDs
        const projects = await ProjectModel.findAll({
            where: {
                UserID: loginUser.ID,  // Filter by user ID
            },
            attributes: { exclude: ['Created_at', 'Updated_at'] },
        });
       
        // Step 2: Fetch Pages for the retrieved Projects
        const projectIds = projects.map(project => project.ID);
        const pages = await PageModel.findAll({
            where: {
                ProjectID: { [Op.in]: projectIds } // Fetch pages belonging to fetched projects
            },
            attributes: { exclude: ['Created_at', 'Updated_at'] },
        });
        // Step 3: Fetch Background Items for the retrieved Pages
        const pageIds = pages.map(page => page.ID);
        const backgrounds = await BackgroundItemsModel.findAll({
            where: {
                PageID: { [Op.in]: pageIds } // Fetch background items for fetched pages
            },
            attributes: { exclude: ['Created_at', 'Updated_at'] },
        });
        // Step 4: Fetch Layers for the retrieved Pages
        const layers = await LayerModel.findAll({
            where: {
                PageID: { [Op.in]: pageIds }, // Fetch layers for fetched pages
                ID: layerId
            },
            attributes: { exclude: ['Created_at', 'Updated_at'] },
        });
        // Step 5: Get Users associated with the provided OrganizationID
        const organizationUsers = await OrganizationUserRealtionModel.findAll({
            where: {
                OrganizationID: organizationId, // Filter by Organization ID
                Is_deleted: false, // Ensure only active user relations
                Is_approved: true, // Ensure only approved relations
            },
            attributes: ['UserID'],
        });

        const organizationUserIds = organizationUsers.map(user => user.UserID);

        // Step 6: Fetch Annotations for the retrieved Layers
        const layerIds = layers.map(layer => layer.ID);
        console.log("layer1",Type)
        
        const annotations = await AnnotationModel.findAll({
            where: {
                LayerID: { [Op.in]: layerIds }, // Fetch annotations for fetched layers
                UserID: { [Op.in]: organizationUserIds }, // Filter by user IDs related to the organization
                Type: Type, // Filter by Annotation Type if provided
                CategoryID: { [Op.in]: categoryIds }, // Filter by category IDs if provided
                SubCategoryID: { [Op.in]: subCategoryIds }, // Filter by sub-category IDs if provided
            },
            attributes: { exclude: ['Created_at', 'Updated_at'] },
        });

        // Step 7: Map the Annotations to their respective Layers
        const layersWithAnnotations = layers.map(layer => {
            const filteredAnnotations = annotations.filter(ann => ann.LayerID === layer.ID);
            return {
                ...layer.dataValues,
                annotations: filteredAnnotations
            };
        });

        // Step 8: Map the Layers and Backgrounds to their respective Pages
        const pagesWithLayersAndBackgrounds = pages.map(page => {
            const background = backgrounds.find(bg => bg.PageID === page.ID);
            const filteredLayers = layersWithAnnotations.filter(layer => layer.PageID === page.ID);

            return {
                ID: page.ID,
                name: page.Name,
                background: background ? {
                    ID: background.ID,
                    UserID: background.UserID,
                    ProjectID: background.ProjectID,
                    PageID: background.PageID,
                    Type: background.Type,
                    BackGroundColor: background.BackGroundColor,
                    Is_default: background.Is_default,
                } : null,
                calendar: {
                    layers: filteredLayers,
                },
            };
        });

        // Step 9: Combine the Data to Form the Final Response
        const response = projects.map(project => ({
            project: {
                ID: project.ID,
                UserID: project.UserID,
                Name: project.Name,
                Description: project.Description,
            },
            pages: pagesWithLayersAndBackgrounds.filter(page => page.background && projectIds.includes(page.background.ProjectID))
        }));

        // Step 10: Send Response
        res.json(response);

    } catch (error) {
        console.error('Error fetching filter:', error);
        return next(error);
    }
}















module.exports = {
    getFilterAllData,
    addUpdateFilter,
    getFilterByID,
    applyFilter
};
