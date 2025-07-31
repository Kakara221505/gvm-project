const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSingleProfile} = require('../middlewares/upload');

router.get('/getAllOrganization', authenticate,authorize(['admin','user', 'organization']), organizationController.getAllOrganization);

// router.get('/:id', authenticate, authorize(['admin', 'user', 'organization']), userController.getUserById);

router.put('/:id', authenticate,uploadSingleProfile, organizationController.updateOrganization);

router.get('/project/getAllOwnProject', authenticate, organizationController.getAllOwnProject);
router.get('/project/getAllOrganizationProject', authenticate, organizationController.getAllOrganizationProject);
router.get('/project/getAllAccessableProject', authenticate, organizationController.getAllAccessableProject);
router.delete('/:id', authenticate, organizationController.deleteOrganization);
router.post('/add-organization', authenticate, organizationController.addOrganization);
router.get('/:id', authenticate,authorize(['admin', 'organization','user']), organizationController.getOrganizationById);

module.exports = router;