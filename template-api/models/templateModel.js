const { query } = require('../config/db');

function parseJsonSchema(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
}

async function createTemplate({ formName, description, jsonSchema, createdBy }) {
  const result = await query(
    'INSERT INTO form_templates (form_name, description, json_schema, created_by) VALUES (?, ?, ?, ?)',
    [formName, description || null, JSON.stringify(jsonSchema), createdBy]
  );

  return result.insertId;
}

async function getTemplates() {
  const rows = await query(
    'SELECT id, form_name, description, json_schema, created_by, created_at FROM form_templates ORDER BY id DESC'
  );

  return rows.map((template) => {
    const parsedSchema = parseJsonSchema(template.json_schema);

    return {
      ...template,
      json_schema: parsedSchema,
      form_schema: parsedSchema,
    };
  });
}

async function getTemplateById(id) {
  const rows = await query(
    'SELECT id, form_name, description, json_schema, created_by, created_at FROM form_templates WHERE id = ? LIMIT 1',
    [id]
  );

  if (!rows.length) {
    return null;
  }

  const template = rows[0];
  const parsedSchema = parseJsonSchema(template.json_schema);

  return {
    ...template,
    json_schema: parsedSchema,
    form_schema: parsedSchema,
  };
}

async function deleteTemplate(id) {
  const result = await query('DELETE FROM form_templates WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  deleteTemplate,
};