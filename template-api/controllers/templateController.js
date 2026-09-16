const templateModel = require('../models/templateModel');
const adminModel = require('../models/adminModel');

function normalizeJsonSchema(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return JSON.parse(value);
  }

  return value;
}

function validateTemplatePayload(body) {
  if (!body || !body.form_name || !String(body.form_name).trim()) {
    return 'form_name is required';
  }

  const schemaValue = body.form_schema !== undefined ? body.form_schema : body.json_schema;

  if (schemaValue === undefined || schemaValue === null) {
    return 'form_schema is required';
  }

  try {
    const parsed = normalizeJsonSchema(schemaValue);

    if (!Array.isArray(parsed)) {
      return 'form_schema must be an array';
    }
  } catch {
    return 'form_schema must be valid JSON array';
  }

  return null;
}

async function createTemplate(req, res) {
  try {
    const validationError = validateTemplatePayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const admin = await adminModel.findAdminByUsername(adminUsername);

    if (!admin) {
      return res.status(500).json({ message: 'Admin account is not seeded' });
    }

    await templateModel.createTemplate({
      formName: String(req.body.form_name).trim(),
      description: req.body.description || null,
      jsonSchema: normalizeJsonSchema(req.body.form_schema !== undefined ? req.body.form_schema : req.body.json_schema),
      createdBy: admin.id,
    });

    return res.status(201).json({ message: 'Template Created' });
  } catch (error) {
    console.error('createTemplate error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function getTemplates(req, res) {
  try {
    const templates = await templateModel.getTemplates();
    return res.status(200).json(templates);
  } catch (error) {
    console.error('getTemplates error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function getTemplateById(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid template id' });
    }

    const template = await templateModel.getTemplateById(id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    return res.status(200).json(template);
  } catch (error) {
    console.error('getTemplateById error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function deleteTemplate(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid template id' });
    }

    const affectedRows = await templateModel.deleteTemplate(id);

    if (!affectedRows) {
      return res.status(404).json({ message: 'Template not found' });
    }

    return res.status(200).json({ message: 'Template Deleted' });
  } catch (error) {
    console.error('deleteTemplate error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  deleteTemplate,
};