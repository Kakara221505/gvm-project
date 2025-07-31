const express = require('express');
const router = express.Router();
const layerController = require('../controllers/layerController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSingle} = require('../middlewares/upload');



router.post('/add_update_layer',authenticate,authorize(['admin', 'user','organization']),layerController.addUpdateLayer);
router.post('/add_update_layer_annotation',authenticate,authorize(['admin', 'user','organization']),layerController.addUpdateLayerAnnotation);
router.post('/merge-layer', authenticate, authorize(['admin', 'organization','user']), layerController.mergeLayer);
router.get('/get_layer_all_data',authenticate,authorize(['admin','organization','user']),layerController.getLayerAllDataWithPagination);
router.get('/:id', authenticate, authorize(['admin', 'organization','user']), layerController.getLayerById);
router.delete('/:id', authenticate,authorize(['admin','organization','user']), layerController.deleteLayer);
router.put('/group',authenticate,authorize(['admin', 'user','organization']),layerController.groupLayer);
router.put('/ungroup',authenticate,authorize(['admin', 'user','organization']),layerController.ungroupLayer);
router.post('/get_layer_all_data_by_page_id',authenticate,authorize(['admin','organization','user']),layerController.getLayerAllDataByPageId);
router.post('/get_layer_by_date',authenticate,authorize(['admin','organization','user']),layerController.getLayerByDate);

module.exports = router;