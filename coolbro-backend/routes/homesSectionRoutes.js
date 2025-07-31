const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const HomePageSection = require('../controllers/HomepageSection');

router.post('/homepagesection_add', authenticate, authorize(['admin', 'user']), HomePageSection.addHomePageSections);
router.put('/homepagesection_update/:id', authenticate, authorize(['admin', 'user']), HomePageSection.updateHomePageSections);
router.delete('/homepagesection_delete/:id', authenticate, authorize(['admin', 'user']), HomePageSection.deleteHomePageSections);
router.get('/homepagesection_all',HomePageSection.getAllHomePageSections);

module.exports = router;