const commonFunctions = require('../utils/commonFunctions');
const fs = require('fs');
const path = require('path');
const CollaborationPermissionModel = require('../models/collaborationPermission');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const messages = require('../utils/messages');



// AddUpdate collaborationPermission
async function addUpdateCollaborationPermission(req, res, next) {
    // #swagger.tags = ['collaborationPermission']
    // #swagger.description = 'Add or update collaborationPermission details'
    let { UserID, ProjectID, CanView, CanEdit, CanDelete, CanShare, CanManageLayers, CanManageUsers, id } = req.body;
    try {
        let loginUser = req.user;
        if (!id) {
            await CollaborationPermissionModel.create({
                UserID,
                ProjectID,
                CanView,
                CanEdit,
                CanDelete,
                CanShare,
                CanManageLayers,
                CanManageUsers
            });

            return res.status(200).json({ message: messages.success.COLLABORATION_PERMISSION_CREATED, status: messages.success.STATUS });
        } else {
            // Find the existing collaborationPermission record
            const existingCollaborationPermission = await CollaborationPermissionModel.findByPk(id);
            if (!existingCollaborationPermission) {
                return res.status(404).json({ message: messages.error.COLLABORATION_PERMISSION_NOT_FOUND, status: messages.error.STATUS });
            }

            if (UserID) {
                existingCollaborationPermission.UserID = UserID;
            }
            if (ProjectID) {
                existingCollaborationPermission.ProjectID = ProjectID;
            }
            if (CanView) {
                existingCollaborationPermission.CanView = CanView;
            }
            if (CanEdit) {
                existingCollaborationPermission.CanEdit = CanEdit;
            }
            if (CanDelete) {
                existingCollaborationPermission.CanDelete = CanDelete;
            }
            if (CanShare) {
                existingCollaborationPermission.CanShare = CanShare;
            }
            if (CanManageLayers) {
                existingCollaborationPermission.CanManageLayers = CanManageLayers;
            }
            if (CanManageUsers) {
                existingCollaborationPermission.CanManageUsers = CanManageUsers;
            }

            // Save the updated details to database 
            await existingCollaborationPermission.save();
            return res.status(200).json({ message: messages.success.COLLABORATION_PERMISSION_UPDATE, status: messages.success.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}

// get collaborationPermission BY ID
async function getCollaborationPermissionById(req, res, next) {
    // #swagger.tags = ['collaborationPermission']
    // #swagger.description = 'Get collaborationPermission by ID'
    try {
        const { id } = req.params;
        const collaborationPermission= await CollaborationPermissionModel.findOne({
            where: { ID: id },
            attributes: { exclude: ['Created_at', 'Updated_at'] }
        });

        if (!collaborationPermission) {
            return res.status(404).json({ message: messages.error.COLLABORATION_PERMISSION_NOT_FOUND,status: messages.error.STATUS});
        }
        return res.status(200).json({ data:collaborationPermission,status: messages.success.STATUS});
    } catch (error) {
        return next(error);
    }

}

// Delete a collaborationPermission by ID
async function deleteCollaborationPermission(req, res, next) {
    // #swagger.tags = ['collaborationPermission']
    // #swagger.description = 'Delete collaborationPermission by id'
    try {
        const collaborationPermission = await CollaborationPermissionModel.findByPk(req.params.id);
        if (collaborationPermission) {
            await collaborationPermission.destroy();
            return res.status(200).json({ message: messages.success.COLLABORATION_PERMISSION_DELETED,status: messages.success.STATUS});
        } else {
            return res.status(404).json({ message: messages.error.COLLABORATION_PERMISSION_NOT_FOUND,status: messages.error.STATUS});
        }
    } catch (error) {
        return next(error);
    }
}
// get AllDATA collaborationPermission
async function getCollaborationPermissionAllDataWithPagination(req, res, next) {
    // #swagger.tags = ['collaborationPermission']
    // #swagger.description = 'Get collaborationPermission with pagination'
    try {
        const { page = 1, limit, search = '' } = req.query;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
        // const whereClause = {};
        // if (search) {
        //     whereClause.Layer_name  = { [Op.like]: `%${search}%` };
        // }

        const options = {
            attributes: { exclude: ['Created_at', 'Updated_at'] },
            // where: whereClause,
            offset: offset,
            limit: limit ? parseInt(limit, 10) : null,
            order: [['ID', 'DESC']],
        };
        const { count, rows: collaborationPermission } = await CollaborationPermissionModel.findAndCountAll(options);
        const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);
        return res.status(200).json({ data:collaborationPermission,status: messages.success.STATUS,totalPages, currentPage, totalRecords: count });
    } catch (error) {
        return next(error);
    }
}







module.exports = {
    addUpdateCollaborationPermission,
    getCollaborationPermissionById,
    deleteCollaborationPermission,
    getCollaborationPermissionAllDataWithPagination

};
