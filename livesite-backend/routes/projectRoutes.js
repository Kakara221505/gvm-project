const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSingle} = require('../middlewares/upload');



router.post('/add_project',authenticate,authorize(['admin', 'user','organization']),projectController.addProject);
router.post('/projectById', authenticate, authorize(['admin','organization', 'user']), projectController.getProjectDataByDate);
router.post('/annotationsByPageId', authenticate, authorize(['admin','organization', 'user']), projectController.getProjectDataByDateForPrint);
router.post('/openProjectById', authenticate, authorize(['admin','organization', 'user']), projectController.getProjectByID);
router.put('/updateProjectById',authenticate, authorize(['admin','organization', 'user']), projectController.updateProjectDataById);
router.get('/get_project_with_pagination',authenticate,authorize(['user','organization','admin']),projectController.getProjectAllDataAdmin);
router.get('/get_project_all_data',authenticate,authorize(['admin', 'user','organization']),projectController.getProjectAllDataWithPagination);
router.delete('/:id', authenticate,authorize(['admin','organization','user']), projectController.deleteProject);
router.post('/allUserOrganizationProject', authenticate, authorize(['organization','admin','user']), projectController.getUserOrganizationAllProject);
router.post('/get_calender_annotation_data', authenticate,authorize(['admin','organization','user']), projectController.getCalenderProject);

router.get('/:projectId', authenticate,authorize(['admin','organization','user']), projectController.getProjectById);

module.exports = router;