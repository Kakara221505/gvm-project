const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

/*router.get('/', authenticate, authorize(['admin']), userController.getUsers);
router.get('/:id', authenticate, authorize(['admin', 'user']), userController.getUserById);
router.post('/', authenticate, authorize(['admin']), userController.createUser);
router.put('/:id', authenticate, authorize(['admin', 'user']), userController.updateUser);
router.delete('/:id', authenticate, authorize(['admin']), userController.deleteUser);*/

router.post('/add_user', authenticate, authorize(['organization','admin','user']), userController.addUser);
router.get('/getAllUser',authorize (['organization','admin','user']), authenticate, userController.getUsers);
router.put('/profile/:id', authenticate, userController.updateUserProfile);
router.get('/getAllUserAdmin',authorize(['organization','admin','user']), authenticate, userController.getAllUsers);
router.get('/getAllUserListShare',authorize(['organization','admin','user']), authenticate, userController.getUsersListShare);
router.get('/:id', authenticate, authorize(['organization','admin','user']), userController.getUserById);
// router.get('/:id', authenticate, authorize(['admin', 'user', 'organization']), userController.getUserById);

router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);
router.post('/admin_add_user', authenticate, authorize(['organization','admin','user']), userController.adminAddUser);
router.get('/count/project_user_oragnization_count', authenticate, authorize(['organization','admin','user']), userController.getAllProjectUserOrganizationData);

module.exports = router;