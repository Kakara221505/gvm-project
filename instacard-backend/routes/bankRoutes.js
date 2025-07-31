const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');

const authorization = require('../middlewares/authorize');
const authenticate = require('../middlewares/authenticate');

router.post('/add', authenticate, bankController.createBankDetails);
// router.get('/get-all', bankController.);
router.get('/get-by-id',bankController.getBankDetails);
router.put('/update' ,bankController.updateBankDetails);
router.delete('/delete', bankController.deleteBankDetails);
module.exports = router;
