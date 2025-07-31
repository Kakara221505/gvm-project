const commonFunctions = require('../utils/commonFunctions');
const fs = require('fs');
const path = require('path');
const LayerModel = require('../models/layer');
const PageModel = require('../models/page');
const AnnotationModel = require('../models/annotation');
const { Op, fn, col, literal, Sequelize } = require('sequelize');
const messages = require('../utils/messages');



// AddUpdate layer
// async function addUpdateLayer(req, res, next) {
//     // #swagger.tags = ['layer']
//     // #swagger.description = 'Add or update layer details'

//     const { UserID, PageID, Name, IsLocked, AssignDate, collapsed, IsVisible, FillColor, Layer_order, StrokeColor, IsGroup, StrokeWidth, Font_size, Font_family, StrokeType, id } = req.body;
//     try {
//         if (!id) {
//             // Check if the layer name already exists for the same PageID
//             // const existingLayer = await LayerModel.findOne({
//             //     where: { Name,PageID, AssignDate, }
//             // });
//             const todayDateString = new Date().toISOString().split('T')[0];

//             const query = {
//                 where: {
//                     Name,
//                     PageID,
//                     [Op.and]: literal(`DATE(AssignDate) = DATE('${todayDateString}')`)
//                 }
//             };

//             console.log("fdf",query)

//             const existingLayer = await LayerModel.findOne(query);
//             if (existingLayer) {
//                 return res.status(400).json({ message: messages.error.LAYER_NAME_EXISTS, status: messages.error.STATUS });
//             }

//             // Find the highest Layer_order for the given UserID and PageID
//             const maxLayerOrder = await LayerModel.max('Layer_order', {
//                 where: { UserID, PageID }
//             });
//             console.log("hii",maxLayerOrder)

//             // Calculate the next Layer_order value
//             const nextLayerOrder = maxLayerOrder !== null ? maxLayerOrder + 1 : 1;
//             console.log("nextLayerOrder",nextLayerOrder)

//             const newLayer = await LayerModel.create({
//                 UserID,
//                 PageID,
//                 Name,
//                 Layer_order: nextLayerOrder,
//                 IsLocked,
//                 IsVisible,
//                 FillColor,
//                 StrokeColor,
//                 StrokeWidth,
//                 Font_size,
//                 Font_family,
//                 StrokeType,
//                 IsGroup,
//                 collapsed,
//                 Group_Name: '',
//                 AssignDate: new Date(),
//             });
//             const newLayerID = newLayer.ID;

//             return res.status(200).json({ message: messages.success.LAYER_CREATED, status: messages.success.STATUS,layerID: newLayerID });
//         } else {
//             // Find the existing layer record
//             const existingLayer = await LayerModel.findByPk(id);
//             if (!existingLayer) {
//                 return res.status(404).json({ message: messages.error.LAYER_NOT_FOUND, status: messages.error.STATUS });
//             }
//             // Check if the updated layer name already exists for the same PageID
//             if (Name && Name !== existingLayer.Name) {
//                 const existingLayerName = await LayerModel.findOne({
//                     where: {
//                         Name,
//                         PageID,
//                         AssignDate,
//                         ID: { [Op.not]: id } // Exclude the current record being updated
//                     }
//                 });

//                 if (existingLayerName) {
//                     return res.status(400).json({ message: messages.error.LAYER_NAME_EXISTS, status: messages.error.STATUS });
//                 }
//             }
//             // Check if the updated layer order is unique for the same page ID
//             // if (Layer_order && Layer_order !== existingLayer.Layer_order) {
//             //     const existingLayerOrder = await LayerModel.findOne({
//             //         where: { PageID, Layer_order }
//             //     });

//             //     if (existingLayerOrder) {
//             //         return res.status(400).json({ message: messages.error.LAYER_ORDER_EXISTS, status: messages.error.STATUS });
//             //     }
//             // }
//             // Update layer details
//             if (UserID) {
//                 existingLayer.UserID = UserID;
//             }
//             if (Name) {
//                 existingLayer.Name = Name;
//             }
//             if (Layer_order) {
//                 existingLayer.Layer_order = Layer_order;
//             }
//             if (IsLocked !== undefined) { // Check if IsLocked is provided in the request body
//                 existingLayer.IsLocked = IsLocked;
//             }
//             if (IsVisible !== undefined) { // Check if IsVisible is provided in the request body
//                 existingLayer.IsVisible = IsVisible;
//             }
//             if (collapsed !== undefined) { // Check if IsLocked is provided in the request body
//                 existingLayer.Collapsed = collapsed;
//             }
//             if (FillColor) {
//                 existingLayer.FillColor = FillColor;
//             }
//             if (StrokeColor) {
//                 existingLayer.StrokeColor = StrokeColor;
//             }
//             if (StrokeWidth) {
//                 existingLayer.StrokeWidth = StrokeWidth;
//             }
//             if (Font_size) {
//                 existingLayer.Font_size = Font_size;
//             }
//             if (Font_family) {
//                 existingLayer.Font_family = Font_family;
//             }

//             if (collapsed) {
//                 existingLayer.collapsed = collapsed;
//             }
//             if (StrokeType) {
//                 existingLayer.StrokeType = StrokeType;
//             }

//             // Save the updated details to the database 
//             await existingLayer.save();
//             return res.status(200).json({ message: messages.success.LAYER_UPDATE, status: messages.success.STATUS });
//         }
//     } catch (error) {
//         return next(error);
//     }
// }

async function addUpdateLayer(req, res, next) {
    const { UserID, PageID, Name, IsLocked, collapsed, IsVisible, FillColor, Layer_order, StrokeColor, IsGroup, StrokeWidth, Font_size, Font_family, StrokeType, id } = req.body;

    try {
        // Fetch the associated project ID using PageID
        const page = await PageModel.findOne({ where: { ID: PageID } });
        if (!page) {
            return res.status(400).json({ message: 'Page not found.', status: messages.error.STATUS });
        }
        const projectID = page.ProjectID;

        if (!id) {
            // Check if a layer with the same name already exists in the project
            const existingLayer = await LayerModel.findOne({
                where: {
                    Name,
                    PageID: {
                        [Op.in]: Sequelize.literal(`(SELECT ID FROM Page WHERE ProjectID = ${projectID})`)
                    }
                }
            });

            if (existingLayer) {
                return res.status(400).json({ message: messages.error.LAYER_NAME_EXISTS, status: messages.error.STATUS });
            }

            // Find the highest Layer_order for the given UserID and PageID
            const maxLayerOrder = await LayerModel.max('Layer_order', {
                where: { UserID, PageID }
            });

            // Calculate the next Layer_order value
            const nextLayerOrder = maxLayerOrder !== null ? maxLayerOrder + 1 : 1;

            // Create the new layer
            const newLayer = await LayerModel.create({
                UserID,
                PageID,
                Name,
                Layer_order: nextLayerOrder,
                IsLocked,
                IsVisible,
                FillColor,
                StrokeColor,
                StrokeWidth,
                Font_size,
                Font_family,
                StrokeType,
                IsGroup,
                collapsed,
                Group_Name: '',
                AssignDate: new Date(),
            });

            const newLayerID = newLayer.ID;

            return res.status(200).json({ message: messages.success.LAYER_CREATED, status: messages.success.STATUS, layerID: newLayerID });
        } else {
            // Find the existing layer record
            const existingLayer = await LayerModel.findByPk(id);
            if (!existingLayer) {
                return res.status(404).json({ message: messages.error.LAYER_NOT_FOUND, status: messages.error.STATUS });
            }

            // Check if the updated layer name already exists in the project
            if (Name && Name !== existingLayer.Name) {
                const existingLayerName = await LayerModel.findOne({
                    where: {
                        Name,
                        PageID: {
                            [Op.in]: Sequelize.literal(`(SELECT ID FROM Page WHERE ProjectID = ${projectID})`)
                        },
                        ID: { [Op.not]: id } // Exclude the current record being updated
                    }
                });

                if (existingLayerName) {
                    return res.status(400).json({ message: messages.error.LAYER_NAME_EXISTS, status: messages.error.STATUS });
                }
            }

            // Update layer details
            if (UserID) existingLayer.UserID = UserID;
            if (Name) existingLayer.Name = Name;
            if (Layer_order) existingLayer.Layer_order = Layer_order;
            if (IsLocked !== undefined) existingLayer.IsLocked = IsLocked;
            if (IsVisible !== undefined) existingLayer.IsVisible = IsVisible;
            if (collapsed !== undefined) existingLayer.Collapsed = collapsed;
            if (FillColor) existingLayer.FillColor = FillColor;
            if (StrokeColor) existingLayer.StrokeColor = StrokeColor;
            if (StrokeWidth) existingLayer.StrokeWidth = StrokeWidth;
            if (Font_size) existingLayer.Font_size = Font_size;
            if (Font_family) existingLayer.Font_family = Font_family;
            if (StrokeType) existingLayer.StrokeType = StrokeType;

            // Save the updated details to the database 
            await existingLayer.save();
            return res.status(200).json({ message: messages.success.LAYER_UPDATE, status: messages.success.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}


// addNewLayer basis update annotation
async function addUpdateLayerAnnotation(req, res, next) {
    // #swagger.tags = ['layer']
    // #swagger.description = 'Add or update layer details'

    const { UserID, PageID, Name, IsLocked, collapsed, AssignDate, IsVisible, annotationIds, FillColor, StrokeColor, IsGroup, StrokeWidth, Font_size, Font_family, StrokeType, id } = req.body; // Destructure fields from request body
    try {
        if (!id) {
            // Check if the layer name already exists for the same PageID
            // const existingLayer = await LayerModel.findOne({
            //     where: { Name, PageID,AssignDate }
            // });
            // const todayDateString = new Date().toISOString().split('T')[0];

            // const query = {
            //     where: {
            //         Name,
            //         PageID,
            //         [Op.and]: literal(`DATE(AssignDate) = DATE('${todayDateString}')`)
            //     }
            // };

            // const existingLayer = await LayerModel.findOne(query);
            // if (existingLayer) {
            //     return res.status(400).json({ message: messages.error.LAYER_NAME_EXISTS, status: messages.error.STATUS });
            // }
            // Fetch the associated project ID using PageID
            const page = await PageModel.findOne({ where: { ID: PageID } });
            if (!page) {
                return res.status(400).json({ message: 'Page not found.', status: messages.error.STATUS });
            }
            const projectID = page.ProjectID;
            // Check if a layer with the same name already exists in the project
            const existingLayer = await LayerModel.findOne({
                where: {
                    Name,
                    PageID: {
                        [Op.in]: Sequelize.literal(`(SELECT ID FROM Page WHERE ProjectID = ${projectID})`)
                    }
                }
            });

            if (existingLayer) {
                return res.status(400).json({ message: messages.error.LAYER_NAME_EXISTS, status: messages.error.STATUS });
            }


            // Find the highest Layer_order for the given UserID and PageID
            const maxLayerOrder = await LayerModel.max('Layer_order', {
                where: { UserID, PageID }
            });

            // Calculate the next Layer_order value
            const nextLayerOrder = maxLayerOrder !== null ? maxLayerOrder + 1 : 1;

            const newLayer = await LayerModel.create({
                UserID,
                PageID,
                Name,
                Layer_order: nextLayerOrder,
                IsLocked,
                IsVisible,
                FillColor,
                StrokeColor,
                StrokeWidth,
                Font_size,
                Font_family,
                StrokeType,
                IsGroup,
                collapsed,
                Group_Name: '',
                AssignDate: new Date(),
            });
            const newLayerID = newLayer.ID;

            if (annotationIds && Array.isArray(annotationIds)) {
                await AnnotationModel.update({ LayerID: newLayerID }, {
                    where: {
                        front_no_id: annotationIds
                    }
                });
            }

            return res.status(200).json({ message: messages.success.LAYER_CREATED, status: messages.success.STATUS, layerID: newLayerID });
        }
    } catch (error) {
        return next(error);
    }
}


// mergeLayer 
async function mergeLayer(req, res, next) {
    // #swagger.tags = ['layer']
    // #swagger.description = 'Merge Layer'

    const { UserID, PageID, Name, IsLocked, collapsed, AssignDate, IsVisible, layerIds, FillColor, StrokeColor, IsGroup, StrokeWidth, Font_size, Font_family, StrokeType, id } = req.body; // Destructure fields from request body
    try {
        if (!id) {
            // Check if the layer name already exists for the same PageID
            // const existingLayer = await LayerModel.findOne({
            //     where: { Name, PageID,AssignDate }
            // });
            // const todayDateString = new Date().toISOString().split('T')[0];

            // const query = {
            //     where: {
            //         Name,
            //         PageID,
            //         [Op.and]: literal(`DATE(AssignDate) = DATE('${todayDateString}')`),
            //         ID: { [Op.notIn]: layerIds || [] }
            //     }
            // };

            // const existingLayer = await LayerModel.findOne(query);
            // if (existingLayer) {
            //     return res.status(400).json({ message: messages.error.LAYER_NAME_EXISTS, status: messages.error.STATUS });
            // }

            const page = await PageModel.findOne({ where: { ID: PageID } });
            if (!page) {
                return res.status(400).json({ message: 'Page not found.', status: messages.error.STATUS });
            }
            const projectID = page.ProjectID;
            // Check if a layer with the same name already exists in the project
            const existingLayer = await LayerModel.findOne({
                where: {
                    Name,
                    PageID: {
                        [Op.in]: Sequelize.literal(`(SELECT ID FROM Page WHERE ProjectID = ${projectID})`)
                    }
                }
            });

            if (existingLayer) {
                return res.status(400).json({ message: messages.error.LAYER_NAME_EXISTS, status: messages.error.STATUS });
            }


            // Find the highest Layer_order for the given UserID and PageID
            const maxLayerOrder = await LayerModel.max('Layer_order', {
                where: { UserID, PageID }
            });

            // Calculate the next Layer_order value
            const nextLayerOrder = maxLayerOrder !== null ? maxLayerOrder + 1 : 1;

            const newLayer = await LayerModel.create({
                UserID,
                PageID,
                Name,
                Layer_order: nextLayerOrder,
                IsLocked,
                IsVisible,
                FillColor,
                StrokeColor,
                StrokeWidth,
                Font_size,
                Font_family,
                StrokeType,
                IsGroup,
                collapsed,
                Group_Name: '',
                AssignDate: new Date(),
            });
            const newLayerID = newLayer.ID;

            // Update annotations with the new layer ID
            if (layerIds && Array.isArray(layerIds)) {
                await AnnotationModel.update(
                    { LayerID: newLayerID },
                    { where: { LayerID: layerIds } }
                );
            }

            // Delete old layers based on provided oldLayerIds
            if (layerIds && Array.isArray(layerIds)) {
                await LayerModel.destroy({
                    where: {
                        ID: layerIds
                    }
                });
            }
            return res.status(200).json({ message: messages.success.LAYER_MERGE, status: messages.success.STATUS, layerID: newLayerID });
        }
    } catch (error) {
        return next(error);
    }
}


// get layer BY ID
async function getLayerById(req, res, next) {
    // #swagger.tags = ['Layer']
    // #swagger.description = 'Get Layer by ID'
    try {
        const { id } = req.params;
        const layer = await LayerModel.findOne({
            where: { ID: id },
            attributes: { exclude: ['Created_at', 'Updated_at'] }
        });

        if (!layer) {
            return res.status(404).json({ message: messages.error.LAYER_NOT_FOUND, status: messages.error.STATUS });
        }
        return res.status(200).json({ data: layer, status: messages.success.STATUS });
    } catch (error) {
        return next(error);
    }

}

// Delete a Layer by ID
async function deleteLayer(req, res, next) {
    // #swagger.tags = ['Layer']
    // #swagger.description = 'Delete Layer by id'
    const { id } = req.params;
    try {
        const layerDeleted = await LayerModel.destroy({
            where: { ID: id }
        })
        const annotationDeleted = await AnnotationModel.destroy({
            where: { LayerID: id }
        });
        if (layerDeleted || annotationDeleted) {
            return res.status(200).json({ message: messages.success.LAYER_DELETED, status: messages.success.STATUS });
        } else {
            return res.status(404).json({ message: messages.error.LAYER_NOT_FOUND, status: messages.error.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}


// get AllDATA Admin
async function getLayerAllDataWithPagination(req, res, next) {
    // #swagger.tags = ['Layer']
    // #swagger.description = 'Get Layer with pagination'
    try {
        const { page = 1, limit, search = '', pageId, AssignDate } = req.query;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);

        // Check if pageId is provided and not empty
        if (!pageId || pageId === '') {
            return res.status(400).json({ message: messages.error.INVALID_PAGEID, status: messages.error.STATUS });
        }

        // Get the logged-in user's ID from the request
        const userId = req.user.ID;

        // Construct where clause
        const whereClause = {
            PageID: pageId,
            UserID: userId // Filter by logged-in user's ID
        };
        // "AssignDate": "2025-08-02T00:00:00.000Z",

        if (AssignDate) {
            whereClause[Op.and] = [literal(`DATE(AssignDate) = '${AssignDate}'`)];
        }

        if (search) {
            whereClause.Name = { [Op.like]: `%${search}%` };
        }

        const options = {
            attributes: { exclude: ['UserID', 'PageID', 'Created_at', 'Updated_at'] },
            where: whereClause,
            offset: offset,
            limit: limit ? parseInt(limit, 10) : null,
            order: [['Layer_order', 'ASC']], // Sort by Layer_order
        };

        const { count, rows: layers } = await LayerModel.findAndCountAll(options);
        const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);

        // Fetch annotations for the layers
        const layerIds = layers.map(layer => layer.ID);
        const annotations = await AnnotationModel.findAll({
            attributes: { exclude: ['UserID', 'LayerID', 'Created_at', 'Updated_at', "ID"] },
            where: {
                LayerID: { [Op.in]: layerIds },
                UserID: userId
            }
        });

        // Map annotations to layers
        const layersWithAnnotations = layers.map(layer => {
            const layerAnnotations = annotations.filter(annotation => annotation.LayerID === layer.ID);
            return {
                ...layer.toJSON(),
                Annotations: layerAnnotations
            };
        });

        // Add the static layer to the response list
        const staticLayer = {
            ID: 0,
            Name: "All",
            Group_Name: "",
            Layer_order: '',
            IsLocked: false,
            IsGroup: true,
            IsVisible: true,
            FillColor: "",
            StrokeColor: "",
            StrokeWidth: "",
            Font_size: "",
            Font_family: "",
            StrokeType: "",
            Collapsed: true,
            AssignDate,
            Annotations: []
        };


        // Prepend or append the static layer to the list as desired
        layersWithAnnotations.unshift(staticLayer); // Prepend to the list

        return res.status(200).json({
            data: layersWithAnnotations,
            status: messages.success.STATUS,
            totalPages,
            currentPage,
            totalRecords: count
        });
    } catch (error) {
        console.error('Error fetching layers with pagination:', error);
        return next(error);
    }
}


// async function getLayerAllDataWithPagination(req, res, next) {
//     try {
//         const { page = 1, limit, search = '', pageId } = req.query;
//         const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);

//         // Check if pageId is provided and not empty
//         if (!pageId || pageId === '') {
//             return res.status(400).json({ message: 'Invalid pageId' });
//         }

//         // Get the logged-in user's ID from the request
//         const userId = req.user.ID;

//         const whereClause = {
//             PageID: pageId,
//             UserID: userId, // Filter by logged-in user's ID
//         };

//         // Include conditions for grouped and ungrouped layers
//         const options = {
//             attributes: { exclude: ['UserID', 'PageID', 'Created_at', 'Updated_at'] },
//             where: whereClause,
//             offset: offset,
//             limit: limit ? parseInt(limit, 10) : null,
//             order: [['ID', 'DESC']],
//         };

//         // Query both grouped and ungrouped layers
//         const groupedLayers = await LayerModel.findAll({
//             ...options,
//             where: {
//                 ...whereClause,
//                 IsGroup: true, // Filter for grouped layers
//             },
//         });

//         const ungroupedLayers = await LayerModel.findAll({
//             ...options,
//             where: {
//                 ...whereClause,
//                 IsGroup: false, // Filter for ungrouped layers
//             },
//         });

//         const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
//         const currentPage = parseInt(page, 10);

//         return res.status(200).json({
//             groupedLayers,
//             ungroupedLayers,
//             status: 'success',
//             totalPages,
//             currentPage,
//             totalRecords: groupedLayers.length + ungroupedLayers.length,
//         });
//     } catch (error) {
//         return next(error);
//     }
// }





// Grouping a Layer 
async function groupLayer(req, res, next) {
    // #swagger.tags = ['Layer']
    // #swagger.description = 'Group Layers'
    const { layerIds, UserID, PageID, Group_Name } = req.body;
    try {
        if (!Array.isArray(layerIds) || !UserID || !PageID) {
            return res.status(400).json({ message: messages.error.LAYER_INPUT, status: messages.error.STATUS });
        }

        // Check if all layerIds exist for the given UserID and PageID
        const layers = await LayerModel.findAll({
            where: {
                ID: {
                    [Op.in]: layerIds
                },
                UserID: UserID,
                PageID: PageID
            }
        });

        if (layers.length !== layerIds.length) {
            return res.status(404).json({ message: messages.error.LAYER_NOT_FOUND, status: messages.error.STATUS });
        }

        // Update layers to be grouped
        await LayerModel.update(
            { IsGroup: true, Group_Name },
            {
                where: {
                    ID: {
                        [Op.in]: layerIds
                    },
                    UserID: UserID,
                    PageID: PageID
                }
            }
        );

        return res.status(200).json({ message: messages.success.LAYER_GROUPED });
    } catch (error) {
        console.error('Error grouping layers:', error);
        return next(error);
    }
}



// UnGrouping a Layer 
async function ungroupLayer(req, res, next) {
    // #swagger.tags = ['Layer']
    // #swagger.description = 'Delete Layer by id'
    const { layerIds, UserID, PageID } = req.body;
    try {
        // Validate input
        if (!Array.isArray(layerIds) || !UserID || !PageID) {
            return res.status(400).json({ message: messages.error.LAYER_INPUT, status: messages.error.STATUS });
        }

        // Check if all layerIds exist for the given UserID and PageID
        const layers = await LayerModel.findAll({
            where: {
                ID: {
                    [Op.in]: layerIds
                },
                UserID: UserID,
                PageID: PageID
            }
        });

        if (layers.length !== layerIds.length) {
            return res.status(404).json({ message: messages.error.LAYER_NOT_FOUND, status: messages.error.STATUS });
        }

        // Update layers to be ungrouped
        await LayerModel.update(
            { IsGroup: false, Group_Name: '' },
            {
                where: {
                    ID: {
                        [Op.in]: layerIds
                    },
                    UserID: UserID,
                    PageID: PageID
                }
            }
        );

        return res.status(200).json({ message: messages.success.LAYER_UNGROUPED })
    } catch (error) {
        console.error('Error ungrouping layers:', error);
        return next(error);
    }
}



async function getLayerAllDataByPageId(req, res, next) {
    // #swagger.tags = ['Layer']
    // #swagger.description = 'Get Layer data based on multiple PageIDs'
    try {
        const { page = 1, limit = 10, search = '', pageId, assignDate } = req.body;
        const offset = (page - 1) * limit;
        const userID = req.user.ID;

        // Validate required parameters
        if (!Array.isArray(pageId) || pageId.length === 0 || !assignDate) {
            return res.status(400).json({ message: "An array of PageIDs and AssignDate are required." });
        }

        // Construct where clause for filtering by multiple PageIDs and AssignDate
        const whereClause = {
            PageID: { [Op.in]: pageId }  // Filter by multiple PageIDs
            // AssignDate: {
            //     [Op.gte]: new Date(assignDate),  // Start of the assign date
            //     [Op.lt]: new Date(new Date(assignDate).setDate(new Date(assignDate).getDate() + 1)),  // End of the assign date
            // }
        };

        // Include search filter if provided
        if (search) {
            whereClause.Name = { [Op.like]: `%${search}%` };
        }

        // Fetch the layers from the database
        const layers = await LayerModel.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['Created_at', 'Updated_at'] },  // Exclude timestamps from the response
            offset: offset,
            limit: parseInt(limit, 10),
            order: [['Layer_order', 'ASC']],  // Sort layers by Layer_order
        });

        const totalPages = Math.ceil(layers.count / limit);
        const currentPage = parseInt(page, 10);

        // No need to add the "All" entry to the layers list
        const layersWithoutAll = layers.rows;

        return res.status(200).json({
            data: layersWithoutAll,
            status: messages.success.STATUS,  // Assuming you have a success status in your messages object
            totalPages,
            currentPage,
            totalRecords: layers.count  // The count without including the "All" entry
        });
    } catch (error) {
        console.error('Error fetching layers with pagination:', error);
        return next(error);
    }
}



// get annotaions date which link to layer id
async function getLayerByDate(req, res, next) {
    try {
      const { userID, layerID } = req.body;
  
      // Check if the user exists
    //   const userExists = await AnnotationModel.findOne({
    //     where: { UserID: userID },
    //   });
    //   if (!userExists) {
    //     return res.status(404).json({
    //       status: "Error",
    //       message: "User not found for the given userID",
    //     });
    //   }
  
      // Check if the layer exists
      const layerExists = await LayerModel.findOne({ where: { ID: layerID } });
      if (!layerExists) {
        return res.status(404).json({
          status: "Error",
          message: "Layer not found for the given layerID",
        });
      }
  
      const annotations = await AnnotationModel.findAndCountAll({
        where: { UserID: userID, LayerID: layerID },
        attributes: { exclude: ["Created_at", "Updated_at"] },
      });
  
      // Extract and filter unique assign dates, removing nulls
      const uniqueAssignDates = Array.from(
        new Set(annotations.rows.map((annotation) => annotation.AssignDate))
      ).filter((date) => date !== null); 
  
      res.status(200).json({
        status: "Success",
        totalAnnotations: uniqueAssignDates.length || 0,
        data: uniqueAssignDates || [],
      });
    } catch (error) {
      console.error("Error fetching layers with pagination:", error);
      return next(error);
    }
  }
  



module.exports = {
    addUpdateLayer,
    getLayerById,
    deleteLayer,
    getLayerAllDataWithPagination,
    groupLayer,
    ungroupLayer,
    addUpdateLayerAnnotation,
    mergeLayer,
    getLayerAllDataByPageId,
    getLayerByDate
};
