const DesignationModel = require("../models/DesignationMaster");
const EmployeeModel = require("../models/Employee");
const messages = require("../utils/messages");
const { UserRole } = require("../utils/commonFunctions");

// Middleware to check admin role
function isAdmin(employee) {
  return employee.Role === parseInt(UserRole.ADMIN, 10);
}

// Add designation (Only Admin)
async function designationAdd(req, res, next) {
  try {
    const employee = await EmployeeModel.findById(req.user.id);
    if (!employee || !isAdmin(employee)) {
      return res.status(403).json({
        message: messages.error.UNAUTHORIZED_ACCESS,
      });
    }

    const { Designation_Name } = req.body; // Replace fields based on your schema
    const isDesignationExist = await DesignationModel.findOne({
      Designation_Name,
    });
    if (isDesignationExist) {
      return res.status(400).json({
        message: "Designation already exists!",
      });
    }
    const newdesignation = new DesignationModel({
      Designation_Name,
    });

    await newdesignation.save();

    return res.status(200).json({
      message: messages.success.DESIGNATION_CREATED,
      data: newdesignation,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Get All designation

async function getAlldesignationData(req, res, next) {
  try {
    // Get pagination and search query parameters
    const { page = 1, limit = 10, search = "" } = req.query;

    // Query to find designations with optional search functionality
    const query = {
      $or: [
        { Designation_Name: { $regex: search, $options: "i" } }, // Case-insensitive search on designation_Name
      ],
    };

    // Get total number of records for pagination
    const totalRecords = await DesignationModel.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit); // Calculate total pages

    // Fetch the designations with pagination
    const designations = await DesignationModel.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ Created_at: 1 }); // Sort by Date descending

    // If no designations are found, return an empty list
    if (!designations.length) {
      return res.status(200).json({
        data: [],
      });
    }

    // Return the designations with pagination info
    return res.status(200).json({
      data: designations,
      totalRecords,
      totalPages,
      currentPage: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Get designation by ID (Visible to all employees)
async function getdesignationById(req, res, next) {
  try {
    const { id } = req.params;
    const designation = await DesignationModel.findById(id);

    if (!designation) {
      return res.status(404).json({
        message: messages.error.DESIGNATION_NOT_FOUND,
      });
    }

    return res.status(200).json({
      data: designation,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Update designation by ID (Only Admin)
async function updatedesignation(req, res, next) {
  try {
    const employee = await EmployeeModel.findById(req.user.id);
    if (!employee || !isAdmin(employee)) {
      return res.status(403).json({
        message: messages.error.UNAUTHORIZED_ACCESS,
      });
    }

    const { id } = req.params;
    const { Designation_Name } = req.body; // Rename Date to designationDate
    const designation = await DesignationModel.findById(id);

    if (!designation) {
      return res.status(404).json({
        message: messages.error.DESIGNATION_NOT_FOUND,
      });
    }

    if (designation.Designation_Name !== Designation_Name) {
      const isDesignationExist = await DesignationModel.findOne({
        Designation_Name,
      });
      if (isDesignationExist) {
        return res.status(400).json({
          message: "Designation already exists!",
        });
      }
    }

    if (Designation_Name) designation.Designation_Name = Designation_Name;
    designation.Updated_at = new Date();

    await designation.save();

    return res.status(200).json({
      message: messages.success.DESIGNATION_UPDATED,
      data: designation,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// Delete designation by ID (Only Admin)
async function deletedesignation(req, res, next) {
  try {
    const employee = await EmployeeModel.findById(req.user.id);
    if (!employee || !isAdmin(employee)) {
      return res.status(403).json({
        message: messages.error.UNAUTHORIZED_ACCESS,
      });
    }

    const { id } = req.params;
    const deleteddesignation = await DesignationModel.findByIdAndDelete(id);

    if (!deleteddesignation) {
      return res.status(404).json({
        message: messages.error.DESIGNATION_NOT_FOUND,
      });
    }

    return res.status(200).json({
      message: messages.success.DESIGNATION_DELETED,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

module.exports = {
  designationAdd,
  getAlldesignationData,
  getdesignationById,
  updatedesignation,
  deletedesignation,
};
