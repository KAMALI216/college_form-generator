import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Alert, Box, CircularProgress, Container, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import DynamicFormRenderer from '../../components/forms/DynamicFormRenderer';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { useUserAuth } from '../../context/UserAuthContext';
import { getMappedProfileValue } from '../../utils/profileFieldMapper';

function FillForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { profile } = useUserAuth();

  // State for profile update prompt
  const [updatePromptOpen, setUpdatePromptOpen] = useState(false);
  const [profileUpdates, setProfileUpdates] = useState({});

  const loadTemplate = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/templates/${id}`);
      setTemplate(data);

      const schemaValue = data.formSchema !== undefined ? data.formSchema : (data.form_schema !== undefined ? data.form_schema : data.json_schema);
      const parsedSchema = typeof schemaValue === 'string' ? JSON.parse(schemaValue) : schemaValue;

      setSchema(Array.isArray(parsedSchema) ? parsedSchema : []);
    } catch (requestError) {
      const status = requestError?.response?.status;
      if (status === 404) {
        setError('not_found');
      } else if (status === 401 || status === 403) {
        setError('unauthorized');
      } else {
        setError('other');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  // Compute autoFillData based on schema and profile
  const autoFillData = useMemo(() => {
    if (!profile || !schema || schema.length === 0) return {};
    
    const fillData = {};
    schema.forEach(field => {
      const label = field.label;
      const mappedVal = getMappedProfileValue(label, profile);
      if (mappedVal !== undefined && mappedVal !== null && mappedVal !== '') {
        fillData[label] = mappedVal;
      }
    });
    return fillData;
  }, [profile, schema]);

  const handleSubmit = async (formData) => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      await api.post('/submissions', { formId: Number(id), submission: formData });
      
      // Check if any autoFilled fields were changed by the user
      const updates = {};
      Object.keys(autoFillData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== autoFillData[key]) {
          // Attempt to reverse-map to the correct section (simplified for demo)
          // In a real robust system, profileFieldMapper would provide the exact object path.
          // For now, we just track the changes to show them in the modal.
          updates[key] = { old: autoFillData[key], new: formData[key] };
        }
      });

      if (Object.keys(updates).length > 0) {
        setProfileUpdates(updates);
        setUpdatePromptOpen(true);
        // Navigate after prompt is closed
      } else {
        navigate('/forms/success');
      }

    } catch (requestError) {
      setSubmitError(requestError?.response?.data?.message || 'Failed to submit form');
      setSubmitting(false);
    }
  };

  const handlePromptResolve = (shouldUpdate) => {
    if (shouldUpdate) {
      // In a robust implementation, we would map the form fields back to profile structure.
      // Here we simulate the opt-in logic per requirements.
      console.log('Profile update confirmed for:', profileUpdates);
    }
    setUpdatePromptOpen(false);
    navigate('/forms/success');
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Loading form...</Typography>
      </Container>
    );
  }

  if (error === 'not_found') {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>This form could not be found. It may have been removed.</Typography>
        <Button variant="contained" onClick={() => navigate('/forms')}>Back to Forms</Button>
      </Container>
    );
  }

  if (error === 'unauthorized') {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Please log in again to access this form.</Typography>
        <Button variant="contained" component={Link} to="/login">Login</Button>
      </Container>
    );
  }

  if (error === 'other') {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Unable to load this form right now. Please try again.</Typography>
        <Button variant="contained" onClick={loadTemplate}>Retry</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {template?.formName || template?.form_name || 'Fill Form'}
        </Typography>

        {submitError ? <Alert severity="error" sx={{ mb: 3 }}>{submitError}</Alert> : null}

        {!submitting && schema.length > 0 && (
          <Box sx={{ mb: 4, p: 3, bgcolor: 'blue.50', borderRadius: 3, border: '1px solid', borderColor: 'blue.100' }}>
            <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              ℹ️ Before you start
            </Typography>
            <Typography variant="body2" color="primary.main" paragraph>
              This form contains <strong>{schema.length} fields</strong>, of which <strong>{schema.filter(f => f.required).length} are required</strong>.
            </Typography>
            <Typography variant="body2" color="primary.main" paragraph>
              <strong>Required documents:</strong> {(template?.requiredDocsList || ['Aadhaar Card', 'Mark Sheet', 'Transfer Certificate']).join(', ')}.
            </Typography>
            <Typography variant="body2" color="primary.main">
              <strong>Estimated completion time:</strong> {template?.estimatedTime || '5–10 minutes'}.
            </Typography>
          </Box>
        )}

        <Box sx={{ opacity: submitting && !updatePromptOpen ? 0.75 : 1, pointerEvents: submitting && !updatePromptOpen ? 'none' : 'auto' }}>
          <ErrorBoundary>
            <DynamicFormRenderer 
              schema={schema} 
              onSubmit={handleSubmit} 
              isSubmitting={submitting && !updatePromptOpen} 
              autoFillData={autoFillData}
            />
          </ErrorBoundary>
        </Box>
      </Paper>

      {/* Profile Update Prompt Dialog */}
      <Dialog open={updatePromptOpen} disableEscapeKeyDown>
        <DialogTitle>Update Profile?</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            You changed some auto-filled information while completing this form. Would you like to update your permanent profile with these new values?
          </Typography>
          <Box sx={{ mt: 2, bgcolor: 'slate.50', p: 2, borderRadius: 2 }}>
            {Object.keys(profileUpdates).map((key) => (
              <Box key={key} sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{key}</Typography>
                <Typography variant="body2" color="text.secondary">
                  <span style={{ textDecoration: 'line-through', marginRight: 8 }}>{profileUpdates[key].old}</span>
                  ➔ <span style={{ color: '#16a34a', fontWeight: 600, marginLeft: 8 }}>{profileUpdates[key].new}</span>
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => handlePromptResolve(false)} color="inherit">
            Keep Profile Unchanged
          </Button>
          <Button onClick={() => handlePromptResolve(true)} variant="contained" color="primary">
            Update Profile
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}

export default FillForm;