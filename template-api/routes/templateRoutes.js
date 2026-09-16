const express = require('express');
const templateController = require('../controllers/templateController');

const router = express.Router();

router.post('/', templateController.createTemplate);
router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplateById);
router.delete('/:id', templateController.deleteTemplate);

module.exports = router;