const commonFunctions = require('../utils/commonFunctions');
const fs = require('fs');
const path = require('path');
const AnnotationModel = require('../models/annotation');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const messages = require('../utils/messages');
const LayerModel = require('../models/layer');
const BobModel = require('../models/Bob');

// AddUpdate bob
async function addAnnotation(req, res, next) {
    try {
        let loginUser = req.user;
        let { UserID, LayerID, properties, Type, Title, Comment, Coordinates, StrokeColor, StrokeWidth, AxisX, AxisY, Width, Height, Rotation, Opacity, Scale_width, Scale_height, Origin_X, Origin_Y, Font_weight, Font_height, Font_family, IsLocked, IsVisible, ParentAnnotationID } = req.body;

        // Check if the parent annotation exists only if ParentAnnotationID is provided
        if (ParentAnnotationID) {
            const parentAnnotation = await AnnotationModel.findByPk(ParentAnnotationID);
            if (!parentAnnotation) {
                return res.status(404).json({ message: messages.error.PARENT_ANNOTATION_NOT_FOUND, status: "error" });
            }
        }

        // Create the annotation
        const annotation = await AnnotationModel.create({
            UserID,
            LayerID,
            Type,
            Title,
            Comment,
            Coordinates,
            StrokeColor,
            StrokeWidth,
            AxisX,
            AxisY,
            Width,
            Height,
            Rotation,
            Opacity,
            Scale_width,
            Scale_height,
            Origin_X,
            Origin_Y,
            Font_weight,
            Font_height,
            Font_family,
            IsLocked,
            IsVisible,
            properties,
            ParentAnnotationID: ParentAnnotationID || null // Set ParentAnnotationID to null if not provided
        });
        const newAnnotationID = annotation.ID;
        // If a parent annotation ID is provided, return only the child annotation
        if (ParentAnnotationID) {
            return res.status(200).json({ message: messages.success.CHILD_ANNOTATION, status: messages.success.STATUS, annotationID: newAnnotationID });
            // data: annotation 
        }

        // Otherwise, return both parent and child annotations
        const annotations = await AnnotationModel.findAll({ where: { ParentAnnotationID: null } }); // Fetch only parent annotations
        const parentAnnotations = await Promise.all(annotations.map(async (parent) => {
            const children = await AnnotationModel.findAll({ where: { ParentAnnotationID: parent.ID } }); // Fetch child annotations for each parent
            return { ...parent.toJSON(), children };
        }));

        return res.status(200).json({ message: messages.success.PARENT_ANNOTATION, status: messages.success.STATUS, annotationID: newAnnotationID });
    } catch (error) {
        return next(error);
    }
}

async function updateAnnotation(req, res, next) {
    try {
        const { id } = req.body;
        const { LayerID, Type, Title, Comment, Coordinates, StrokeColor, StrokeWidth, AxisX, AxisY, Width, Height, Rotation, Opacity, Scale_width, Scale_height, Origin_X, Origin_Y, Font_weight, Font_height, Font_size, Font_family, Font_color, IsLocked, IsVisible, properties } = req.body;

        // Validate that id is an array
        if (!Array.isArray(id)) {
            return res.status(400).json({ message: 'ID should be an array', status: 'error' });
        }

        // Iterate through the array of IDs and update each annotation
        for (let annotationId of id) {
            // Find the annotation by its ID
            const annotation = await AnnotationModel.findOne({ where: { front_no_id: annotationId } });
            if (!annotation) {
                return res.status(404).json({ message: `Annotation with ID ${annotationId} not found`, status: 'error' });
            }

            // Update the annotation fields
            annotation.LayerID = LayerID !== undefined ? LayerID : annotation.LayerID;
            annotation.Type = Type !== undefined ? Type : annotation.Type;
            annotation.Title = Title !== undefined ? Title : annotation.Title;
            annotation.Comment = Comment !== undefined ? Comment : annotation.Comment;
            annotation.Coordinates = Coordinates !== undefined ? Coordinates : annotation.Coordinates;
            annotation.StrokeColor = StrokeColor !== undefined ? StrokeColor : annotation.StrokeColor;
            annotation.StrokeWidth = StrokeWidth !== undefined ? StrokeWidth : annotation.StrokeWidth;
            annotation.AxisX = AxisX !== undefined ? AxisX : annotation.AxisX;
            annotation.AxisY = AxisY !== undefined ? AxisY : annotation.AxisY;
            annotation.Width = Width !== undefined ? Width : annotation.Width;
            annotation.Height = Height !== undefined ? Height : annotation.Height;
            annotation.Rotation = Rotation !== undefined ? Rotation : annotation.Rotation;
            annotation.Opacity = Opacity !== undefined ? Opacity : annotation.Opacity;
            annotation.Scale_width = Scale_width !== undefined ? Scale_width : annotation.Scale_width;
            annotation.Scale_height = Scale_height !== undefined ? Scale_height : annotation.Scale_height;
            annotation.Origin_X = Origin_X !== undefined ? Origin_X : annotation.Origin_X;
            annotation.Origin_Y = Origin_Y !== undefined ? Origin_Y : annotation.Origin_Y;
            annotation.Font_weight = Font_weight !== undefined ? Font_weight : annotation.Font_weight;
            annotation.Font_height = Font_height !== undefined ? Font_height : annotation.Font_height;
            annotation.Font_size = Font_size !== undefined ? Font_size : annotation.Font_size;
            annotation.Font_family = Font_family !== undefined ? Font_family : annotation.Font_family;
            annotation.Font_color = Font_color !== undefined ? Font_color : annotation.Font_color;
            annotation.IsLocked = IsLocked !== undefined ? IsLocked : annotation.IsLocked;
            annotation.IsVisible = IsVisible !== undefined ? IsVisible : annotation.IsVisible;
            annotation.properties = properties !== undefined ? properties : annotation.properties;

            // Save the updated annotation
            await annotation.save();
        }

        return res.status(200).json({ message: messages.success.ANNOTATION_UPDATE, status: messages.success.STATUS });
    } catch (error) {
        console.error('Error updating annotation:', error);
        return next(error);
    }
}


// data: parentAnnotations,





// get Annotation BY ID
async function getAnnotationById(req, res, next) {
    // #swagger.tags = ['Annotation']
    // #swagger.description = 'Get Annotation by ID'
    try {
        const { id } = req.params;
        const bob = await AnnotationModel.findOne({
            where: { ID: id },
            attributes: { exclude: ['Created_at', 'Updated_at'] }
        });

        if (!bob) {
            return res.status(404).json({ message: messages.error.BOB_NOT_FOUND, status: messages.error.STATUS });
        }
        return res.status(200).json({ data: bob, status: messages.success.STATUS });
    } catch (error) {
        return next(error);
    }

}


// Delete a Annotation by ID
async function deleteAnnotation(req, res, next) {
    // #swagger.tags = ['Annotation']
    // #swagger.description = 'Delete Annotation by id'
    try {
        const annotation = await AnnotationModel.findOne({ where: { front_no_id: req.params.id } });
        if (annotation) {
            const annotationId = annotation.front_no_id;
            await annotation.update({ Is_deleted: true });

            // Also delete annotations with ParentAnnotationID matching the deleted annotation's front_no_id
            await AnnotationModel.update(
                { Is_deleted: true },
                { where: { ParentAnnotationID: annotationId } }
            );

            return res.status(200).json({ message: messages.success.ANNOTATION_DELETED, status: messages.success.STATUS });
        } else {
            return res.status(404).json({ message: messages.error.ANNOTATION_NOT_FOUND, status: messages.error.STATUS });
        }
    } catch (error) {
        console.error('Error deleting annotation:', error);
        return next(error);
    }
}



// get AllDATA 
async function getAnnotationAllDataWithPagination(req, res, next) {
    // #swagger.tags = ['Bob']
    // #swagger.description = 'Get Bob with pagination'
    try {
        const { page = 1, limit, search = '' } = req.query;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
        const whereClause = {};
        if (search) {
            whereClause.Type = { [Op.like]: `%${search}%` };
        }

        const options = {
            attributes: { exclude: ['Created_at', 'Updated_at'] },
            where: whereClause,
            offset: offset,
            limit: limit ? parseInt(limit, 10) : null,
            order: [['ID', 'DESC']],
        };
        const { count, rows: bob } = await AnnotationModel.findAndCountAll(options);
        const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);
        return res.status(200).json({ data: bob, status: messages.success.STATUS, totalPages, currentPage, totalRecords: count });
    } catch (error) {
        return next(error);
    }
}


async function pasteAnnotation(req, res, next) {
    try {
        const { annotations, parentAnnotationIds } = req.body;

        // Check if annotations array exists
        if (!annotations || !Array.isArray(annotations)) {
            return res.status(400).json({ error: 'Invalid annotations data' });
        }

        // Fetch existing annotations from the database that match any of the parentAnnotationIds
        const existingAnnotations = await AnnotationModel.findAll({
            where: {
                front_no_id: parentAnnotationIds
            }
        });
        const existingFrontNoIds = new Set(existingAnnotations.map(annotation => annotation.front_no_id));
        // Update isPasteSpecialParent for these existing records
        await AnnotationModel.update(
            { isPasteSpecialParent: true },
            { where: { front_no_id: Array.from(existingFrontNoIds) } }
        );

        // Iterate over each annotation and save it to the database
        const savedAnnotations = await Promise.all(
            annotations.map(async (annotation) => {
                let { LayerID, PageID } = annotation;

                if (!LayerID) {
                    // If LayerID is not provided, create a new layer
                    const userID = annotation.UserID;
                    const AssignDate = req.body.AssignDate || new Date(); // Use AssignDate from req body or current date
                    const firstName = req.body.firstName || 'Default'; // Assuming firstName and lastName come in the request body
                    const lastName = req.body.lastName || 'User';

                    // Ensure PageID is correctly extracted
                    PageID = PageID || req.body.PageID;

                    if (!PageID) {
                        return res.status(400).json({ error: 'PageID is required to create a new layer' });
                    }

                    const newLayer = await LayerModel.create({
                        UserID: userID,
                        PageID: PageID, // Correctly passing the PageID
                        Name: `${firstName} ${lastName}`, // Combine first name and last name
                        Layer_order: 1, // Default value
                        IsLocked: false,
                        IsVisible: true,
                        FillColor: `#ffffff`,
                        StrokeColor: `#000000`,
                        StrokeWidth: 2,
                        Font_size: 20,
                        Font_family: `Arial`,
                        StrokeType: 2,
                        IsGroup: false,
                        collapsed: true,
                        Group_Name: '',
                        AssignDate: AssignDate
                    });

                    // Use the ID of the newly created layer
                    LayerID = newLayer.ID;
                }
                // Now save the annotation with the provided or new LayerID
                const savedAnnotation = await AnnotationModel.create({
                    ...annotation,
                    LayerID, // Use the existing or newly created LayerID
                    front_no_id: annotation.ID, // Save the payload ID as front_no_id
                    properties: annotation.properties || {}, // Save properties as JSON
                    ID: undefined // Exclude the ID to use auto-increment
                });

                return savedAnnotation;
            })
        );

        // Send the saved annotations as a response
        return res.status(201).json({ message: messages.success.ANNOTATION_PASTE, status: messages.success.STATUS, data: savedAnnotations });
    } catch (error) {
        console.error('Error saving annotations:', error);
        return next(error);
    }
}

// async function selectPasteAnnotation(req, res, next) {
//     try {
//         const { annotations, AssignDate } = req.body;

//         const assignDates = new Set(AssignDate);

//         const pasteSpecialParentAnnotations = annotations.filter(annotation => annotation.isPasteSpecialParent);
//         const nonPasteSpecialParentAnnotations = annotations.filter(annotation => !annotation.isPasteSpecialParent);

//         if (pasteSpecialParentAnnotations.length > 0) {
//             const parentSelectSpecialIds = pasteSpecialParentAnnotations.map(annotation => annotation.ID);

//             const existingRecordsForPasteSpecial = await AnnotationModel.findAll({
//                 where: {
//                     parentSelectSpecialId: {
//                         [Op.in]: parentSelectSpecialIds
//                     }
//                 }
//             });


//             const annotationMap = new Map(pasteSpecialParentAnnotations.map(annotation => [annotation.ID, annotation]));

//             for (const record of existingRecordsForPasteSpecial) {
//                 const newData = annotationMap.get(record.parentSelectSpecialId);
//                 if (newData && newData.properties) {
//                     // Only keep the 'properties' field for updating
//                     const updateData = { properties: newData.properties };

//                     await AnnotationModel.update(updateData, {
//                         where: {
//                             ID: record.ID
//                         }
//                     });
//                 }
//             }
//         }


//         if (nonPasteSpecialParentAnnotations.length > 0) {
//             const parentSelectSpecialIds = nonPasteSpecialParentAnnotations.map(annotation => annotation.parentSelectSpecialId);

//             const existingRecordsForNonPasteSpecial = await AnnotationModel.findAll({
//                 where: {
//                     parentSelectSpecialId: {
//                         [Op.in]: parentSelectSpecialIds
//                     }
//                 }
//             });

//             const nonPasteAnnotationMap = new Map(nonPasteSpecialParentAnnotations.map(annotation => [annotation.parentSelectSpecialId, annotation]));

//             for (const record of existingRecordsForNonPasteSpecial) {
//                 const newData = nonPasteAnnotationMap.get(record.parentSelectSpecialId);
//                 if (newData && newData.properties) {
//                     // Only keep the 'properties' field for updating
//                     const updateData = { properties: newData.properties };

//                     await AnnotationModel.update(updateData, {
//                         where: {
//                             ID: record.ID
//                         }
//                     });
//                 }
//             }
//         }

//         res.status(200).json({ message: 'Annotations updated successfully' });
//     } catch (error) {
//         console.error('Error saving annotations:', error);
//         return next(error);
//     }
// }


async function selectPasteAnnotation(req, res, next) {
    try {
        const { annotationId, AssignDate, properties } = req.body;
        const annotation = await AnnotationModel.findOne({
            where: {
                front_no_id: annotationId
            }
        });

        if (!annotation || !properties) {
            return res.status(400).json({ message: 'Invalid request data' });
        }

        let annotationsToUpdate = [];

        // Case when the annotation is a parent
        if (annotation.isPasteSpecialParent) {
            // Find all annotations matching the parent ID and assign date
            annotationsToUpdate = await AnnotationModel.findAll({
                where: {
                    parentSelectSpecialId: annotation.front_no_id, // Changed to lowercase "id"
                    AssignDate: {
                        [Op.in]: AssignDate.map(date => new Date(date))
                    }
                }
            });

        }
        else { // Case when the annotation is a child
            // Find all annotations matching the parent ID and assign date
            const childAnnotations = await AnnotationModel.findAll({
                where: {
                    parentSelectSpecialId: annotation.parentSelectSpecialId,
                    AssignDate: {
                        [Op.in]: AssignDate.map(date => new Date(date))
                    }
                }
            });

            // Also find the annotation where front_no_id matches parentSelectSpecialId
            const matchingFrontNoAnnotations = await AnnotationModel.findAll({
                where: {
                    front_no_id: annotation.parentSelectSpecialId,
                    AssignDate: {
                        [Op.in]: AssignDate
                    }
                }
            });

            annotationsToUpdate = [...childAnnotations, ...matchingFrontNoAnnotations];
        }
        // Update properties where keys match
        for (const record of annotationsToUpdate) {
            const updatedProperties = { ...record.properties };
            // Check if 'comment' object is in the properties
            if (properties.comment) {
                // Update the 'comment' object with specific fields from the record
                const { LayerID, AssignDate, parentSelectSpecialId } = record;
                const { PageID } = record.properties
                updatedProperties.comment = {
                    ...updatedProperties.comment, // Keep existing values in DB
                    ...properties.comment,
                    LayerID,
                    PageID,
                    AssignDate,
                    parentSelectSpecialId
                };
                // Merge other properties outside 'icon'
                for (const key in properties) {
                    if (key !== "comment") { // Skip 'icon' as it's handled above
                        if (typeof properties[key] === "object" && properties[key] !== null) {
                            // Deep merge objects to retain nested values
                            updatedProperties[key] = {
                                ...updatedProperties[key],
                                ...properties[key]
                            };
                        } else {
                            // For non-object properties, directly replace the value
                            updatedProperties[key] = properties[key];
                        }
                    }
                }
            } else if (properties.icon) {
                // Update the 'comment' object with specific fields from the record
                const { LayerID, AssignDate, parentSelectSpecialId } = record;
                const { PageID } = record.properties
                updatedProperties.icon = {
                    ...updatedProperties.icon, // Keep existing values in DB
                    ...properties.icon,
                    LayerID,
                    PageID,
                    AssignDate,
                    parentSelectSpecialId
                };
                // Merge other properties outside 'icon'
                for (const key in properties) {
                    if (key !== "icon") { // Skip 'icon' as it's handled above
                        if (typeof properties[key] === "object" && properties[key] !== null) {
                            // Deep merge objects to retain nested values
                            updatedProperties[key] = {
                                ...updatedProperties[key],
                                ...properties[key]
                            };
                        } else {
                            // For non-object properties, directly replace the value
                            updatedProperties[key] = properties[key];
                        }
                    }
                }
            }
            else if (properties.title) {
                // Update the 'comment' object with specific fields from the record
                const { LayerID, AssignDate, parentSelectSpecialId } = record;
                const { PageID } = record.properties

                if (updatedProperties.title) {

                    updatedProperties.title = {
                        ...updatedProperties.title, // Keep existing values in DB
                        ...properties.title,
                        LayerID,
                        PageID,
                        AssignDate,
                        parentSelectSpecialId
                    };
                }
                else {
                    const bobRecord = await BobModel.findOne({
                        where: { bob_no_id: annotation.bob_no_id },
                        attributes: ['properties'],
                    });

                    if (bobRecord && bobRecord.properties) {
                        const titleObject = bobRecord.properties;
                        // Update only specific keys from the payload
                        for (const key in properties.title) {
                            if (properties.title.hasOwnProperty(key)) {
                                titleObject[key] = properties.title[key]; // Update specific keys in titleObject
                            }
                        }
                        // Add other required fields
                        titleObject.LayerID = LayerID;
                        titleObject.PageID = PageID;
                        titleObject.AssignDate = AssignDate;
                        titleObject.parentSelectSpecialId = parentSelectSpecialId;
                        console.log("Updated bobRecord title:", titleObject);
                        updatedProperties.title = titleObject;                               

            }

        }

        // Merge other properties outside 'title'
        for (const key in properties) {
            if (key !== "title") { // Skip 'title' as it's handled above
                if (typeof properties[key] === "object" && properties[key] !== null) {
                    // Deep merge objects to retain nested values
                    updatedProperties[key] = {
                        ...updatedProperties[key],
                        ...properties[key]
                    };
                } else {
                    // For non-object properties, directly replace the value
                    updatedProperties[key] = properties[key];
                }
            }
        }

    }

            else {
        // Update properties normally (matching keys)
        for (const key in properties) {
            if (updatedProperties.hasOwnProperty(key)) {
                updatedProperties[key] = properties[key];
            }
        }
    }
    //  // Update properties normally (matching keys)
    //  for (const key in properties) {
    //     if (updatedProperties.hasOwnProperty(key)) {
    //         updatedProperties[key] = properties[key];
    //     }
    // }

    // Save the updated properties to the database
    await AnnotationModel.update(
        { properties: updatedProperties },
        { where: { front_no_id: record.front_no_id } }
    );
}

res.status(200).json({ message: 'Annotations updated successfully' });
    } catch (error) {
    console.error('Error updating annotations:', error);
    return next(error);
}
}




// async function getSelectPasteAnnotation(req, res, next) {
//     try {
//         const { front_no_ids } = req.body; // Make sure front_no_ids is extracted correctly

//         // Check if front_no_ids is an array
//         if (!Array.isArray(front_no_ids) || front_no_ids.length === 0) {
//             return res.status(400).json({ message: "Invalid front_no_ids array." });
//         }

//         // Fetch annotations where parentSelectSpecialId matches front_no_ids and is not null
//         const annotations = await AnnotationModel.findAll({
//             where: {
//                 parentSelectSpecialId: {
//                     [Op.in]: front_no_ids, // Match against front_no_ids
//                     [Op.ne]: null // Ensure parentSelectSpecialId is not null
//                 }
//             },
//             attributes: ['parentSelectSpecialId', 'AssignDate'] // Specify fields to fetch
//         });

//         // Filter out duplicate AssignDate entries and only keep valid front_no_ids
//         const uniqueDates = {};
//         annotations.forEach(annotation => {
//             const id = annotation.parentSelectSpecialId;
//             if (id && front_no_ids.includes(id)) { // Ensure id is in front_no_ids
//                 if (!uniqueDates[id]) {
//                     uniqueDates[id] = new Set();
//                 }
//                 if (annotation.AssignDate) {
//                     uniqueDates[id].add(annotation.AssignDate);
//                 }
//             }
//         });

//         // Prepare response format, ensuring AssignDates is always an array
//         const result = Object.entries(uniqueDates).map(([parentSelectSpecialId, dates]) => ({
//             front_no_id: parentSelectSpecialId,
//             AssignDates: [...dates] // Convert Set to array
//         }));

//         return res.status(200).json(result);
//     } catch (error) {
//         return next(error);
//     }
// }


// async function getSelectPasteAnnotation(req, res, next) {
//     try {
//         const { front_no_ids } = req.body; // Get front_no_ids from the request body

//         // Check if front_no_ids is an array and not empty
//         if (!Array.isArray(front_no_ids) || front_no_ids.length === 0) {
//             return res.status(400).json({ message: "Invalid front_no_ids array." });
//         }

//         // Fetch annotations for the provided front_no_ids
//         const annotations = await AnnotationModel.findAll({
//             where: {
//                 parentSelectSpecialId: {
//                                         [Op.in]: front_no_ids, // Match against front_no_ids
//                                     //   [Op.ne]: null // Ensure parentSelectSpecialId is not null
//                               }
//             },
//             attributes: ['front_no_id', 'isPasteSpecialParent', 'parentSelectSpecialId', 'ID', 'AssignDate']
//         });

//         if (annotations.length === 0) {
//             return res.status(404).json({ message: "No annotations found for the given front_no_ids." });
//         }

//         let allAssignDates = new Set();

//         for (const annotation of annotations) {
//             if (annotation.isPasteSpecialParent) {
//                 // Case 1: If the annotation is a parent (isPasteSpecialParent is true)
//                 const parentAnnotations = await AnnotationModel.findAll({
//                     where: {
//                         parentSelectSpecialId: annotation.front_no_id
//                     },
//                     attributes: ['AssignDate']
//                 });

//                 // Add parent's AssignDate
//                 if (annotation.AssignDate) {
//                     allAssignDates.add(annotation.AssignDate);
//                 }

//                 // Add all children's AssignDates
//                 parentAnnotations.forEach((child) => {
//                     if (child.AssignDate) {
//                         allAssignDates.add(child.AssignDate);
//                     }
//                 });
//             } else {
//                 // Case 2: If the annotation is a child (isPasteSpecialParent is false)
//                 // Find the parent annotation
//                 const parentAnnotation = await AnnotationModel.findOne({
//                     where: { ID: annotation.parentSelectSpecialId },
//                     attributes: ['AssignDate']
//                 });

//                 // Add parent's AssignDate if found
//                 if (parentAnnotation?.AssignDate) {
//                     allAssignDates.add(parentAnnotation.AssignDate);
//                 }

//                 // Add child's AssignDate
//                 if (annotation.AssignDate) {
//                     allAssignDates.add(annotation.AssignDate);
//                 }
//             }
//         }

//         // Convert the Set to an array and return unique AssignDates
//         const result = [...allAssignDates];
//         return res.status(200).json({ AssignDates: result });
//     } catch (error) {
//         return next(error);
//     }
// }

// async function getSelectPasteAnnotation(req, res, next) {
//     try {
//         const { front_no_ids } = req.body; // Get front_no_ids from the request body
//         // Check if front_no_ids is an array and not empty
//         if (!Array.isArray(front_no_ids) || front_no_ids.length === 0) {
//             return res.status(400).json({ message: "Invalid front_no_ids array." });
//         }

//         // Fetch annotations where front_no_id matches the provided front_no_ids
//         const annotations = await AnnotationModel.findAll({
//             where: {
//                 front_no_id: {
//                     [Op.in]: front_no_ids, // Match against front_no_ids
//                 },
//             },
//             attributes: ['front_no_id', 'isPasteSpecialParent', 'parentSelectSpecialId', 'ID', 'AssignDate']
//         });

//         if (annotations.length === 0) {
//             return res.status(404).json({ message: "No annotations found for the given front_no_ids." });
//         }

//         let allAssignDates = new Set();

//         for (const annotation of annotations) {
//             if (annotation.isPasteSpecialParent) {
//                 // Case 1: If the annotation is a parent
//                 const childAnnotations = await AnnotationModel.findAll({
//                     where: {
//                         parentSelectSpecialId: annotation.front_no_id // Match with parentSelectSpecialId
//                     },
//                     attributes: ['AssignDate']
//                 });

//                 // Add parent's AssignDate
//                 if (annotation.AssignDate) {
//                     allAssignDates.add(annotation.AssignDate);
//                 }

//                 // Add all children's AssignDates
//                 childAnnotations.forEach((child) => {
//                     if (child.AssignDate) {
//                         allAssignDates.add(child.AssignDate);
//                     }
//                 });
//             } else {
//                 // Case 2: If the annotation is a child
//                 // Find all annotations with the same parentSelectSpecialId
//                 const siblingAnnotations = await AnnotationModel.findAll({
//                     where: {
//                         parentSelectSpecialId: annotation.parentSelectSpecialId
//                     },
//                     attributes: ['AssignDate']
//                 });

//                 // Add the current annotation's AssignDate
//                 if (annotation.AssignDate) {
//                     allAssignDates.add(annotation.AssignDate);
//                 }

//                 // Add all sibling annotations' AssignDates
//                 siblingAnnotations.forEach((sibling) => {
//                     if (sibling.AssignDate) {
//                         allAssignDates.add(sibling.AssignDate);
//                     }
//                 });
//             }
//         }

//         // Convert the Set to an array and return unique AssignDates
//         const result = [...allAssignDates];
//         return res.status(200).json({ AssignDates: result });
//     } catch (error) {
//         return next(error);
//     }
// }


async function getSelectPasteAnnotation(req, res, next) {
    try {
        const { front_no_id } = req.body; // Get front_no_id as a string from the request body

        // Validate the input to ensure front_no_id is a valid string
        if (!front_no_id) {
            return res.status(400).json({ message: "Invalid front_no_id provided." });
        }

        // Fetch the annotation where front_no_id matches the provided front_no_id
        const annotation = await AnnotationModel.findOne({
            where: { front_no_id }, // Match the single front_no_id
            attributes: ['front_no_id', 'isPasteSpecialParent', 'parentSelectSpecialId', 'ID', 'AssignDate']
        });

        // If no annotation is found, return a 404 error
        if (!annotation) {
            return res.status(404).json({ message: "No annotation found for the given front_no_id." });
        }

        let allAssignDates = new Set(); // To store unique assign dates

        if (annotation.isPasteSpecialParent) {
            // Case 1: Annotation is a parent
            const childAnnotations = await AnnotationModel.findAll({
                where: {
                    parentSelectSpecialId: annotation.front_no_id // Match child annotations by parentSelectSpecialId
                },
                attributes: ['AssignDate']
            });

            // Add parent's AssignDate
            if (annotation.AssignDate) {
                allAssignDates.add(annotation.AssignDate);
            }

            // Add all children's AssignDates
            childAnnotations.forEach((child) => {
                if (child.AssignDate) {
                    allAssignDates.add(child.AssignDate);
                }
            });
        } else {
            // Case 2: Annotation is a child
            const siblingAnnotations = await AnnotationModel.findAll({
                where: {
                    parentSelectSpecialId: annotation.parentSelectSpecialId // Match sibling annotations by parentSelectSpecialId
                },
                attributes: ['AssignDate']
            });

            const parentAnnotations = await AnnotationModel.findOne({
                where: {
                    front_no_id: annotation.parentSelectSpecialId // Match sibling annotations by parentSelectSpecialId
                },
                attributes: ['AssignDate']
            });

            // Add parent annotation's AssignDate
            if (parentAnnotations.AssignDate) {
                allAssignDates.add(parentAnnotations.AssignDate);
            }

            // Add all sibling annotations' AssignDates
            siblingAnnotations.forEach((sibling) => {
                if (sibling.AssignDate) {
                    allAssignDates.add(sibling.AssignDate);
                }
            });
        }

        // Convert the Set to an array and return unique AssignDates
        const result = [...allAssignDates];
        return res.status(200).json({ AssignDates: result });
    } catch (error) {
        return next(error);
    }
}




async function pasteCommentAnnotation(req, res, next) {
    try {
        const { annotationId, properties } = req.body;

        const annotation = await AnnotationModel.findOne({
            where: {
                front_no_id: annotationId
            }
        });
        if (!annotation || !properties) {
            return res.status(400).json({ message: 'Invalid request data' });
        }

        let annotationsToUpdate = [];

        // Case when the annotation is a parent
        if (annotation.isPasteSpecialParent) {
            // Find all annotations matching the parent ID and assign date
            annotationsToUpdate = await AnnotationModel.findAll({
                where: {
                    parentSelectSpecialId: annotation.front_no_id, // Changed to lowercase "id"

                }
            });


        } else { // Case when the annotation is a child
            // Find all annotations matching the parent ID and assign date
            const childAnnotations = await AnnotationModel.findAll({
                where: {
                    parentSelectSpecialId: annotation.parentSelectSpecialId
                }
            });
            // console.log("child",childAnnotations)


            // Also find the annotation where front_no_id matches parentSelectSpecialId
            const matchingFrontNoAnnotations = await AnnotationModel.findAll({
                where: {
                    front_no_id: annotation.parentSelectSpecialId
                }
            });

            annotationsToUpdate = [...childAnnotations, ...matchingFrontNoAnnotations];
        }

        // Update properties where keys match
        for (const record of annotationsToUpdate) {
            const updatedProperties = { ...record.properties };
            for (const key in properties) {
                if (updatedProperties.hasOwnProperty(key)) {
                    updatedProperties[key] = properties[key]; // Update matching keys
                }
            }

            await AnnotationModel.update({ properties: updatedProperties }, {
                where: { front_no_id: record.front_no_id } // Changed to lowercase "id"
            });
        }

        res.status(200).json({ message: 'Annotations updated successfully' });
    } catch (error) {
        console.error('Error updating annotations:', error);
        return next(error);
    }
}












module.exports = {
    addAnnotation,
    getAnnotationById,
    deleteAnnotation,
    getAnnotationAllDataWithPagination,
    updateAnnotation,
    pasteAnnotation,
    selectPasteAnnotation,
    getSelectPasteAnnotation,
    pasteCommentAnnotation
};
