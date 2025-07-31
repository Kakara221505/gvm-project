const express = require('express');
const router = express.Router();
const collaborationPermissonController = require('../controllers/collaborationPermissionController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');



router.post('/add_update_collaborationpermission',authenticate,authorize(['admin', 'user','organization']),collaborationPermissonController.addUpdateCollaborationPermission);
router.get('/get_collaborationpermission_with_pagination',authenticate,authorize(['admin','user','organization']),collaborationPermissonController.getCollaborationPermissionAllDataWithPagination);
router.get('/:id', authenticate, authorize(['admin', 'user','organization']), collaborationPermissonController.getCollaborationPermissionById);
router.delete('/:id', authenticate,authorize(['admin','user','organization']), collaborationPermissonController.deleteCollaborationPermission);

module.exports = router;