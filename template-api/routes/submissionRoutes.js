const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const submissionController = require('../controllers/submissionController');

const router = express.Router();

router.post('/', verifyUser, submissionController.createSubmission);
router.get('/my', verifyUser, submissionController.getMySubmissions);
router.get(
  '/:formId',
  authMiddleware,
  roleMiddleware('ADMIN'),
  submissionController.getSubmissionsByFormId
);

module.exports = router;