import React, { useState, useEffect } from 'react';
import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getTemplateById, updateTemplate } from '../../services/templateService';

function EditTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ form_name: '', description: '', json_schema_text: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const data = await getTemplateById(id);
        setFormData({
          form_name: data.formName || data.form_name || '',
          description: data.description || '',
          json_schema_text: JSON.stringify(data.formSchema || data.json_schema, null, 2)
        });
      } catch (err) {
        setError('Failed to load template');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    let parsedSchema;

    try {
      parsedSchema = JSON.parse(formData.json_schema_text);
      if (!Array.isArray(parsedSchema)) {
        throw new Error('Invalid JSON');
      }
    } catch {
      setError('Invalid JSON');
      return;
    }

    setSaving(true);

    try {
      await updateTemplate(id, {
        formName: formData.form_name,
        description: formData.description,
        formSchema: parsedSchema,
      });

      setSuccess('Template updated successfully! It has been reset to Draft status and needs re-approval.');
      setTimeout(() => {
        navigate('/admin/view-templates');
      }, 2500);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Form Template
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, mt: 4 }}>
          <TextField
            label="Form Name"
            name="form_name"
            value={formData.form_name}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="JSON Schema"
            name="json_schema_text"
            value={formData.json_schema_text}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={10}
            InputProps={{
              sx: { fontFamily: 'monospace' },
            }}
          />

          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/admin/view-templates')}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

export default EditTemplate;
