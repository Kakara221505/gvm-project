const express = require('express');
const router = express.Router();
const termsConditionController = require('../controllers/termsConditionController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');



router.post('/add_update_terms_Condition',authenticate,authorize(['admin', 'user','organization']),termsConditionController.addUpdateTermsAndCondition);
router.get('/get_terms_Condition',authenticate,authorize(['admin','organization','user']),termsConditionController.getTermsCondition);



module.exports = router;