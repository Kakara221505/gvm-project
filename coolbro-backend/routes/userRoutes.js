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

router.get('/', authenticate, userController.getUsers);
router.get('/:id', authenticate, authorize(['admin', 'user']), userController.getUserById);
router.post('/', authenticate, userController.createUser);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router;