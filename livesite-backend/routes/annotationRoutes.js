const express = require('express');
const router = express.Router();
const annotationController = require('../controllers/annotationController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');


// annotaion routes
router.post('/add_annotation',authenticate,authorize(['admin', 'user','organization']),annotationController.addAnnotation);
router.put('/update_annotation',authenticate,authorize(['admin', 'user','organization']),annotationController.updateAnnotation);
router.get('/get_annotation_with_pagination',authenticate,authorize(['admin','user','organization']),annotationController.getAnnotationAllDataWithPagination);
router.get('/:id', authenticate, authorize(['admin', 'user','organization']), annotationController.getAnnotationById);
router.delete('/:id', authenticate,authorize(['admin','organization','user']), annotationController.deleteAnnotation);
router.post('/paste_annotation', authenticate,authorize(['admin','organization','user']), annotationController.pasteAnnotation);
router.post('/select_paste_annotation', authenticate,authorize(['admin','organization','user']), annotationController.selectPasteAnnotation);
router.post('/get_select_paste_annotation', authenticate,authorize(['admin','organization','user']), annotationController.getSelectPasteAnnotation);
router.post('/paste_comment_annotation', authenticate,authorize(['admin','organization','user']), annotationController.pasteCommentAnnotation);

module.exports = router;