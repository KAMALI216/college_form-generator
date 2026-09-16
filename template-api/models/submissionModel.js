const { query } = require('../config/db');

function parseSubmission(value) {
  if (value == null) {
    return value;
  }

  if (typeof value === 'string') {
    return JSON.parse(value);
  }

  return value;
}

async function createSubmission({ formId, userId, submission }) {
  const result = await query(
    'INSERT INTO form_submissions (form_id, user_id, submission) VALUES (?, ?, ?)',
    [formId, userId, JSON.stringify(submission)]
  );

  const rows = await query(
    'SELECT id, submitted_at FROM form_submissions WHERE id = ? LIMIT 1',
    [result.insertId]
  );

  return rows[0] || { id: result.insertId, submitted_at: null };
}

async function getSubmissionsByFormId(formId) {
  return query(
    'SELECT id, form_id, user_id, submission, submitted_at FROM form_submissions WHERE form_id = ? ORDER BY id DESC',
    [formId]
  );
}

async function getMySubmissions(userId) {
  const rows = await query(
    `SELECT fs.id, fs.form_id, ft.form_name, fs.submission, fs.submitted_at
     FROM form_submissions fs
     INNER JOIN form_templates ft ON ft.id = fs.form_id
     WHERE fs.user_id = ?
     ORDER BY fs.submitted_at DESC`,
    [userId]
  );

  return rows.map((row) => ({
    ...row,
    submission: parseSubmission(row.submission),
  }));
}

module.exports = {
  createSubmission,
  getSubmissionsByFormId,
  getMySubmissions,
};