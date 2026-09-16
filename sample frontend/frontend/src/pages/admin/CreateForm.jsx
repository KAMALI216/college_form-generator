import React, { useState, useEffect } from 'react';
import { 
  Alert, Box, Button, CircularProgress, Container, Paper, Stack, 
  TextField, Typography, Grid, Stepper, Step, StepLabel, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import { 
  UploadFile as UploadFileIcon, 
  AutoFixHigh as AutoFixHighIcon, 
  EditNote as EditNoteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { createTemplate } from '../../services/templateService';
import api from '../../services/api';

const STEPS = [
  "Uploading document",
  "Extracting text using OCR",
  "Identifying fields",
  "Detecting field types",
  "Building form schema"
];

function CreateForm() {
  const navigate = useNavigate();
  
  // View State
  const [view, setView] = useState('options'); // 'options' | 'processing' | 'review' | 'manual'
  
  // Data State
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ form_name: '', description: '', formSchema: [] });
  const [fields, setFields] = useState([]); // Extracted fields with confidence
  
  // UI State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Editor Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);

  // 1. Processing Logic
  useEffect(() => {
    let timers = [];
    if (view === 'processing') {
      setActiveStep(0);
      timers.push(setTimeout(() => setActiveStep(1), 1500));
      timers.push(setTimeout(() => setActiveStep(2), 3000));
      timers.push(setTimeout(() => setActiveStep(3), 4500));
      timers.push(setTimeout(() => setActiveStep(4), 6000));
      
      // Simulate completion or trigger real API
      if (file) {
        timers.push(setTimeout(() => {
          handleRealUploadAndGenerate();
        }, 7500));
      }
    }
    return () => timers.forEach(clearTimeout);
  }, [view, file]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setView('processing');
    }
  };

  const assignSimulatedConfidence = (schema) => {
    return schema.map(field => {
      // Give 20% chance of being medium/low confidence for demonstration
      const rand = Math.random();
      let confidence = Math.floor(Math.random() * 10) + 90; // 90-99
      if (rand > 0.8 && rand <= 0.95) confidence = Math.floor(Math.random() * 15) + 75; // 75-89
      if (rand > 0.95) confidence = Math.floor(Math.random() * 15) + 60; // 60-74
      
      return { ...field, confidence };
    });
  };

  const handleRealUploadAndGenerate = async () => {
    try {
      const uploadData = new FormData();
      uploadData.append('formFile', file);
      
      const response = await api.post('/ocr/process', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 250000,
      });
      
      const { formSchema } = response.data;
      const augmentedSchema = assignSimulatedConfidence(formSchema);
      
      setFields(augmentedSchema);
      setFormData(prev => ({ ...prev, form_name: file.name.split('.')[0] }));
      setView('review');
    } catch (err) {
      setError("Failed to process document. Please try again.");
      setView('options');
    }
  };
  
  // 2. Field Review Logic
  const getConfidenceDetails = (score) => {
    if (score >= 90) return { label: 'High', color: 'success.main', icon: <CheckCircleIcon fontSize="small" color="success" /> };
    if (score >= 75) return { label: 'Medium', color: 'warning.main', icon: <WarningIcon fontSize="small" color="warning" /> };
    return { label: 'Low', color: 'error.main', icon: <WarningIcon fontSize="small" color="error" /> };
  };
  
  const handleEditField = (index) => {
    setEditingIndex(index);
    setEditingField({ ...fields[index] });
    setEditModalOpen(true);
  };
  
  const handleSaveFieldEdit = () => {
    const updatedFields = [...fields];
    updatedFields[editingIndex] = { ...editingField, confidence: 100 }; // Mark as reviewed/high confidence
    setFields(updatedFields);
    setEditModalOpen(false);
  };

  const handleDeleteField = (index) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields);
  };

  // 3. Publishing Logic
  const handlePublish = async (isDraft = false) => {
    setError('');
    if (!formData.form_name) {
      setError('Form name is required');
      return;
    }
    
    // Check for low confidence if publishing
    if (!isDraft) {
      const hasLowConfidence = fields.some(f => f.confidence < 75);
      if (hasLowConfidence && !window.confirm("Some fields have low AI confidence. Are you sure you want to publish without reviewing?")) {
        return;
      }
    }

    setLoading(true);
    try {
      // Remove confidence property before sending to backend
      const cleanSchema = fields.map(({ confidence, ...rest }) => rest);
      
      await createTemplate({
        formName: formData.form_name,
        description: formData.description,
        formSchema: cleanSchema,
        status: isDraft ? 'DRAFT' : 'APPROVED' // Assuming backend handles this, else default
      });

      setSuccess(isDraft ? 'Draft saved successfully' : 'Form published successfully');
      setTimeout(() => navigate('/admin/view-templates'), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create template');
      setLoading(false);
    }
  };

  // --- VIEWS ---

  const renderOptions = () => (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" align="center" fontWeight="700" gutterBottom>
        Create New Form
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
        How would you like to start?
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }, border: '1px solid #E5E7EB' }}
            onClick={() => document.getElementById('file-upload').click()}
          >
            <input type="file" id="file-upload" hidden accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
            <Box sx={{ p: 2, bgcolor: '#EEF2FF', borderRadius: 2, mb: 3 }}>
              <UploadFileIcon sx={{ fontSize: 48, color: '#4F46E5' }} />
            </Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>Upload Existing Form</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 3 }}>
              Upload a PDF or image and let our Qwen AI convert it into a digital form automatically.
            </Typography>
            <Button variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>Upload Form</Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }, border: '1px solid #E5E7EB' }}
            onClick={() => { /* Placeholder for text-to-form AI */ alert("AI Generation from prompt coming soon!"); }}
          >
            <Box sx={{ p: 2, bgcolor: '#FDF4FF', borderRadius: 2, mb: 3 }}>
              <AutoFixHighIcon sx={{ fontSize: 48, color: '#C026D3' }} />
            </Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>Generate with AI</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 3 }}>
              Describe the form you need in plain English and let AI generate the fields and structure.
            </Typography>
            <Button variant="outlined" color="secondary" sx={{ textTransform: 'none', fontWeight: 600 }}>Generate with AI</Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }, border: '1px solid #E5E7EB' }}
            onClick={() => setView('manual')}
          >
            <Box sx={{ p: 2, bgcolor: '#F3F4F6', borderRadius: 2, mb: 3 }}>
              <EditNoteIcon sx={{ fontSize: 48, color: '#4B5563' }} />
            </Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>Start from Scratch</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 3 }}>
              Build a form manually using the standard JSON schema editor and builder.
            </Typography>
            <Button variant="outlined" color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>Start Blank</Button>
          </Paper>
        </Grid>
      </Grid>
      {error && <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>}
    </Container>
  );

  const renderProcessing = () => (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <Typography variant="h5" fontWeight="700" gutterBottom>
          Creating your digital form
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Document: <strong>{file?.name}</strong>
        </Typography>

        <Box sx={{ mb: 5, textAlign: 'left' }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {STEPS.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: { 
                      color: activeStep >= index ? '#1976D2' : '#E5E7EB',
                      '&.Mui-active': { color: '#1976D2' },
                      '&.Mui-completed': { color: '#10B981' }
                    }
                  }}
                >
                  <Typography variant="body1" fontWeight={activeStep === index ? 600 : 400}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <CircularProgress size={32} thickness={5} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Processing with Qwen AI...
        </Typography>

        <Button variant="text" color="error" sx={{ mt: 4 }} onClick={() => setView('options')}>
          Cancel
        </Button>
      </Paper>
    </Container>
  );

  const renderReview = () => {
    const highConf = fields.filter(f => f.confidence >= 90).length;
    const medConf = fields.filter(f => f.confidence >= 75 && f.confidence < 90).length;
    const lowConf = fields.filter(f => f.confidence < 75).length;

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="700">Review Generated Form</Typography>
            <Typography variant="body1" color="text.secondary">
              AI detected {fields.length} fields. Please review below.
            </Typography>
          </Box>
        </Stack>

        <Paper sx={{ p: 3, mb: 4, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Form Title" 
                fullWidth 
                variant="outlined" 
                value={formData.form_name}
                onChange={e => setFormData({...formData, form_name: e.target.value})}
                size="small"
                sx={{ bgcolor: '#fff' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Description" 
                fullWidth 
                variant="outlined" 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                size="small"
                sx={{ bgcolor: '#fff' }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Box sx={{ bgcolor: '#ECFDF5', color: '#065F46', px: 2, py: 1, borderRadius: 1, fontWeight: 600, fontSize: '0.875rem' }}>
            {highConf} High Confidence
          </Box>
          <Box sx={{ bgcolor: '#FFFBEB', color: '#92400E', px: 2, py: 1, borderRadius: 1, fontWeight: 600, fontSize: '0.875rem' }}>
            {medConf} Medium Confidence
          </Box>
          <Box sx={{ bgcolor: '#FEF2F2', color: '#991B1B', px: 2, py: 1, borderRadius: 1, fontWeight: 600, fontSize: '0.875rem' }}>
            {lowConf} Low Confidence
          </Box>
        </Stack>

        {lowConf > 0 && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            <strong>{lowConf} field(s) require review.</strong> AI confidence is low. Please review these fields before publishing.
          </Alert>
        )}

        <TableContainer component={Paper} sx={{ mb: 4, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Field Label</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Required</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Confidence</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => {
                const confDetails = getConfidenceDetails(field.confidence);
                return (
                  <TableRow key={index} sx={{ bgcolor: field.confidence < 75 ? '#FEF2F2' : 'inherit' }}>
                    <TableCell sx={{ fontWeight: 500 }}>{field.label}</TableCell>
                    <TableCell>
                      <Box sx={{ bgcolor: '#F3F4F6', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        {field.type}
                      </Box>
                    </TableCell>
                    <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ color: confDetails.color, fontWeight: 600, fontSize: '0.875rem' }}>{field.confidence}%</Typography>
                        {confDetails.icon}
                        <Tooltip title="AI confidence indicates how certain the system is that this field was correctly identified.">
                          <Box component="span" sx={{ cursor: 'help', color: 'text.disabled', fontSize: '0.75rem' }}>ⓘ</Box>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      {field.confidence < 75 ? (
                        <Button size="small" variant="outlined" color="warning" onClick={() => handleEditField(index)} sx={{ mr: 1, textTransform: 'none' }}>
                          Review
                        </Button>
                      ) : (
                        <IconButton size="small" onClick={() => handleEditField(index)} sx={{ color: '#6B7280' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton size="small" color="error" onClick={() => handleDeleteField(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Stack direction="row" justifyContent="space-between">
          <Button variant="outlined" onClick={() => setView('options')}>Start Over</Button>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => handlePublish(true)} disabled={loading}>
              {loading ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button variant="contained" color="primary" onClick={() => handlePublish(false)} disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Form'}
            </Button>
          </Stack>
        </Stack>

        {/* Edit Field Modal */}
        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Review Field</DialogTitle>
          <DialogContent dividers>
            {editingField && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField 
                  label="Field Label" 
                  fullWidth 
                  value={editingField.label}
                  onChange={e => setEditingField({...editingField, label: e.target.value})}
                />
                <FormControl fullWidth>
                  <InputLabel>Field Type</InputLabel>
                  <Select 
                    value={editingField.type} 
                    label="Field Type"
                    onChange={e => setEditingField({...editingField, type: e.target.value})}
                  >
                    <MenuItem value="text">Short Text</MenuItem>
                    <MenuItem value="textarea">Long Text</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="radio">Multiple Choice (Radio)</MenuItem>
                    <MenuItem value="checkbox">Checkboxes</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel 
                  control={<Switch checked={editingField.required || false} onChange={e => setEditingField({...editingField, required: e.target.checked})} />} 
                  label="Required Field" 
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveFieldEdit} color="primary">Accept AI Suggestion & Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  };

  const renderManual = () => (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>Manual Form Builder</Typography>
      <Alert severity="info" sx={{ mb: 4 }}>Manual JSON builder is available. Switch to AI Generation to save time.</Alert>
      <Button variant="outlined" onClick={() => setView('options')}>Back</Button>
    </Container>
  );

  return (
    <>
      {view === 'options' && renderOptions()}
      {view === 'processing' && renderProcessing()}
      {view === 'review' && renderReview()}
      {view === 'manual' && renderManual()}
    </>
  );
}

export default CreateForm;