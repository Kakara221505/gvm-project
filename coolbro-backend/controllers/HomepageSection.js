const HomeSectionModel = require('../models/HomePageSection');
const messages = require('../utils/messages');
const { Op } = require('sequelize');


// Function to add a new record
async function addHomePageSections(req, res, next) {
  // #swagger.tags = ['Home_Page_Sections']
  // #swagger.description = 'Add Home Page Sections'

  try {
    const { Section_name, Display_name, Status, Order, Is_app, Is_web } = req.body;

    // Add a new record
    const newRecord = await HomeSectionModel.create({
      Section_name,
      Display_name,
      Status,
      Order,
      Is_app,
      Is_web
    });

    return res.status(201).json({
      messages: messages.success.Home_Page_Section_add,
      data: newRecord,
    });
  } catch (error) {
    next(error);
  }
}

// Function to update an existing record
async function updateHomePageSections(req, res, next) {
  // #swagger.tags = ['Home_page_section']
  // #swagger.description = 'Update Home page section'

  try {
    const id = req.params.id;
    const { Section_name, Display_name, Status, Order, Is_app, Is_web } = req.body;

    // If id is not present
    if (!id) {
      return res.status(400).json({ messages: messages.error.Id_not_found, status: messages.error.STATUS });
    }

    // Update the existing record
    const existingRecord = await HomeSectionModel.findByPk(id);

    if (!existingRecord) {
      return res.status(404).json({ messages: messages.error.No_record, status: messages.error.STATUS });
    }

    await existingRecord.update({
      Section_name,
      Display_name,
      Status,
      Order,
      Is_app,
      Is_web
    });

    return res.status(200).json({ messages: messages.success.Home_Page_Section_updated });
  } catch (error) {
    next(error);
  }
}
//delete the home section
async function deleteHomePageSections(req, res, next) {
  try {
    const { id } = req.params;
    const homeSection = await HomeSectionModel.findByPk(id);

    if (homeSection) {
      await homeSection.destroy();
      return res.status(200).json({ messages: messages.success.Home_Page_Section_deleted });
    } else {
      return res.status(404).json({ messages: messages.error.Home_section_not_found, status: messages.error.STATUS });
    }
  } catch (error) {
    next(error);
  }
}

// get All 
async function getAllHomePageSections(req, res, next) {
  try {
    const homeSections = await HomeSectionModel.findAll();

    return res.status(200).json({ data: homeSections, messages: messages.success.Home_Page_Section_getAll });
  } catch (error) {
    next(error);
  }
}


module.exports = {
  addHomePageSections,
  updateHomePageSections,
  deleteHomePageSections,
  getAllHomePageSections
}
