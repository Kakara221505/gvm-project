const commonFunctions = require('../utils/commonFunctions');
const fs = require('fs');
const path = require('path');
const ProjectModel = require('../models/Project');
const AnnotationModel = require('../models/annotation')
const PageModel = require('../models/page');
const UserModel = require('../models/user');
const OrganizationUserRelationModel = require('../models/OrganizationUserRelation');
const OrganizationModel = require('../models/organization')
const LayerModel = require('../models/layer');
const ShareModel = require('../models/Share');
const BackgroundItemModel = require('../models/BackGroundItems');
const CalenderModel = require('../models/calender');
const BobModel = require('../models/Bob');
const bcrypt = require('bcrypt');
const { Op, Sequelize } = require('sequelize');
const messages = require('../utils/messages');



// AddUpdate project
async function addProject(req, res, next) {
    let {
        Name,
        Description,
        BackGroundColor
    } = req.body;

    try {
        const user = req.user;
        const userID = user.ID;

        // Retrieve user's first name and last name from the User table
        const userInfo = await UserModel.findByPk(userID);
        const firstName = userInfo.First_name;
        const lastName = userInfo.Last_name;
        const Type = 'SOLID';
        // Validate Type
        if (!['SOLID', 'IMAGES', 'PDF'].includes(Type)) {
            return res.status(400).json({ message: messages.error.INVALID_TYPE, status: messages.error.STATUS });
        }

        // Check if the Project name already exists
        const existingProject = await ProjectModel.findOne({
            where: {
                UserID: userID,
                Name
            }
        });

        if (existingProject) {
            return res.status(400).json({ message: messages.error.PROJECT_NAME_EXISTS, status: messages.error.STATUS });
        }

        // Create a new project entry
        const newProject = await ProjectModel.create({
            UserID: userID,
            Name,
            Description,
        });
        const newProjectID = newProject.ID;
        const backgroundType = commonFunctions.Type[Type];
        // Create BackgroundItems entry
        // Create BackgroundItems entry
        const newBackgroundItem = await BackgroundItemModel.create({
            UserID: userID,
            ProjectID: newProject.ID,
            PageID: 0, // Will update this after creating the Page
            Type: backgroundType,
            BackGroundColor: BackGroundColor || '',
            Is_default: true
        });

        // Create Page
        const newPage = await PageModel.create({
            UserID: userID,
            ProjectID: newProject.ID,
            Name: '', // Empty for now, can be filled later
            Page_order: 1, // Default value
            BackGroundItemsID: newBackgroundItem.ID // Set BackgroundItemsID for the page
        });
        // Update PageID in BackgroundItems
        await newBackgroundItem.update({ PageID: newPage.ID });

        // Create Layer with user's first name and last name
        const newLayer = await LayerModel.create({
            UserID: userID,
            PageID: newPage.ID,
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
            AssignDate: new Date(),
        });

        //  // Create Annotation 
        //  const newAnnotation = await AnnotationModel.create({
        //     UserID: userID,
        //     LayerID: newLayer.ID
        // });

        // Create Calendar entry
        await CalenderModel.create({
            UserID: userID,
            PageID: newPage.ID,
            BgID: newBackgroundItem.ID,
            Date: new Date(),
            Notes: '' // Empty for now
        });

        return res.status(200).json({ message: messages.success.PROJECT_CREATED, status: messages.success.STATUS, projectID: newProjectID });
    } catch (error) {
        return next(error);
    }
}



// async function getProjectDataByDate(req, res, next) {
//     const { projectID, calendarDate } = req.body;

//     try {
//         const io = req.app.get('io'); // Get the Socket.IO instance

//         let loginUser = req.user;
//         // Find project by ID
//         const project = await ProjectModel.findByPk(projectID, {
//             attributes: { exclude: ['Created_at', 'Updated_at'] },
//         });
//         if (!project) {
//             return res.status(404).json({ message: messages.error.PROJECT_NOT_FOUND, status: messages.error.STATUS });
//         }

//         // Find pages associated with the project
//         const pages = await PageModel.findAll({
//             where: { ProjectID: projectID },
//             attributes: { exclude: ['Created_at', 'Updated_at'] },
//         });

//         // Initialize an array to store mapped data
//         const mappedPages = [];

//         // Loop through each page
//         for (const page of pages) {
//             // Find background item for the page
//             const backgroundItem = await BackgroundItemModel.findOne({
//                 where: { PageID: page.ID, ProjectID: page.ProjectID },
//                 attributes: { exclude: ['Created_at', 'Updated_at'] },
//             });

//             // Find calendar entry for the page and given date
//             const calendarEntry = await CalenderModel.findOne({
//                 where: {
//                     PageID: page.ID,
//                     Date: {
//                         [Op.gte]: new Date(calendarDate),  // Greater than or equal to the start of the day
//                         [Op.lt]: new Date(new Date(calendarDate).setDate(new Date(calendarDate).getDate() + 1)), // Less than the start of the next day
//                     },
//                 },
//                 attributes: { exclude: ['Created_at', 'Updated_at'] },
//             });

//             // Retrieve all layers related to the current page
//             const layers = await LayerModel.findAll({
//                 where: {
//                     PageID: page.ID,
//                 },
//                 attributes: { exclude: ['Created_at', 'Updated_at'] },
//             });

//             // Find annotations associated with the layers, filtered by calendar date
//             for (const layer of layers) {
//                 const annotations = await AnnotationModel.findAll({
//                     where: {
//                         LayerID: layer.ID,
//                         AssignDate: {
//                             [Op.gte]: new Date(calendarDate),  // Greater than or equal to the start of the day
//                             [Op.lt]: new Date(new Date(calendarDate).setDate(new Date(calendarDate).getDate() + 1)), // Less than the start of the next day
//                         },
//                     },
//                     attributes: { exclude: ['Created_at', 'Updated_at', 'ID'] },
//                 });
//                 for (const annotation of annotations) {
//                     // Fetch `CategoryID` and `SubCategoryID` from Bob table
//                     const bobRecord = await BobModel.findOne({
//                         where: { ID: annotation.bob_no_id },
//                         attributes: ['CategoryID', 'SubCategoryID'],
//                     });

//                     // Attach the fetched data to the annotation
//                     if (bobRecord) {
//                         annotation.dataValues.CategoryID = bobRecord.CategoryID;
//                         annotation.dataValues.SubCategoryID = bobRecord.SubCategoryID;
//                     }
//                 }

//                 // Map `ID` to `front_no_id` and remove the original `ID` property
//                 const annotationsWithFrontNoID = annotations.map(annotation => {
//                     const annotationData = annotation.toJSON();
//                     annotationData.ID = annotationData.front_no_id;
//                     delete annotationData.front_no_id;
//                     annotationData.PageID = page.ID;
//                     return annotationData;
//                 });

//                 // Attach annotations to the respective layer
//                 layer.dataValues.annotations = annotationsWithFrontNoID;
//             }

//             // Sort layers by `Layer_order`
//             layers.sort((a, b) => a.Layer_order - b.Layer_order);

//             // Construct mapped page object with existing calendar entry and layers
//             const mappedPage = {
//                 ID: page.ID,
//                 name: page.Name,
//                 background: backgroundItem,
//                 calendar: calendarEntry ? {
//                     ID: calendarEntry.ID,
//                     UserID: calendarEntry.UserID,
//                     PageID: calendarEntry.PageID,
//                     Date: calendarEntry.Date,
//                     Notes: calendarEntry.Notes,
//                     BgID: calendarEntry.BgID,
//                     layers: layers,
//                 } : {
//                     layers: layers,
//                 },
//             };

//             // Push mapped page to the array
//             mappedPages.push(mappedPage);
//         }

//         // Construct the response object
//         const responseData = {
//             project: project,
//             pages: mappedPages,
//         };
//         io.emit('projectDataUpdated', responseData);

//         res.json(responseData);
//     } catch (error) {
//         console.error('Error:', error);
//         next(error);
//     }
// }

async function getProjectDataByDate(req, res, next) {
    const { projectID, calendarDate } = req.body;

    try {
        const io = req.app.get('io'); // Get the Socket.IO instance
        let loginUser = req.user;

        // Find project by ID
        const project = await ProjectModel.findByPk(projectID, {
            attributes: { exclude: ['Created_at', 'Updated_at'] },
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check for shared access via Share model
        const shareRecord = await ShareModel.findOne({
            where: {
                ProjectID: projectID,

            },
        });

        let isEditable = false;
        let isView = true;
        let isFullyEditable =false;
        if (loginUser.ID === project.UserID) {
            isEditable = true
            isView = true;
            isFullyEditable = true;
        }
      
        
        // Check if the user is part of an organization
        else if (loginUser.User_type === 2) {
            // If the organization owns the project
            // if (loginUser.ID === project.UserID) {
            //     isEditable = true;
            //     isView = true;
            // } else if (shareRecord && shareRecord.User_access) {
            //     // Check User_access for edit permissions
            //     const userAccess = shareRecord.User_access.find((access) => access.UserID === loginUser.ID);
            //     if (userAccess) {
            //         isEditable = userAccess.Type === 'edit';
            //         isView = true;
            //     }
            // }
            // else {
            //     const organization = await OrganizationModel.findOne({
            //         where: { UserID: loginUser.ID, Is_deleted: false },
            //         attributes: ['ID']
            //     });
            //     // Step 2: Get the OrganizationID
            //     const organizationId = organization.ID;

            //     // Step 3: Fetch all UserIDs associated with the OrganizationID
            //     const organizationUsers = await OrganizationUserRelationModel.findAll({
            //         where: { OrganizationID: organizationId, Is_deleted: false },
            //         attributes: ['UserID']
            //     });
            //     const organizationUserIDs = organizationUsers.map(user => user.UserID);
            //     if (organizationUserIDs.includes(project.UserID)) {
            //         isEditable = true;
            //         isView = true;
            //     }
            // }
            isEditable=true
            isView=true
            isFullyEditable = true;


        } 
        else if(loginUser.Role === 3){
            if(shareRecord){          
            const userAccess = shareRecord.User_access.find((access) => access.UserID);
            if (loginUser.ID === userAccess.UserID){     
            const userAccess = shareRecord.User_access.find((access) => access.UserID === loginUser.ID);
            console.log("adminData12",userAccess)
            if(userAccess){
            if (userAccess.Type === 'edit') {
                isEditable = true
                isView = true;
               
            }
            else if(userAccess.Type === 'admin'){
                isEditable = true
                isView = true;
            }
            else if(userAccess.Type === 'user'){
                isEditable = true
                isView = true;
            }
            else if(userAccess.Type === 'view'){
                isEditable = false
                isView = true;
            }
        }
            
            }
            else{
            isEditable=true
            isView=true
            isFullyEditable = true;   
            }
        }
        else{
            isEditable = true
            isView = true;
            isFullyEditable = true; 
        }
        }
        else {
            // // Handle cases for Basic, Advanced, and External users
            // const organizationRelation = await OrganizationUserRelationModel.findOne({
            //     where: { UserID: loginUser.ID},
            // });
            // console.log("organizationRelation",organizationRelation.Role)

            // if (organizationRelation) {
            //     // Check user's role if they belong to the same organization
            //     const role = organizationRelation.Role === 0 ? 'Basic_User' :
            //         organizationRelation.Role === 1 ? 'Advanced_User' :
            //             'External_User';

            //     if ( organizationRelation.Role === 0) {
        
            //         if (loginUser.ID === project.UserID) {
            //             isEditable = true;
            //             isView = true;
            //         } else if (shareRecord && shareRecord.User_access) {
            //             // Verify Basic_User access in `User_access`
            //             const userAccess = shareRecord.User_access.find((access) => access.UserID === loginUser.ID);
            //             if (userAccess) {
            //                 isEditable = userAccess.Type === 'edit';
            //                 isView = true;
            //             }
            //         }
            //     } else if (organizationRelation.Role === 1) {
            //         // Check project ownership within the organization
            //         if (loginUser.ID === project.UserID) {
            //             isEditable = true;
            //             isView = true;
            //         } else if (shareRecord && shareRecord.User_access) {
            //             // Verify Basic_User access in `User_access`
            //             const userAccess = shareRecord.User_access.find((access) => access.UserID === loginUser.ID);
            //             if (userAccess) {
            //                 isEditable = userAccess.Type === 'edit';
            //                 isView = true;
            //             }
            //         }
            //     } else if (organizationRelation.Role === 2) {
            //         // For External_User, only editable if share permissions allow
            //         if (shareRecord && shareRecord.User_access) {
            //             const userAccess = shareRecord.User_access.find((access) => access.UserID === loginUser.ID);
            //             if (userAccess) {
            //                 isEditable = userAccess.Type === 'edit';
            //                 isView = true;
            //             }
            //         }
            //     }
            // } else {
            //     // If no organization relation, check User_access permissions for non-organizational users
            //     if (shareRecord && shareRecord.User_access) {
            //         const userAccess = shareRecord.User_access.find((access) => access.UserID === loginUser.ID);
            //         if (userAccess) {
            //             isEditable = userAccess.Type === 'edit';
            //             isView = true;
            //         }
            //     }
            // }
         
            const userAccess = shareRecord.User_access.find((access) => access.UserID === loginUser.ID);
            if(userAccess){
            if (userAccess.Type === 'edit') {
                isEditable = true
                isView = true;
               
            }
            else if(userAccess.Type === 'admin'){
                isEditable = true
                isView = true;
                isFullyEditable = true;
            }
            else if(userAccess.Type === 'user'){
                isEditable = true
                isView = true;

            }
            else if(userAccess.Type === 'view'){
                isEditable = false
                isView = true;
            }
        }
            else{
                isEditable = false
                isView=true
            }
        }
        // Find pages associated with the project
        const pages = await PageModel.findAll({
            where: { ProjectID: projectID },
            attributes: { exclude: ['Created_at', 'Updated_at'] },
        });
        // Initialize an array to store mapped data
        const mappedPages = [];
        // Loop through each page
        for (const page of pages) {
            // Find background item for the page
            const backgroundItem = await BackgroundItemModel.findOne({
                where: { PageID: page.ID, ProjectID: page.ProjectID },
                attributes: { exclude: ['Created_at', 'Updated_at'] },
            });

            // Find calendar entry for the page and given date
            const calendarEntry = await CalenderModel.findOne({
                where: {
                    PageID: page.ID,
                    Date: {
                        [Op.gte]: new Date(calendarDate), // Start of the day
                        [Op.lt]: new Date(new Date(calendarDate).setDate(new Date(calendarDate).getDate() + 1)), // Less than the next day
                    },
                },
                attributes: { exclude: ['Created_at', 'Updated_at'] },
            });

            // Retrieve all layers related to the current page
            const layers = await LayerModel.findAll({
                where: { PageID: page.ID },
                attributes: { exclude: ['Created_at', 'Updated_at'] },
            });

            // Find annotations associated with the layers, filtered by calendar date
            for (const layer of layers) {
                const pageID = layer.PageID
                const annotations = await AnnotationModel.findAll({
                    where: {
                        LayerID: layer.ID,
                        AssignDate: {
                            [Op.gte]: new Date(calendarDate), // Start of the day
                            [Op.lt]: new Date(new Date(calendarDate).setDate(new Date(calendarDate).getDate() + 1)), // Less than the next day
                        },
                    },
                    attributes: { exclude: ['Created_at', 'Updated_at', 'ID'] },
                });
                let annotationIsEditable = false;
            
                for (const annotation of annotations) {
                    let organizationID = null;
                   
                    // Fetch `CategoryID` and `SubCategoryID` from Bob table
                    const bobRecord = await BobModel.findOne({
                        where: { bob_no_id: annotation.bob_no_id },
                        attributes: ['CategoryID', 'SubCategoryID', 'properties'],
                    });
                    // Attach the fetched data to the annotation
                    if (bobRecord) {
                        annotation.dataValues.CategoryID = bobRecord.CategoryID;
                        annotation.dataValues.SubCategoryID = bobRecord.SubCategoryID;
                        const titleObject = bobRecord.properties;
                        // console.log("hii", annotation.properties.title)
                        if (titleObject) {
                            if (annotation.Type) {
                                titleObject.PageID = pageID;
                                titleObject.LayerID = annotation.LayerID;
                                titleObject.AssignDate = annotation.AssignDate;
                                titleObject.ParentAnnotationID = annotation.front_no_id;
                                // Update the title object content


                                //  annotation.dataValues.AssignDate = titleObject.AssignDate; 
                                //  annotation.dataValues.PageID = layer.PageID || null; 
                                //  annotation.dataValues.LayerID = titleObject.LayerID || null;  
                                //  annotation.dataValues.ID = titleObject.ParentAnnotationID || null; // Set parentSelectSpecialId
                                // Check if the titleObject has the `text` property
                                if (annotation.dataValues.properties.title) {
                                    // If `text` is provided, update only the `text` property in `title`
                                    annotation.dataValues.properties.title = {
                                        ...annotation.dataValues.properties.title, // Keep existing properties
                                        text: titleObject.text, // Replace only the `text` field
                                    };
                                } else {
                                    // If no `text` is provided, replace the entire `title` object
                                    annotation.dataValues.properties.title = titleObject || null;
                                }
                            }
                        } else {
                            // If no title object, set Title to null
                            annotation.dataValues.properties.title = null;
                        }
                    }
                    // Apply project-level isEditable
                    if (!isEditable) {
                        annotationIsEditable = false;
                    } 
                    else if (loginUser.ID === project.UserID) {
                        // If loginUser is the project owner
                       
                        annotationIsEditable = true;
                    } else if (loginUser.User_type === 2) {
                        // Organization user
                    } 

                    else if (shareRecord) {
                       
                        const userAccess = shareRecord.User_access.find((access) => access.UserID === loginUser.ID);
                        if (userAccess) {   
                               
                            if (userAccess.Type === 'view') {
                                annotationIsEditable = false;
                            } 
                            // else if (userAccess.Type === 'user') {
                            //     // Check if annotation belongs to the user
                            //     IsEditable = annotation.UserID === loginUser.ID;
                            // } 
                             else if (userAccess.Type === 'admin') {
                                // Check if annotation belongs to the user
                                annotationIsEditable = true
                            } 
                            else if (userAccess.Type === 'edit') {
                                const userOrganization = await OrganizationUserRelationModel.findOne({
                                    where: { UserID: loginUser.ID, Is_deleted: false },
                                    attributes: ['OrganizationID', 'UserID'],
                                });
            
                                if (userOrganization) {
                                    const organizationData = await OrganizationModel.findOne({
                                        where: { ID: userOrganization.OrganizationID, Is_deleted: false },
                                        attributes: ['UserID'],
                                    });
            
                                    if (organizationData && organizationData.UserID === project.UserID) {
                                        annotationIsEditable = true;
                                    } else if (annotation.UserID === loginUser.ID) {
                                        annotationIsEditable = true;
                                    } else {
                                        const annotationUserOrganization = await OrganizationUserRelationModel.findOne({
                                            where: { UserID: annotation.UserID, Is_deleted: false },
                                            attributes: ['OrganizationID'],
                                        });
            
                                        if (annotationUserOrganization) {
                                            const annotationOrganizationData = await OrganizationModel.findOne({
                                                where: { ID: annotationUserOrganization.OrganizationID, Is_deleted: false },
                                                attributes: ['UserID'],
                                            });
            
                                            if (
                                                annotationOrganizationData &&
                                                annotationOrganizationData.UserID === userOrganization.OrganizationID
                                            ) {
                                                annotationIsEditable = true;
                                            } else {
                                                annotationIsEditable = false;
                                            }
                                        }
                                    }
                                }
                            }
                        }  else if (loginUser.Role === 3){
                            annotationIsEditable = true
                        }

                    }
                    else if (loginUser.Role === 3){
                        annotationIsEditable = true
                    }

 
 // Check if annotation creator is an organization
 const user = await UserModel.findByPk(annotation.UserID, {
    attributes: ['ID', 'User_type'],
});

if (user?.User_type === 2) {
    // If UserType is 2, take UserID as OrganizationID
    organizationID = user.ID;
} else {
    // Otherwise, find OrganizationID via OrganizationUserRelation
    const relation = await OrganizationUserRelationModel.findOne({
        where: {
            UserID: annotation.UserID,
            Is_deleted: false,
        },
        attributes: ['OrganizationID'],
    });
  
    if (relation) {
        // Match the OrganizationID in Organization table to get the corresponding UserID
        const organization = await OrganizationModel.findByPk(relation.OrganizationID, {
            attributes: ['UserID'],
        });

        if (organization) {
            organizationID = organization.UserID;
        }
    }
}

annotation.dataValues.OrganizationID = organizationID;
                      // Assign the determined IsEditable value to the annotation
        annotation.dataValues.IsEditable = annotationIsEditable;
 

               
            }
             // Map `ID` to `front_no_id` and add user-type data
             const annotationsWithUserInfo = annotations.map(annotation => {
                const annotationData = annotation.toJSON();
                annotationData.ID = annotationData.front_no_id;
                delete annotationData.front_no_id;
                annotationData.PageID = page.ID;

                // Add user type, role, and editability
                // annotationData.User_type = userType;
                annotationData.IsEditable = annotation.dataValues.IsEditable;
                annotationData.OrganizationID = annotation.dataValues.OrganizationID;
                // annotationData.Role = role;

                return annotationData;
            });

            // Attach annotations to the respective layer
            layer.dataValues.annotations = annotationsWithUserInfo;
            }

            // Sort layers by `Layer_order`
            layers.sort((a, b) => a.Layer_order - b.Layer_order);

            // Construct mapped page object with existing calendar entry and layers
            const mappedPage = {
                ID: page.ID,
                name: page.Name,
                background: backgroundItem,
                calendar: calendarEntry ? {
                    ID: calendarEntry.ID,
                    UserID: calendarEntry.UserID,
                    PageID: calendarEntry.PageID,
                    Date: calendarEntry.Date,
                    Notes: calendarEntry.Notes,
                    BgID: calendarEntry.BgID,
                    layers: layers,
                } : {
                    layers: layers,
                },
            };

            // Push mapped page to the array
            mappedPages.push(mappedPage);
        }

        // Construct the response object
        const responseData = {
            project: {
                ...project.toJSON(),
                IsEditable: isEditable,
                IsView: isView,
                IsFullyEditable: isFullyEditable
            },
            pages: mappedPages,
        };
        io.emit('projectDataUpdated', responseData);

        res.json(responseData);
    } catch (error) {
        console.error('Error:', error);
        next(error);
    }
}

// async function getProjectDataByDate(req, res, next) {
//     const { projectID, calendarDate } = req.body;

//     try {
//         const io = req.app.get('io'); // Get the Socket.IO instance
//         let loginUser = req.user;

//         // Find project by ID
//         const project = await ProjectModel.findByPk(projectID, {
//             attributes: { exclude: ['Created_at', 'Updated_at'] },
//         });
//         if (!project) {
//             return res.status(404).json({ message: 'Project not found' });
//         }

//         // Find pages associated with the project
//         const pages = await PageModel.findAll({
//             where: { ProjectID: projectID },
//             attributes: { exclude: ['Created_at', 'Updated_at'] },
//         });

//         // Initialize an array to store mapped data
//         const mappedPages = [];



//         // Loop through each page
//         for (const page of pages) {
//             // Find background item for the page
//             const backgroundItem = await BackgroundItemModel.findOne({
//                 where: { PageID: page.ID, ProjectID: page.ProjectID },
//                 attributes: { exclude: ['Created_at', 'Updated_at'] },
//             });

//             // Find calendar entry for the page and given date
//             const calendarEntry = await CalenderModel.findOne({
//                 where: {
//                     PageID: page.ID,
//                     Date: {
//                         [Op.gte]: new Date(calendarDate), // Start of the day
//                         [Op.lt]: new Date(new Date(calendarDate).setDate(new Date(calendarDate).getDate() + 1)), // Less than the next day
//                     },
//                 },
//                 attributes: { exclude: ['Created_at', 'Updated_at'] },
//             });

//             // Retrieve all layers related to the current page
//             const layers = await LayerModel.findAll({
//                 where: { PageID: page.ID },
//                 attributes: { exclude: ['Created_at', 'Updated_at'] },
//             });

//             // Find annotations associated with the layers, filtered by calendar date
//             for (const layer of layers) {
//                 const pageID = layer.PageID
//                 const annotations = await AnnotationModel.findAll({
//                     where: {
//                         LayerID: layer.ID,
//                         AssignDate: {
//                             [Op.gte]: new Date(calendarDate), // Start of the day
//                             [Op.lt]: new Date(new Date(calendarDate).setDate(new Date(calendarDate).getDate() + 1)), // Less than the next day
//                         },
//                     },
//                     attributes: { exclude: ['Created_at', 'Updated_at', 'ID'] },
//                 });
//                 for (const annotation of annotations) {
//                     // Fetch `CategoryID` and `SubCategoryID` from Bob table
//                     const bobRecord = await BobModel.findOne({
//                         where: { bob_no_id: annotation.bob_no_id },
//                         attributes: ['CategoryID', 'SubCategoryID', 'properties'],
//                     });


//                     // Attach the fetched data to the annotation
//                     if (bobRecord) {
//                         annotation.dataValues.CategoryID = bobRecord.CategoryID;
//                         annotation.dataValues.SubCategoryID = bobRecord.SubCategoryID;
//                         const titleObject = bobRecord.properties;
//                         // console.log("hii", annotation.properties.title)
//                         if (titleObject) {
//                             // Update the title object content
//                             if (annotation.properties.title) {
//                                 titleObject.PageID = pageID;
//                                 titleObject.LayerID = annotation.LayerID;
//                                 titleObject.AssignDate = annotation.AssignDate;
//                                 titleObject.ParentAnnotationID = annotation.front_no_id;

//                                 //  annotation.dataValues.AssignDate = titleObject.AssignDate; 
//                                 //  annotation.dataValues.PageID = layer.PageID || null; 
//                                 //  annotation.dataValues.LayerID = titleObject.LayerID || null;  
//                                 //  annotation.dataValues.ID = titleObject.ParentAnnotationID || null; // Set parentSelectSpecialId
//                                 annotation.dataValues.properties.title = titleObject || null;
//                             }
//                         } else {
//                             // If no title object, set Title to null
//                             annotation.dataValues.properties.title = null;
//                         }
//                     }
//                 }


//                 // Determine the user type and editability
//                 let userType = 'User'; // Default to 'User'
//                 let isEditable = false;
//                 let role = null;

//                 // Check if user is Admin or Organization
//                 const user = await UserModel.findOne({ where: { ID: loginUser.ID } });
//                 const organizationRelation = await OrganizationUserRelationModel.findOne({ where: { UserID: loginUser.ID, OrganizationID: project.UserID } });
//                 console.log("vivek", loginUser.User_type)
//                 // Check if user is Admin
//                 if (loginUser.User_type === 0) {
//                     userType = 'Admin';
//                     isEditable = true;  // Admins are always editable
//                 }
//                 // Check if user is Organization
//                 else if (loginUser.User_type === 2) {
//                     console.log("vivek1")
//                     userType = 'Organization';

//                     // Check if loginUser.ID matches project.UserID
//                     if (loginUser.ID === project.UserID) {
//                         isEditable = true;  // Organization can edit their own projects
//                     }
//                     // Check OrganizationUserRelation if loginUser.ID does not match project.UserID
//                     else if (organizationRelation) {
//                         role = organizationRelation.Role === '0' ? 'Basic_User' : organizationRelation.Role === '1' ? 'Advanced_User' : 'External_User';

//                         if (role === 'Advanced_User') {
//                             isEditable = true;  // Advanced users can always edit
//                         } else if (role === 'External_User') {
//                             isEditable = false;  // External users can never edit
//                         } else if (role === 'Basic_User') {
//                             // For Basic users, check if the annotation's UserID matches loginUser.ID
//                             // const matchingAnnotations = await AnnotationModel.findAll({
//                             //     where: {
//                             //         UserID: loginUser.ID,  // Check if annotation belongs to loginUser
//                             //         LayerID: { [Op.in]: layers.map(layer => layer.ID) } // Filter based on the layers of this project
//                             //     }
//                             // });

//                             // isEditable = matchingAnnotations.length > 0;  // Basic users can edit only their own annotations
//                             let isEditable = false; // Default to false

//                             for (const annotation of annotations) {
//                                 if (annotation.UserID === loginUser.ID) {
//                                     isEditable = true;
//                                     break;  // Exit loop early if match found
//                                 }
//                             }
//                         }
//                     }
//                 }
//                 // Check if user is a regular User
//                 else if (loginUser.User_type === 1) {
//                     userType = 'User';

//                     // Check if loginUser.ID matches project.UserID
//                     if (loginUser.ID === project.UserID) {
//                         isEditable = false;  // Regular users cannot edit their own projects
//                     }
//                     // Check OrganizationUserRelation if loginUser.ID does not match project.UserID
//                     else if (organizationRelation) {
//                         role = organizationRelation.Role === '0' ? 'Basic_User' : organizationRelation.Role === '1' ? 'Advanced_User' : 'External_User';

//                         if (role === 'Advanced_User') {
//                             isEditable = true;  // Advanced users can always edit
//                         } else if (role === 'External_User') {
//                             isEditable = false;  // External users can never edit
//                         } else if (role === 'Basic_User') {
//                             // // For Basic users, check if the annotation's UserID matches loginUser.ID
//                             // const matchingAnnotations = await AnnotationModel.findAll({
//                             //     where: {
//                             //         UserID: loginUser.ID,  // Check if annotation belongs to loginUser
//                             //         LayerID: { [Op.in]: layers.map(layer => layer.ID) } // Filter based on the layers of this project
//                             //     }
//                             // });

//                             // isEditable = matchingAnnotations.length > 0;  // Basic users can edit only their own annotations
//                             let isEditable = false; // Default to false

//                             for (const annotation of annotations) {
//                                 if (annotation.UserID === loginUser.ID) {
//                                     isEditable = true;
//                                     break;  // Exit loop early if match found
//                                 }
//                             }
//                         }
//                     }
//                 }

//                 // Map `ID` to `front_no_id` and add user-type data
//                 const annotationsWithUserInfo = annotations.map(annotation => {
//                     const annotationData = annotation.toJSON();
//                     annotationData.ID = annotationData.front_no_id;
//                     delete annotationData.front_no_id;
//                     annotationData.PageID = page.ID;

//                     // Add user type, role, and editability
//                     annotationData.User_type = userType;
//                     annotationData.isEditable = isEditable;
//                     annotationData.Role = role;

//                     return annotationData;
//                 });

//                 // Attach annotations to the respective layer
//                 layer.dataValues.annotations = annotationsWithUserInfo;
//             }

//             // Sort layers by `Layer_order`
//             layers.sort((a, b) => a.Layer_order - b.Layer_order);

//             // Construct mapped page object with existing calendar entry and layers
//             const mappedPage = {
//                 ID: page.ID,
//                 name: page.Name,
//                 background: backgroundItem,
//                 calendar: calendarEntry ? {
//                     ID: calendarEntry.ID,
//                     UserID: calendarEntry.UserID,
//                     PageID: calendarEntry.PageID,
//                     Date: calendarEntry.Date,
//                     Notes: calendarEntry.Notes,
//                     BgID: calendarEntry.BgID,
//                     layers: layers,
//                 } : {
//                     layers: layers,
//                 },
//             };

//             // Push mapped page to the array
//             mappedPages.push(mappedPage);
//         }

//         // Construct the response object
//         const responseData = {
//             project: project,
//             pages: mappedPages,
//         };
//         io.emit('projectDataUpdated', responseData);

//         res.json(responseData);
//     } catch (error) {
//         console.error('Error:', error);
//         next(error);
//     }
// }
async function getProjectDataByDateForPrint(req, res, next) {
    const { projectID, calendarDate } = req.body;

    try {
        // Find project by ID
        const project = await ProjectModel.findByPk(projectID, {
            attributes: { exclude: ['Created_at', 'Updated_at'] },
        });
        if (!project) {
            return res.status(404).json({ message: messages.error.PROJECT_NOT_FOUND, status: messages.error.STATUS });
        }

        // Retrieve all pages associated with the projectID
        const pages = await PageModel.findAll({
            where: { ProjectID: projectID }
        });

        if (!pages.length) {
            return res.status(404).json({ message: 'No pages found for the given project.', status: messages.error.STATUS });
        }

        // Initialize an array to store mapped data for all pages
        const mappedPages = [];

        // Handle both single date and array of dates
        const dates = Array.isArray(calendarDate) ? calendarDate : [calendarDate];

        // Loop through each page associated with the project
        for (const page of pages) {
            // Retrieve background item for the page
            const backgroundItem = await BackgroundItemModel.findOne({
                where: { PageID: page.ID, ProjectID: projectID },
                attributes: { exclude: ['Created_at', 'Updated_at'] },
            });

            // Find all calendar entries for the page within the date range
            const calendarEntries = await CalenderModel.findAll({
                where: {
                    PageID: page.ID,
                    Date: {
                        [Op.in]: dates.map(date => new Date(date))  // Find entries matching any of the provided dates
                    },
                },
                attributes: { exclude: ['Created_at', 'Updated_at'] },
            });

            // Retrieve all layers related to the current page
            const layers = await LayerModel.findAll({
                where: { PageID: page.ID },
                attributes: { exclude: ['Created_at', 'Updated_at'] },
            });

            // Find annotations associated with the layers, filtered by provided dates
            const annotations = await AnnotationModel.findAll({
                where: {
                    LayerID: { [Op.in]: layers.map(layer => layer.ID) },
                    AssignDate: {
                        [Op.in]: dates.map(date => new Date(date)),  // Find annotations for any of the provided dates
                    },
                },
                attributes: { exclude: ['Created_at', 'Updated_at', 'ID'] },
            });

            // Map annotations to their respective layers
            const layerMap = layers.reduce((acc, layer) => {
                acc[layer.ID] = { ...layer.dataValues, annotations: [] };
                return acc;
            }, {});

            annotations.forEach(annotation => {
                const annotationData = annotation.toJSON();
                annotationData.ID = annotationData.front_no_id; // Use `front_no_id` as `ID`
                delete annotationData.front_no_id;
                annotationData.PageID = page.ID;

                if (layerMap[annotation.LayerID]) {
                    layerMap[annotation.LayerID].annotations.push(annotationData);
                }
            });

            // Sort layers by `Layer_order`
            const sortedLayers = Object.values(layerMap).sort((a, b) => a.Layer_order - b.Layer_order);

            // Construct mapped page object
            const mappedPage = {
                ID: page.ID,
                name: page.Name,
                background: backgroundItem,
                calendar: {
                    layers: sortedLayers,
                },
            };

            // Push mapped page to the array
            mappedPages.push(mappedPage);
        }

        // Construct the response object
        const responseData = {
            project: project,
            pages: mappedPages,
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error:', error);
        next(error);
    }
}
async function getProjectByID(req, res, next) {
    const { projectID, calendarDate } = req.body;

    try {
        // Find project by ID
        const project = await ProjectModel.findByPk(projectID, {
            attributes: { exclude: ['Created_at', 'Updated_at'] },
        });
        if (!project) {
            return res.status(404).json({ message: messages.error.PROJECT_NOT_FOUND, status: messages.error.STATUS });
        }

        // Find pages associated with the project
        const pages = await PageModel.findAll({
            where: { ProjectID: projectID },
            attributes: { exclude: ['Created_at', 'Updated_at'] },
        });

        // Initialize an array to store mapped data
        const mappedPages = [];

        // Loop through each page
        for (const page of pages) {
            // Find background item for the page
            const backgroundItem = await BackgroundItemModel.findOne({
                where: { PageID: page.ID, ProjectID: page.ProjectID },
                attributes: { exclude: ['Created_at', 'Updated_at'] },
            });
            // console.log("hiii",backgroundItem)

            // Find calendar entry for the page and given date
            let calendarEntry = await CalenderModel.findOne({
                where: {
                    PageID: page.ID,

                },
                attributes: { exclude: ['Created_at', 'Updated_at'] },
            });

            const layers = await LayerModel.findAll({
                where: {
                    PageID: page.ID,
                },
                attributes: { exclude: ['Created_at', 'Updated_at'] },
            });


            // Find annotations associated with the layers
            for (const layer of layers) {
                const annotations = await AnnotationModel.findAll({
                    where: { LayerID: layer.ID },
                    attributes: { exclude: ['Created_at', 'Updated_at'] },
                });

                // Attach annotations to the respective layer
                const annotationsWithPageID = annotations.map(annotation => ({
                    ...annotation.toJSON(),
                    PageID: page.ID,
                }));

                // Attach annotations to the respective layer
                layer.dataValues.annotations = annotationsWithPageID;
            }
            layers.sort((a, b) => a.Layer_order - b.Layer_order);
            // Construct mapped page object with existing calendar entry and layers
            const mappedPage = {
                ID: page.ID,
                name: page.Name,
                background: backgroundItem,
                calendar: {
                    ID: calendarEntry.ID,
                    UserID: calendarEntry.UserID,
                    PageID: calendarEntry.PageID,
                    Date: calendarEntry.Date,
                    Notes: calendarEntry.Notes,
                    layers: layers,
                },
            };

            // Push mapped page to the array
            mappedPages.push(mappedPage);

        }

        // Construct the response object
        const responseData = {
            project: project,
            pages: mappedPages,
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error:', error);
        next(error);
    }
}

// async function updateProjectDataById(req, res, next) {
//     const { projectID, projectData, layerFlag } = req.body;

//     try {
//         const io = req.app.get('io');
//         const userID = req.user?.ID; // Assuming you have the user ID from the authenticated user

//         // Initialize the object to accumulate final data
//         const emitData = {
//             projectID,
//             userID
//         };

//         // Update project details if provided
//         if (projectData.project) {
//             await ProjectModel.update(projectData.project, {
//                 where: { ID: projectID },
//             });
//         }

//         // Loop through each page in the request
//         for (const page of projectData.pages || []) {
//             // Update page details if provided
//             if (page.ID && Object.keys(page).length > 1) {
//                 await PageModel.update(page, { where: { ID: page.ID } });
//             }

//             // Update background item for the page if provided
//             if (page.background && page.background.ID) {
//                 await BackgroundItemModel.update(page.background, {
//                     where: { ID: page.background.ID },
//                 });
//             }

//             // Update calendar entry for the page if provided
//             if (page.calendar && page.calendar.ID) {
//                 await CalenderModel.update(page.calendar, {
//                     where: { ID: page.calendar.ID },
//                 });
//             }

//             // Find existing layers for the page in the database 
//             if (layerFlag) {
//                 const existingLayers = await LayerModel.findAll({
//                     where: { PageID: page.ID },
//                 });

//                 // Create a Set of layer IDs from the request data
//                 const updatedLayerIDs = new Set(page.calendar?.layers.map(layer => layer.ID) || []);

//                 // Find layers to delete: layers in the database but not in the updated data
//                 const layersToDelete = existingLayers.filter(layer => !updatedLayerIDs.has(layer.ID));

//                 // Delete the layers that are not present in the request data
//                 for (const layerToDelete of layersToDelete) {
//                     await AnnotationModel.destroy({
//                         where: { layerID: layerToDelete.ID }
//                     });
//                     await LayerModel.destroy({ where: { ID: layerToDelete.ID } });
//                 }
//             }

//             // Loop through each layer in the page
//             for (const layer of page.calendar?.layers || []) {
//                 if (layer.ID) {
//                     await LayerModel.update(layer, { where: { ID: layer.ID } });

//                     // Fetch existing annotations from the database
//                     const existingAnnotations = await AnnotationModel.findAll({
//                         where: { layerID: layer.ID },
//                     });

//                     // Create a set of existing annotation IDs
//                     const existingAnnotationIDs = new Set(
//                         existingAnnotations.map(annotation => annotation.front_no_id)
//                     );

//                     const newAnnotationIDs = new Set();

//                     // Loop through each annotation in the layer
//                     for (const annotation of layer.annotations || []) {

//                          const { bob_no_id, CategoryID, SubCategoryID, ...annotationData } = annotation;

//                          if (!bob_no_id || !CategoryID || !SubCategoryID) {
//                              return res.status(400).json({
//                                  message: "Annotation is missing bob_no_id, CategoryID, or SubCategoryID",
//                              });
//                          }

//                          const [bob] = await BobModel.findOrCreate({
//                              where: { bob_no_id },
//                              defaults: { UserID: annotation.UserID, CategoryID, SubCategoryID },
//                          });

//                          annotationData.bob_no_id = bob.ID;

//                         if (annotation.ID) {
//                             const existingAnnotation = await AnnotationModel.findOne({
//                                 where: { front_no_id: annotation.ID }
//                             });

//                             if (existingAnnotation) {
//                                 if (existingAnnotation.Is_deleted) {
//                                     await existingAnnotation.update({ Is_deleted: false });
//                                 }
//                                 const { ID, parentSelectSpecialId, isPasteSpecialParent, ...updateData } = annotation;

//                                 await AnnotationModel.update(
//                                     {
//                                         ...updateData,
//                                         front_no_id: annotation.ID,
//                                         properties: annotation.properties || {},
//                                     },
//                                     { where: { front_no_id: annotation.ID } }
//                                 );
//                             } else {
//                                 await AnnotationModel.create({
//                                     ...annotation,
//                                     front_no_id: annotation.ID,
//                                     properties: annotation.properties || {},
//                                     ID: undefined
//                                 });
//                             }
//                         }
//                     }

//                     const annotationsToDelete = Array.from(existingAnnotationIDs).filter(
//                         id => !newAnnotationIDs.has(id)
//                     );

//                     if (annotationsToDelete.length > 0) {
//                         await AnnotationModel.destroy({
//                             where: { front_no_id: annotationsToDelete, Is_deleted: true },
//                         });
//                     }
//                 }
//             }
//         }

//         // Emit events at the end of processing with only projectID and userID
//         io.emit('bulkUpdate', emitData);
//         console.log("emit", emitData);

//         res.json({ message: messages.success.PROJECT_UPDATE, status: messages.success.STATUS });
//     } catch (error) {
//         next(error);
//     }
// }
async function updateProjectDataById(req, res, next) {
    const { projectID, projectData, layerFlag } = req.body;

    try {
        const io = req.app.get('io');
        const userID = req.user?.ID; // Assuming you have the user ID from the authenticated user

        // Initialize the object to accumulate final data
        const emitData = {
            projectID,
            userID
        };

        // Update project details if provided
        if (projectData.project) {
            await ProjectModel.update(projectData.project, {
                where: { ID: projectID },
            });
        }

        // Loop through each page in the request
        for (const page of projectData.pages || []) {
            // Update page details if provided
            if (page.ID && Object.keys(page).length > 1) {
                await PageModel.update(page, { where: { ID: page.ID } });
            }

            // Update background item for the page if provided
            if (page.background && page.background.ID) {
                await BackgroundItemModel.update(page.background, {
                    where: { ID: page.background.ID },
                });
            }

            // Update calendar entry for the page if provided
            if (page.calendar && page.calendar.ID) {
                await CalenderModel.update(page.calendar, {
                    where: { ID: page.calendar.ID },
                });
            }

            // Find existing layers for the page in the database 
            if (layerFlag) {
                const existingLayers = await LayerModel.findAll({
                    where: { PageID: page.ID },
                });

                // Create a Set of layer IDs from the request data
                const updatedLayerIDs = new Set(page.calendar?.layers.map(layer => layer.ID) || []);

                // Find layers to delete: layers in the database but not in the updated data
                const layersToDelete = existingLayers.filter(layer => !updatedLayerIDs.has(layer.ID));

                // Delete the layers that are not present in the request data
                for (const layerToDelete of layersToDelete) {
                    await AnnotationModel.destroy({
                        where: { layerID: layerToDelete.ID }
                    });
                    await LayerModel.destroy({ where: { ID: layerToDelete.ID } });
                }
            }

            // Loop through each layer in the page
            for (const layer of page.calendar?.layers || []) {
                if (layer.ID) {
                    await LayerModel.update(layer, { where: { ID: layer.ID } });

                    // Fetch existing annotations from the database
                    const existingAnnotations = await AnnotationModel.findAll({
                        where: { layerID: layer.ID },
                    });

                    // Create a set of existing annotation IDs
                    const existingAnnotationIDs = new Set(
                        existingAnnotations.map(annotation => annotation.front_no_id)
                    );

                    const newAnnotationIDs = new Set();

                    // Loop through each annotation in the layer
                    for (const annotation of layer.annotations || []) {

                        const { bob_no_id, CategoryID, SubCategoryID, properties, ...annotationData } = annotation;

                        if (!bob_no_id || !CategoryID || !SubCategoryID) {
                            return res.status(400).json({
                                message: "Annotation is missing bob_no_id, CategoryID, or SubCategoryID",
                            });
                        }

                        const [bob] = await BobModel.findOrCreate({
                            where: { bob_no_id },
                            defaults: { UserID: annotation.UserID, CategoryID, SubCategoryID },
                        });

                        annotationData.bob_no_id = bob.ID;
                        if (properties?.label === "title") {
                            await BobModel.update(
                                { properties },
                                { where: { ID: bob.ID } }
                            );
                        }

                        if (annotation.properties.title === null) {

                            await BobModel.update(
                                { properties: null },
                                { where: { ID: bob.ID } }
                            );
                        }


                        if (annotation.ID) {
                            const existingAnnotation = await AnnotationModel.findOne({
                                where: { front_no_id: annotation.ID }
                            });

                            if (existingAnnotation) {
                                if (existingAnnotation.Is_deleted) {
                                    await existingAnnotation.update({ Is_deleted: false });
                                }
                                const { ID, parentSelectSpecialId, isPasteSpecialParent, ...updateData } = annotation;

                                await AnnotationModel.update(
                                    {
                                        ...updateData,
                                        front_no_id: annotation.ID,
                                        properties: annotation.properties || {},
                                    },
                                    { where: { front_no_id: annotation.ID } }
                                );
                            } else {
                                await AnnotationModel.create({
                                    ...annotation,
                                    front_no_id: annotation.ID,
                                    properties: annotation.properties || {},
                                    ID: undefined
                                });
                            }
                        }
                    }

                    const annotationsToDelete = Array.from(existingAnnotationIDs).filter(
                        id => !newAnnotationIDs.has(id)
                    );

                    if (annotationsToDelete.length > 0) {
                        await AnnotationModel.destroy({
                            where: { front_no_id: annotationsToDelete, Is_deleted: true },
                        });

                        // Check for orphaned Bobs and delete if no associated annotations exist
                        const bobIdsWithAnnotations = await AnnotationModel.findAll({
                            where: { bob_no_id: { [Sequelize.Op.not]: null } },
                            attributes: ['bob_no_id'],
                            group: ['bob_no_id'],
                        });

                        const bobIdsToKeep = new Set(bobIdsWithAnnotations.map(b => b.bob_no_id));
                        const allBobs = await BobModel.findAll();
                        const bobsToDelete = allBobs.filter(b => !bobIdsToKeep.has(b.bob_no_id));

                        for (const bobToDelete of bobsToDelete) {
                            await BobModel.destroy({ where: { bob_no_id: bobToDelete.bob_no_id } });
                        }
                    }
                }
            }
        }

        // Emit events at the end of processing with only projectID and userID
        io.emit('bulkUpdate', emitData);
        console.log("emit", emitData);

        res.json({ message: messages.success.PROJECT_UPDATE, status: messages.success.STATUS });
    } catch (error) {
        next(error);
    }
}

// async function updateProjectDataById(req, res, next) {
//     const { projectID, projectData, layerFlag } = req.body;

//     try {
//         const io = req.app.get('io');
//         const userID = req.user?.ID;
//         const emitData = { projectID, userID };

//         if (projectData.project) {
//             await ProjectModel.update(projectData.project, {
//                 where: { ID: projectID },
//             });
//         }

//         for (const page of projectData.pages || []) {
//             if (page.ID && Object.keys(page).length > 1) {
//                 await PageModel.update(page, { where: { ID: page.ID } });
//             }

//             if (page.background?.ID) {
//                 await BackgroundItemModel.update(page.background, {
//                     where: { ID: page.background.ID },
//                 });
//             }

//             if (page.calendar?.ID) {
//                 await CalenderModel.update(page.calendar, {
//                     where: { ID: page.calendar.ID },
//                 });
//             }
//             const calendarDate = page.calendar?.Date;
//             console.log("data",calendarDate)

//             if (layerFlag) {
//                 const existingLayers = await LayerModel.findAll({
//                     where: { PageID: page.ID },
//                 });

//                 const updatedLayerIDs = new Set(page.calendar?.layers.map(layer => layer.ID) || []);
//                 const layersToDelete = existingLayers.filter(layer => !updatedLayerIDs.has(layer.ID));

//                 for (const layerToDelete of layersToDelete) {
//                     await AnnotationModel.destroy({ where: { layerID: layerToDelete.ID } });
//                     await LayerModel.destroy({ where: { ID: layerToDelete.ID } });
//                 }
//             }

//             for (const layer of page.calendar?.layers || []) {
//                 if (layer.ID) {
//                     await LayerModel.update(layer, { where: { ID: layer.ID } });

//                     const existingAnnotations = await AnnotationModel.findAll({
//                         where: { layerID: layer.ID, AssignDate: {
//                             [Op.gte]: new Date(calendarDate), // Start of the day
//                             [Op.lt]: new Date(new Date(calendarDate).setDate(new Date(calendarDate).getDate() + 1)), // Less than the next day
//                         },  },
//                     });

//                     // Create a set of existing annotation IDs
//                     const existingAnnotationIDs = new Set(
//                         existingAnnotations.map(annotation => annotation.front_no_id)
//                     );
//                     console.log("hii",existingAnnotationIDs)

//                     const newAnnotationIDs = new Set();

//                     for (const annotation of layer.annotations || []) {
//                         const { bob_no_id, CategoryID, SubCategoryID, ...annotationData } = annotation;

//                         if (!bob_no_id || !CategoryID || !SubCategoryID) {
//                             return res.status(400).json({
//                                 message: "Annotation is missing bob_no_id, CategoryID, or SubCategoryID",
//                             });
//                         }

//                         const [bob] = await BobModel.findOrCreate({
//                             where: { bob_no_id },
//                             defaults: { UserID: annotation.UserID, CategoryID, SubCategoryID },
//                         });

//                         annotationData.BobID = bob.ID;

//                         if (annotation.ID) {
//                             const existingAnnotation = await AnnotationModel.findOne({
//                                 where: { front_no_id: annotation.ID },
//                             });

//                             if (existingAnnotation) {
//                                 if (existingAnnotation.Is_deleted) {
//                                     await existingAnnotation.update({ Is_deleted: false });
//                                 }
//                                 const { ID, parentSelectSpecialId, isPasteSpecialParent, ...updateData } = annotation;
//                                 await AnnotationModel.update(
//                                     {
//                                         ...updateData,
//                                         front_no_id: annotation.ID,
//                                         bob_no_id,
//                                         properties: annotation.properties || {},
//                                     },
//                                     { where: { front_no_id: annotation.ID } }
//                                 );
//                             } else {
//                                 await AnnotationModel.create({
//                                     ...annotation,
//                                     front_no_id: annotation.ID,
//                                     bob_no_id,
//                                     properties: annotation.properties || {},
//                                     ID: undefined,
//                                 });
//                             }
//                         }
//                         newAnnotationIDs.add(annotation.ID);
//                     }

//                     // Delete annotations not present in the payload
//                     const annotationsToDelete = Array.from(existingAnnotationIDs).filter(
//                         id => !newAnnotationIDs.has(id)
//                     );


//                     if (annotationsToDelete.length > 0) {
//                         await AnnotationModel.destroy({
//                             where: { front_no_id: annotationsToDelete},
//                         });
//                     }

//                     // Check for orphaned Bobs and delete if no associated annotations exist
//                     const bobIdsWithAnnotations = await AnnotationModel.findAll({
//                         where: { bob_no_id: { [Sequelize.Op.not]: null } },
//                         attributes: ['bob_no_id'],
//                         group: ['bob_no_id'],
//                     });

//                     const bobIdsToKeep = new Set(bobIdsWithAnnotations.map(b => b.bob_no_id));
//                     const allBobs = await BobModel.findAll();
//                     const bobsToDelete = allBobs.filter(b => !bobIdsToKeep.has(b.bob_no_id));

//                     for (const bobToDelete of bobsToDelete) {
//                         await BobModel.destroy({ where: { bob_no_id: bobToDelete.bob_no_id } });
//                     }
//                 }
//             }
//         }

//         io.emit('bulkUpdate', emitData);
//         res.json({ message: 'Project updated successfully', status: 'success' });
//     } catch (error) {
//         next(error);
//     }
// }
async function deleteProject(req, res, next) {
    // #swagger.tags = ['Project']
    // #swagger.description = 'Delete Project by id'
    const { id } = req.params;
    const userId = req.user.ID;
    try {


        const projectDeleted = await ProjectModel.destroy({
            where: { ID: id, UserID: userId }
        });
        const pageDeleted = await PageModel.destroy({
            where: { ProjectID: id, UserID: userId }
        });
        const backgroundDeleted = await BackgroundItemModel.destroy({
            where: { ProjectID: id, UserID: userId }
        });
        const layerDeleted = await LayerModel.destroy({
            where: { PageID: id, UserID: userId }
        });
        const calenderDeleted = await CalenderModel.destroy({
            where: { PageID: id, UserID: userId }
        });


        // const totalDeleted = calenderDeleted + layerDeleted + pageDeleted + backgroundDeleted + projectDeleted;

        if (projectDeleted || pageDeleted || backgroundDeleted || layerDeleted || calenderDeleted) {
            return res.status(200).json({ message: messages.success.PROJECT_DELETED, status: messages.success.STATUS });
        } else {
            return res.status(404).json({ message: messages.error.PROJECT_NOT_FOUND, status: messages.error.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}

// async function getCalenderProject(req, res, next) {
//     // #swagger.tags = ['Project']
//     // #swagger.description = 'Get calendar basis annotation'
//     const userId = req.user.ID; // Assuming user is authenticated and user ID is available
//     const { projectId } = req.body; // Project ID from request body

//     try {
//         // Step 1: Find all pages associated with the Project ID
//         const pages = await PageModel.findAll({
//             where: { ProjectID: projectId },
//             attributes: ['ID']
//         });

//         if (!pages.length) {
//             return res.status(404).json({ message: 'No pages found for this project' });
//         }

//         const pageIds = pages.map(page => page.ID);

//         // Step 2: Find all layers associated with the found pages
//         const layers = await LayerModel.findAll({
//             where: { PageID: pageIds },
//             attributes: ['ID', 'AssignDate']
//         });

//         if (!layers.length) {
//             return res.status(404).json({ message: 'No layers found for the pages' });
//         }

//         // Step 3: Group layers by AssignDate and determine if there are any annotations
//         const groupedByDate = {};

//         for (const layer of layers) {
//             const date = layer.AssignDate.toISOString().split('T')[0]; // Extract date part only
//             if (!groupedByDate[date]) {
//                 groupedByDate[date] = { AssignDate: date, Is_Calender_data: false };
//             }

//             // Check if there are annotations for this layer
//             const annotationsCount = await AnnotationModel.count({ where: { LayerID: layer.ID } });
//             if (annotationsCount > 0) {
//                 groupedByDate[date].Is_Calender_data = true;
//             }
//         }

//         // Step 4: Convert grouped data to an array
//         const calendarData = Object.values(groupedByDate);

//         // Step 5: Respond with the unique date data
//         return res.status(200).json(calendarData);

//     } catch (error) {
//         return next(error);
//     }
// }

async function getCalenderProject(req, res, next) {
    const userId = req.user.ID; // Assuming user is authenticated and user ID is available
    const { projectId } = req.body; // Project ID from request body

    try {

        // Step 1: Find all pages associated with the Project ID
        const pages = await PageModel.findAll({
            where: { ProjectID: projectId },
            attributes: ['ID']
        });

        if (!pages.length) {
            return res.status(404).json({ message: 'No pages found for this project' });
        }

        const pageIds = pages.map(page => page.ID);

        // Step 2: Find all layers associated with the found pages
        const layers = await LayerModel.findAll({
            where: { PageID: pageIds },
            attributes: ['ID']
        });

        if (!layers.length) {
            return res.status(404).json({ message: 'No layers found for the pages' });
        }

        const layerIds = layers.map(layer => layer.ID);

        // Step 3: Find annotations associated with these layers and group by AssignDate
        const annotations = await AnnotationModel.findAll({
            where: { LayerID: layerIds },
            attributes: ['AssignDate'],
        });

        // Step 4: Group annotations by AssignDate and determine if there are any annotations
        const groupedByDate = {};

        for (const annotation of annotations) {
            let dateValue = annotation.AssignDate;

            // Ensure AssignDate is a valid Date object
            if (!(dateValue instanceof Date)) {
                dateValue = new Date(dateValue); // Convert to Date object
            }

            const date = dateValue.toISOString().split('T')[0]; // Extract date part only

            if (!groupedByDate[date]) {
                groupedByDate[date] = { AssignDate: date, Is_Calender_data: true }; // Since there is an annotation, Is_Calender_data is true
            }
        }

        console.log('Grouped annotations by date:', groupedByDate);

        // Step 5: Convert grouped data to an array
        const calendarData = Object.values(groupedByDate);

        // Step 6: Respond with the unique date data
        return res.status(200).json(calendarData);

    } catch (error) {
        console.error('Error in getCalenderProject:', error);  // Log the error
        return next(error);  // Pass the error to the error handler middleware
    }
}
// get AllDATA Admin

async function getProjectAllDataAdmin(req, res, next) {
    try {
        const { page = 1, limit, search = '' } = req.query;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);

        // Initialize the whereClause to apply the search functionality
        const whereClause = {};

        // If a search query is provided, add a condition for the 'Name' field
        if (search) {
            whereClause.Name = { [Op.like]: `%${search}%` };
        }

        // Fetch the projects based on the constructed whereClause
        const options = {
            attributes: { exclude: ['Created_at', 'Updated_at'] },
            where: whereClause,
            offset: offset,
            order: [['ID', 'DESC']],
            limit: limit ? parseInt(limit, 10) : null,
        };

        const { count, rows: projects } = await ProjectModel.findAndCountAll(options);

        const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);

        // Return only the list of projects with pagination and search results
        return res.status(200).json({
            data: projects,
            totalPages,
            status: 'success',
            currentPage,
            totalRecords: count
        });
    } catch (error) {
        return next(error);
    }
}
// async function getProjectAllDataWithPagination(req, res, next) {
//     try {
//         const { page = 1, limit, search = '' } = req.query;
//         const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
//         const user = req.user;
//         const userID = user.ID;

//         const whereClause = {
//             UserID: userID
//         };

//         if (search) {
//             whereClause.Name = { [Op.like]: `%${search}%` };
//         }
//         console.log("hii",whereClause)
//         const options = {
//             attributes: { exclude: ['Created_at', 'Updated_at'] },
//             where: whereClause,
//             offset: offset,
//             order: [['ID', 'DESC']],
//             limit: limit ? parseInt(limit, 10) : null,
//         };

//         const { count, rows: projects } = await ProjectModel.findAndCountAll(options);

//         const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
//         const currentPage = parseInt(page, 10);

//         // Map project data to include associated data from BackgroundItems, Pages, Layers, and Calendar
//         const mappedProjects = await Promise.all(projects.map(async project => {
//             const backgroundItems = await BackgroundItemModel.findAll({ where: { ProjectID: project.ID }, attributes: { exclude: ['Created_at', 'Updated_at'] } });
//             const pages = await PageModel.findAll({
//                 where: { ProjectID: project.ID },
//                 attributes: { exclude: ['Created_at', 'Updated_at'] },
//             });

//             const mappedPages = await Promise.all(pages.map(async page => {
//                 const layers = await LayerModel.findAll({ where: { PageID: page.ID }, attributes: { exclude: ['Created_at', 'Updated_at'] } });
//                 const calendar = await CalenderModel.findOne({ where: { PageID: page.ID }, attributes: { exclude: ['Created_at', 'Updated_at'] } });
//                 return {
//                     ...page.toJSON(),
//                     Layers: layers,
//                     Calendar: calendar
//                 };
//             }));

//             return {
//                 ...project.toJSON(),
//                 BackgroundItems: backgroundItems,
//                 Pages: mappedPages
//             };
//         }));

//         return res.status(200).json({ data: mappedProjects, totalPages, status: messages.success.STATUS, currentPage, totalRecords: count });
//     } catch (error) {
//         return next(error);
//     }
// }
// async function getProjectAllDataWithPagination(req, res, next) {
//     try {
//         const { page = 1, limit, search = '' } = req.query;
//         const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
//         const user = req.user;
//         const userID = user.ID;

//         const whereClause = {
//             UserID: userID
//         };

//         if (search) {
//             whereClause.Name = { [Op.like]: `%${search}%` };
//         }
//         console.log("hii",whereClause)
//         const options = {
//             attributes: { exclude: [ 'Updated_at'] },
//             where: whereClause,
//             offset: offset,
//             order: [['ID', 'DESC']],
//             limit: limit ? parseInt(limit, 10) : null,
//         };

//         const { count, rows: projects } = await ProjectModel.findAndCountAll(options);

//         const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
//         const currentPage = parseInt(page, 10);

//         // Map project data to include associated data from BackgroundItems, Pages, Layers, and Calendar
//         const mappedProjects = projects.map(project => ({
//             ID: project.ID,
//             UserID: project.UserID,
//             Name: project.Name,
//             Description: project.Description,
//             Created_at: project.Created_at
//         }));

//         return res.status(200).json({ data: mappedProjects, totalPages, status: messages.success.STATUS, currentPage, totalRecords: count });
//     } catch (error) {
//         return next(error);
//     }
// }

// async function getProjectAllDataWithPagination(req, res, next) {
//     try {
//         const { page = 1, limit, search = '', calendarDate } = req.query; // Added calendarDate query parameter
//         const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
//         const user = req.user;
//         const userID = user.ID;

//         const whereClause = {
//             UserID: userID
//         };

//         if (search) {
//             whereClause.Name = { [Op.like]: `%${search}%` };
//         }

//         const options = {
//             attributes: { exclude: ['Updated_at'] },
//             where: whereClause,
//             offset: offset,
//             order: [['ID', 'DESC']],
//             limit: limit ? parseInt(limit, 10) : null,
//         };

//         const { count, rows: projects } = await ProjectModel.findAndCountAll(options);

//         const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
//         const currentPage = parseInt(page, 10);

//         // Map project data to include associated data from BackgroundItems and Pages
//         const mappedProjects = await Promise.all(projects.map(async project => {
//             const backgroundItems = await BackgroundItemModel.findAll({ where: { ProjectID: project.ID }, attributes: { exclude: ['Created_at', 'Updated_at'] } });
//             const pages = await PageModel.findAll({
//                 where: { ProjectID: project.ID },
//                 attributes: { exclude: ['Created_at', 'Updated_at'] },
//             });

//             // Fetch CalendarDate for the project
//             const calendarDateValue = await getCalendarDate(pages, calendarDate);

//             return {
//                 ID: project.ID,
//                 UserID: project.UserID,
//                 Name: project.Name,
//                 Description: project.Description,
//                 Created_at: project.Created_at,
//                 CalendarDate: calendarDateValue // Assign calendarDateValue directly
//             };
//         }));

//         return res.status(200).json({ data: mappedProjects, totalPages, status: "success", currentPage, totalRecords: count });
//     } catch (error) {
//         return next(error);
//     }
// }

async function getProjectAllDataWithPagination(req, res, next) {
    try {
        const { page = 1, limit, search = '', calendarDate } = req.query;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
        const user = req.user;
        const userID = user.ID;

        // // Fetch projects owned by the user
        // const whereClause = {
        //     UserID: userID
        // };

        // if (search) {
        //     whereClause.Name = { [Op.like]: `%${search}%` };
        // }

        // const projectOptions = {
        //     attributes: { exclude: ['Updated_at'] },
        //     where: whereClause,
        //     order: [['ID', 'DESC']],
        // };

        // const userProjects = await ProjectModel.findAll(projectOptions);



        const userProjects = await ProjectModel.findAll({
            where: {
                UserID: userID,
              [Op.or]: [
                { Name: { [Op.like]: `%${search}%` } }
              ]
            },
            attributes: { exclude: ['Updated_at'] },
            offset,
            limit: parseInt(limit, 10),
            order: [['Created_at', 'DESC']]
          });
          console.log("adminProject",userProjects)

        // Fetch all shares to filter manually
        const allShares = await ShareModel.findAll();

        // Filter shared projects based on user access
        const sharedProjects = allShares.filter(share => {
            let userAccess = [];
            try {
                userAccess = Array.isArray(share.User_access) ? share.User_access : JSON.parse(share.User_access || '[]');
            } catch (error) {
                console.error('Error parsing User_access:', error);
            }
            return userAccess.some(access => access && access.UserID === userID);
        });

        // Extract unique project IDs from shared projects
        const sharedProjectIDs = sharedProjects.map(share => share.ProjectID);

        // Fetch shared projects
        const sharedProjectsData = await ProjectModel.findAll({
            where: {
                ID: sharedProjectIDs,
                [Op.or]: [
                    { Name: { [Op.like]: `%${search}%` } }
                  ]
            }
        });
      

        // Combine user projects and shared projects
        const allProjects = [...userProjects, ...sharedProjectsData];

        // Remove duplicate projects by ID
        const uniqueProjects = Array.from(new Set(allProjects.map(p => p.ID)))
            .map(id => {
                return allProjects.find(p => p.ID === id);
            });

        let paginatedProjects;

        // Apply pagination only if a limit is provided
        if (limit) {
            paginatedProjects = uniqueProjects.slice(offset, offset + parseInt(limit, 10));
        } else {
            paginatedProjects = uniqueProjects; // Return all data if no limit is provided
        }

        // Map project data
        const mappedProjects = await Promise.all(paginatedProjects.map(async project => {
            const backgroundItems = await BackgroundItemModel.findAll({
                where: { ProjectID: project.ID },
                attributes: { exclude: ['Created_at', 'Updated_at'] }
            });
            const pages = await PageModel.findAll({
                where: { ProjectID: project.ID },
                attributes: { exclude: ['Created_at', 'Updated_at'] },
            });

            // Fetch CalendarDate for the project
            const calendarDateValue = await getCalendarDate(pages, calendarDate);

            return {
                ID: project.ID,
                UserID: project.UserID,
                Name: project.Name,
                Description: project.Description,
                Created_at: project.Created_at,
                CalendarDate: calendarDateValue
            };
        }));

        const totalPages = limit ? Math.ceil(uniqueProjects.length / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);

        return res.status(200).json({
            data: mappedProjects,
            totalPages,
            status: "success",
            currentPage,
            totalRecords: uniqueProjects.length
        });
    } catch (error) {
        return next(error);
    }
}






// async function getProjectAllDataWithPagination(req, res, next) {
//     try {
//         const { page = 1, limit, search = '', calendarDate } = req.query;
//         const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
//         const user = req.user;
//         const userID = user.ID;

//         // Fetch projects owned by the user
//         const whereClause = {
//             UserID: userID
//         };

//         if (search) {
//             whereClause.Name = { [Op.like]: `%${search}%` };
//         }

//         const projectOptions = {
//             attributes: { exclude: ['Updated_at'] },
//             where: whereClause,
//             offset: offset,
//             order: [['ID', 'DESC']],
//             limit: limit ? parseInt(limit, 10) : null,
//         };

//         const { count, rows: userProjects } = await ProjectModel.findAndCountAll(projectOptions);

//         // Fetch all shares to filter manually
//         const allShares = await ShareModel.findAll();

//         // Filter shared projects based on user access
//         const sharedProjects = allShares.filter(share => {
//             let userAccess = [];
//             try {
//                 // Check if User_access is a valid JSON array
//                 userAccess = Array.isArray(share.User_access) ? share.User_access : JSON.parse(share.User_access || '[]');
//             } catch (error) {
//                 console.error('Error parsing User_access:', error);
//             }

//             // Check if userAccess is an array and contains objects with UserID
//             return userAccess.some(access => access && access.UserID === userID);
//         });

//         // Extract unique project IDs from shared projects
//         const sharedProjectIDs = sharedProjects.map(share => share.ProjectID);

//         // Fetch shared projects
//         const sharedProjectsData = await ProjectModel.findAll({
//             where: {
//                 ID: sharedProjectIDs
//             }
//         });

//         // Combine user projects and shared projects
//         const allProjects = [...userProjects, ...sharedProjectsData];
//         // Remove duplicate projects by ID
//         const uniqueProjects = Array.from(new Set(allProjects.map(p => p.ID)))
//             .map(id => {
//                 return allProjects.find(p => p.ID === id);
//             });

//         // Map project data
//         const mappedProjects = await Promise.all(uniqueProjects.map(async project => {
//             const backgroundItems = await BackgroundItemModel.findAll({
//                 where: { ProjectID: project.ID },
//                 attributes: { exclude: ['Created_at', 'Updated_at'] }
//             });
//             const pages = await PageModel.findAll({
//                 where: { ProjectID: project.ID },
//                 attributes: { exclude: ['Created_at', 'Updated_at'] },
//             });

//             // Fetch CalendarDate for the project
//             const calendarDateValue = await getCalendarDate(pages, calendarDate);

//             return {
//                 ID: project.ID,
//                 UserID: project.UserID,
//                 Name: project.Name,
//                 Description: project.Description,
//                 Created_at: project.Created_at,
//                 CalendarDate: calendarDateValue // Assign calendarDateValue directly
//             };
//         }));

//         const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
//         const currentPage = parseInt(page, 10);

//         return res.status(200).json({
//             data: mappedProjects,
//             totalPages,
//             status: "success",
//             currentPage,
//             totalRecords: count
//         });
//     } catch (error) {
//         return next(error);
//     }
// }

async function getCalendarDate(pages, calendarDate) {
    let calendarDateValue = null;

    for (const page of pages) {
        if (calendarDate) {
            // If calendarDate is provided, fetch Calendar entry for the specific date
            const calendar = await CalenderModel.findOne({
                where: { PageID: page.ID, Date: calendarDate },
                attributes: { exclude: ['Created_at', 'Updated_at'] }
            });
            if (calendar) {
                calendarDateValue = calendar.Date;
                break; // Break loop once calendar date is found
            }
        } else {
            // Otherwise, fetch any Calendar entry associated with the Page
            const calendar = await CalenderModel.findOne({
                where: { PageID: page.ID },
                attributes: { exclude: ['Created_at', 'Updated_at'] }
            });
            if (calendar) {
                calendarDateValue = calendar.Date;
                break; // Break loop once calendar date is found
            }
        }
    }

    return calendarDateValue;
}


async function getProjectById(req, res, next) {
    try {
        const { projectId } = req.params;

        // Fetch the project based on the project ID
        const project = await ProjectModel.findOne({
            where: { ID: projectId },
            attributes: { exclude: ['Created_at', 'Updated_at'] }, // Exclude created/updated timestamps
        });

        // If project not found, return a 404 error
        if (!project) {
            return res.status(404).json({ messgae: messages.error.PROJECT_NOT_FOUND, status: messages.error.STATUS });
        }

        // Return the project data
        return res.status(200).json({
            data: project,
            status: 'success',
        });
    } catch (error) {
        return next(error);
    }
}

async function deleteProjectById(req, res, next) {
    try {
        const { projectId } = req.params;

        // Fetch the project to ensure it exists
        const project = await ProjectModel.findOne({
            where: { ID: projectId }
        });

        // If project not found, return a 404 error
        if (!project) {
            return res.status(404).json({ messgae: messages.error.PROJECT_NOT_FOUND, status: messages.error.STATUS });
        }

        // Delete the project
        await ProjectModel.destroy({
            where: { ID: projectId }
        });

        // Return a success response
        return res.status(200).json({
            message: messages.success.PROJECT_DELETED,
            status: messages.success.STATUS,
        });
    } catch (error) {
        return next(error);
    }
}


async function getUserOrganizationAllProject(req, res, next) {
    const { UserID } = req.body;
  
    try {
  
      const { page = 1, limit = 100000000000, search = '' } = req.query;
      const offset = (page - 1);
      const loginUser = req.user; // Assuming loginUser contains logged-in user information
  
      // Step 1: Fetch logged-in user's data
      const user = await UserModel.findOne({
        where: { ID: UserID },
        attributes: ['ID', 'User_type']
      });
  
      if (!user) {
        return res.status(200).json({ projects: [] });
      }
  
      if (user.User_type === 1) {
            // Fetch projects created by the user
            const userProjects = await ProjectModel.findAll({
              where: { UserID: user.ID },
            });
          
            // Fetch shared projects by checking the User_access JSON field
            const sharedProjects = await ShareModel.findAll({
              where: Sequelize.literal(`JSON_EXTRACT(User_access, '$[*].userID') LIKE '%${user.ID}%'`)
            });
          
            // Extract ProjectIDs from the matching records
            const sharedProjectIDs = sharedProjects
              .filter((sp) => 
                sp.User_access.some((access) => access.userID === user.ID) // Match userID inside JSON
              )
              .map((sp) => sp.ProjectID);
          
            // Fetch details of the shared projects
            const sharedProjectDetails = await ProjectModel.findAll({
              where: { ID: { [Op.in]: sharedProjectIDs } },
            });
          
            // Combine user projects and shared projects
            const combinedProjects = [...userProjects, ...sharedProjectDetails];
          
            // Remove duplicate projects by ID
            const uniqueProjects = Array.from(
              new Set(combinedProjects.map((p) => p.ID))
            ).map((id) => combinedProjects.find((p) => p.ID === id));
          
          
  
            return res.status(200).json({ projects: uniqueProjects });
      } 
      else if (user.User_type === 2) {
        // Step 1: Find the organization the user is associated with
        const organization = await OrganizationModel.findOne({
          where: { UserID: user.ID, Is_deleted: false },
          attributes: ['ID']
        });
  
        if (!organization) {
          return res.status(200).json({ projects: [] });
        }
  
        // Step 2: Get the OrganizationID
        const organizationId = organization.ID;
  
        // Step 3: Fetch all UserIDs associated with the OrganizationID
        const organizationUserRelations = await OrganizationUserRelationModel.findAll({
          where: { OrganizationID: organizationId, Is_deleted: false },
          attributes: ['UserID']
        });
  
        const organizationUserIds = organizationUserRelations.map(rel => rel.UserID);
  
        // Step 4: Fetch all projects associated with these UserIDs
        const organizationProjects = await ProjectModel.findAll({
          where: {
            UserID: { [Op.in]: organizationUserIds }, // Matching UserIDs from organizations
            Name: { [Op.like]: `%${search}%` } // Optional search filter
          },
          attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
          order: [['Created_at', 'DESC']],
          offset,
          limit: parseInt(limit, 10),
        });
  
        // Step 5: Fetch projects created by the logged-in user
        const userProjects = await ProjectModel.findAll({
          where: {
            UserID: user.ID, // Match the logged-in user's ID
            Name: { [Op.like]: `%${search}%` } // Optional search filter
          },
          attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
          order: [['Created_at', 'DESC']],
          offset,
          limit: parseInt(limit, 10),
        });
  
        // Step 6: Combine both project lists
        const combinedProjects = [...organizationProjects, ...userProjects];
  
        // Step 7: Get total project count for pagination
        const totalRecords = await ProjectModel.count({
          where: {
            [Op.or]: [
              { UserID: { [Op.in]: organizationUserIds } },
              { UserID: user.ID }
            ],
            Name: { [Op.like]: `%${search}%` } // Optional search filter
          }
        });
  
        const totalPages = Math.ceil(totalRecords / parseInt(limit, 10));
        const currentPage = parseInt(page, 10);
  
        // Step 8: Return the response with the list of combined projects and pagination
        return res.status(200).json({
          projects: combinedProjects,
          totalPages,
          currentPage,
          totalRecords,
        });
      } else {
        return res.status(400).json({ message: "Invalid UserType." });
      }
  
    //   // Remove duplicate projects by ID
    //   const uniqueProjects = Array.from(
    //     new Set(projectList.map((p) => p.ID))
    //   ).map((id) => projectList.find((p) => p.ID === id));
  
    //   return res.status(200).json({ projects: uniqueProjects });
    } catch (error) {
      return next(error);
    }
  }
  
  



module.exports = {
    addProject,
    deleteProject,
    getProjectAllDataWithPagination,
    getProjectDataByDate,
    updateProjectDataById,
    getProjectByID,
    getCalenderProject,
    getProjectDataByDateForPrint,
    getProjectAllDataAdmin,
    getProjectById,
    deleteProjectById,
    getUserOrganizationAllProject
};
