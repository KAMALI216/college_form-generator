const templateModel = require('../models/templateModel');
const submissionModel = require('../models/submissionModel');

function parseSubmissionData(value) {
  if (typeof value === 'string') {
    return JSON.parse(value);
  }

  return value;
}

async function createSubmission(req, res) {
  try {
    const { form_id, submission } = req.body || {};

    if (!form_id || submission === undefined || submission === null) {
      return res.status(400).json({ message: 'form_id and submission are required' });
    }

    const formId = Number(form_id);

    if (!Number.isInteger(formId) || formId <= 0) {
      return res.status(400).json({ message: 'form_id must be a valid number' });
    }

    const templateExists = await templateModel.templateExists(formId);

    if (!templateExists) {
      return res.status(404).json({ message: 'Template not found' });
    }

    let parsedSubmissionData;

    try {
      parsedSubmissionData = parseSubmissionData(submission);
    } catch {
      return res.status(400).json({ message: 'submission must be valid JSON' });
    }

    const createdSubmission = await submissionModel.createSubmission({
      formId,
      userId: req.user.id,
      submission: parsedSubmissionData,
    });

    return res.status(201).json(createdSubmission);
  } catch (error) {
    console.error('createSubmission error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function getMySubmissions(req, res) {
  try {
    const submissions = await submissionModel.getMySubmissions(req.user.id);
    return res.status(200).json(submissions);
  } catch (error) {
    console.error('getMySubmissions error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function getSubmissionsByFormId(req, res) {
  try {
    const formId = Number(req.params.formId);

    if (!Number.isInteger(formId) || formId <= 0) {
      return res.status(400).json({ message: 'Invalid form id' });
    }

    const templateExists = await templateModel.templateExists(formId);

    if (!templateExists) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const submissions = await submissionModel.getSubmissionsByFormId(formId);
    return res.status(200).json(submissions);
  } catch (error) {
    console.error('getSubmissionsByFormId error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  createSubmission,
  getSubmissionsByFormId,
  getMySubmissions,
};