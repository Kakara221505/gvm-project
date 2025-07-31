const express = require('express');
const commonController = require('../controllers/commonController'); 

const router = express.Router();

router.post('/get_details_from_zipcode', commonController.getDetailsOfZipCode);
router.post('/get_zipcode_details_from_latlong', commonController.getZipcodeAndAreaFromLatLong);
router.get('/get_log', commonController.getLogDetails);

module.exports = router;