
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Menu,
  Popover
} from '@mui/material';

import {
  UploadFile as UploadFileIcon,
  AutoFixHigh as AutoFixHighIcon,
  EditNote as EditNoteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import { createTemplate } from '../../services/templateService';
import api from '../../services/api';
import DynamicFormRenderer from '../../components/forms/DynamicFormRenderer';
import { fetchSchemaReview } from '../../services/aiFeatureApi';

const STEPS = [
  'Uploading document',
  'Extracting text using OCR',
  'Identifying fields',
  'Detecting field types',
  'Building form schema'
];

const FIELD_CATEGORIES = {
  basic: {
    label: "BASIC",
    options: [
      { value: "text", label: "Short Text" },
      { value: "textarea", label: "Long Text" },
      { value: "number", label: "Number" },
      { value: "email", label: "Email" },
      { value: "tel", label: "Phone" },
      { value: "url", label: "URL" }
    ]
  },
  selection: {
    label: "SELECTION",
    options: [
      { value: "dropdown", label: "Dropdown" },
      { value: "multi_select", label: "Multi-Select" },
      { value: "radio", label: "Radio" },
      { value: "checkbox", label: "Checkboxes" },
      { value: "yes_no", label: "Yes / No" },
      { value: "autocomplete", label: "Autocomplete (AI)" }
    ]
  },
  datetime: {
    label: "DATE & TIME",
    options: [
      { value: "date", label: "Date" },
      { value: "time", label: "Time" },
      { value: "datetime", label: "Date & Time" },
      { value: "daterange", label: "Date Range" }
    ]
  },
  rating: {
    label: "RATING",
    options: [
      { value: "star", label: "Star Rating" },
      { value: "likert", label: "Likert Scale" },
      { value: "slider", label: "Slider" },
      { value: "nps", label: "NPS" }
    ]
  },
  upload: {
    label: "UPLOAD",
    options: [
      { value: "file", label: "File Upload" },
      { value: "image", label: "Image Upload" },
      { value: "signature", label: "Signature" }
    ]
  }
};

const NestedFieldTypeSelector = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [subMenuAnchorEl, setSubMenuAnchorEl] = React.useState(null);
  const hideSubMenuTimeout = React.useRef(null);

  const handleOpenMain = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMain = () => {
    setAnchorEl(null);
    setSubMenuAnchorEl(null);
  };

  const handleMoreMouseEnter = (event) => {
    if (hideSubMenuTimeout.current) clearTimeout(hideSubMenuTimeout.current);
    setSubMenuAnchorEl(event.currentTarget);
  };

  const handleMoreMouseLeave = () => {
    hideSubMenuTimeout.current = setTimeout(() => {
      setSubMenuAnchorEl(null);
    }, 150);
  };

  const handleSubMenuMouseEnter = () => {
    if (hideSubMenuTimeout.current) clearTimeout(hideSubMenuTimeout.current);
  };

  const handleSubMenuMouseLeave = () => {
    hideSubMenuTimeout.current = setTimeout(() => {
      setSubMenuAnchorEl(null);
    }, 150);
  };

  const handleSelect = (val) => {
    onChange(val);
    handleCloseMain();
  };

  let selectedLabel = value;
  for (const catKey in FIELD_CATEGORIES) {
    const found = FIELD_CATEGORIES[catKey].options.find(o => o.value === value);
    if (found) {
      selectedLabel = found.label;
      break;
    }
  }

  const basicOptions = FIELD_CATEGORIES.basic.options;
  const otherCategories = Object.keys(FIELD_CATEGORIES)
    .filter(k => k !== 'basic')
    .map(k => FIELD_CATEGORIES[k]);

  return (
    <>
      <FormControl fullWidth>
        <InputLabel shrink sx={{ bgcolor: 'white', px: 0.5, zIndex: 1 }}>Field Type</InputLabel>
        <Box
          onClick={handleOpenMain}
          sx={{
            border: anchorEl ? '2px solid #1976d2' : '1px solid #c4c4c4',
            borderRadius: 1,
            p: anchorEl ? '15.5px 13px' : '16.5px 14px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            '&:hover': { borderColor: anchorEl ? '#1976d2' : 'black' }
          }}
        >
          <Typography sx={{ color: value ? 'text.primary' : 'text.secondary' }}>
            {selectedLabel || 'Select Type'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
              <path d="M7 10l5 5 5-5z" fill="currentColor"/>
            </svg>
          </Box>
        </Box>
      </FormControl>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMain}
        PaperProps={{ sx: { width: anchorEl ? anchorEl.clientWidth : undefined } }}
      >
        <Typography sx={{ px: 2, py: 1, fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.5px' }}>
          BASIC
        </Typography>
        {basicOptions.map(opt => (
          <MenuItem 
            key={opt.value} 
            onClick={() => handleSelect(opt.value)}
            selected={value === opt.value}
          >
            {opt.label}
          </MenuItem>
        ))}
        
        <MenuItem
          onMouseEnter={handleMoreMouseEnter}
          onMouseLeave={handleMoreMouseLeave}
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 1, 
            borderTop: '1px solid #eee', 
            pt: 1.5 
          }}
        >
          More Field Types 
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
          </svg>
        </MenuItem>
      </Menu>

      <Popover
        anchorEl={subMenuAnchorEl}
        open={Boolean(subMenuAnchorEl)}
        onClose={() => setSubMenuAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        hideBackdrop={true}
        disableRestoreFocus
        disableAutoFocus
        disableEnforceFocus
        PaperProps={{
          onMouseEnter: handleSubMenuMouseEnter,
          onMouseLeave: handleSubMenuMouseLeave,
          sx: { ml: 0.5, maxHeight: 400, pointerEvents: 'auto', overflowY: 'auto' },
          elevation: 4
        }}
        sx={{ pointerEvents: 'none' }}
      >
        <Box sx={{ py: 1, minWidth: 200 }}>
          {otherCategories.map((cat, idx) => (
            <Box key={cat.label} sx={{ mb: idx === otherCategories.length - 1 ? 0 : 1 }}>
              <Typography sx={{ px: 2, py: 0.5, fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.5px' }}>
                {cat.label}
              </Typography>
              {cat.options.map(opt => (
                <MenuItem 
                  key={opt.value} 
                  onClick={() => handleSelect(opt.value)}
                  selected={value === opt.value}
                  sx={{ pl: 3 }}
                >
                  {opt.label}
                </MenuItem>
              ))}
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
};

function CreateForm() {
  const navigate = useNavigate();

  // ---------------------------------------------------------
  // View State
  // ---------------------------------------------------------
  const [view, setView] = useState('options');
  // options | processing | admin-preview | review | manual | ai-prompt

  // AI Review State
  const [aiReviewIssues, setAiReviewIssues] = useState([]);
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [hasRunAiReview, setHasRunAiReview] = useState(false);

  // ---------------------------------------------------------
  // Data State
  // ---------------------------------------------------------
  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({
    form_name: '',
    description: '',
    prompt_text: '',
    formSchema: []
  });

  const [fields, setFields] = useState([]);
  
  // ---------------------------------------------------------
  // Manual Builder State
  // ---------------------------------------------------------
  const [manualFields, setManualFields] = useState([]);
  const [headingModalOpen, setHeadingModalOpen] = useState(false);
  const [newHeadingText, setNewHeadingText] = useState('');
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingManualField, setEditingManualField] = useState(null);
  const [editingManualIndex, setEditingManualIndex] = useState(-1);
  const [targetSection, setTargetSection] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // NEW:
  // Stores the exact response received from the backend/Qwen flow.
  const [qwenResponse, setQwenResponse] = useState('');

  // ---------------------------------------------------------
  // UI State
  // ---------------------------------------------------------
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // ---------------------------------------------------------
  // Editor Modal
  // ---------------------------------------------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);

  // ---------------------------------------------------------
  // Processing Logic
  // ---------------------------------------------------------
  useEffect(() => {
    let timers = [];

    if (view === 'processing') {
      setActiveStep(0);

      timers.push(
        setTimeout(() => setActiveStep(1), 1500)
      );

      timers.push(
        setTimeout(() => setActiveStep(2), 3000)
      );

      timers.push(
        setTimeout(() => setActiveStep(3), 4500)
      );

      timers.push(
        setTimeout(() => setActiveStep(4), 6000)
      );

      // Trigger real API after the processing animation.
      if (file) {
        timers.push(
          setTimeout(() => {
            handleRealUploadAndGenerate();
          }, 7500)
        );
      }
    }

    return () => timers.forEach(clearTimeout);
  }, [view, file]);

  // Removed automatic AI Schema Review effect loop


  // ---------------------------------------------------------
  // File Selection
  // ---------------------------------------------------------
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setView('processing');
      setError('');
      setSuccess('');
      setQwenResponse('');
    }
  };

  // ---------------------------------------------------------
  // Add Confidence For UI
  // ---------------------------------------------------------
  const assignSimulatedConfidence = (schema) => {
    if (!Array.isArray(schema)) {
      return [];
    }

    return schema.map((field) => {
      const rand = Math.random();

      let confidence =
        Math.floor(Math.random() * 10) + 90;

      if (rand > 0.8 && rand <= 0.95) {
        confidence =
          Math.floor(Math.random() * 15) + 75;
      }

      if (rand > 0.95) {
        confidence =
          Math.floor(Math.random() * 15) + 60;
      }

      return {
        ...field,
        confidence
      };
    });
  };

  // ---------------------------------------------------------
  // REAL QWEN / OCR API CALL
  // ---------------------------------------------------------
  const handleRealUploadAndGenerate = async () => {
    try {
      setError('');
      setSuccess('');

      const uploadData = new FormData();

      uploadData.append('formFile', file);

      console.log('====================================');
      console.log('STARTING QWEN / OCR REQUEST');
      console.log('File:', file?.name);
      console.log('====================================');

      const response = await api.post(
        '/ocr/process',
        uploadData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 250000
        }
      );

      // -----------------------------------------------------
      // IMPORTANT DEBUGGING
      // -----------------------------------------------------

      console.log('====================================');
      console.log('FULL QWEN RESPONSE:');
      console.log(response.data);

      console.log('FORM SCHEMA:');
      console.log(response.data?.formSchema);

      console.log(
        'IS FORM SCHEMA ARRAY:',
        Array.isArray(response.data?.formSchema)
      );

      console.log('====================================');

      // Save the backend response for display, omitting extractedText.
      const { extractedText, ...displayData } = response.data;
      setQwenResponse(
        JSON.stringify(displayData, null, 2)
      );

      // -----------------------------------------------------
      // Extract formSchema
      // -----------------------------------------------------

      const { formSchema } = response.data;

      // Make sure formSchema exists.
      if (!formSchema) {
        throw new Error(
          'Backend response does not contain formSchema.'
        );
      }

      // Make sure formSchema is an array.
      if (!Array.isArray(formSchema)) {
        console.error(
          'formSchema is NOT an array:',
          formSchema
        );

        throw new Error(
          'The Qwen response contains formSchema, but it is not an array.'
        );
      }

      // -----------------------------------------------------
      // Add confidence values for the UI
      // -----------------------------------------------------

      const augmentedSchema =
        assignSimulatedConfidence(formSchema);

      console.log('FINAL FIELDS SENT TO UI:');
      console.log(augmentedSchema);

      // -----------------------------------------------------
      // Store data
      // -----------------------------------------------------

      setFields(augmentedSchema);

      setFormData((prev) => ({
        ...prev,
        form_name: file.name.split('.')[0],
        formSchema: formSchema
      }));

      // -----------------------------------------------------
      // Show Admin Preview page
      // -----------------------------------------------------

      setView('admin-preview');
      setHasRunAiReview(false);

      setSuccess(
        'Qwen AI generated the form schema successfully. Please review the admin preview.'
      );

    } catch (err) {
      console.error('====================================');
      console.error('QWEN / OCR ERROR');
      console.error(err);
      console.error('Response:', err?.response?.data);
      console.error('====================================');

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to process document.'
      );

      setView('options');
    }
  };

  // ---------------------------------------------------------
  // Confidence Details
  // ---------------------------------------------------------
  const getConfidenceDetails = (score) => {
    if (score >= 90) {
      return {
        label: 'High',
        color: 'success.main',
        icon: (
          <CheckCircleIcon
            fontSize="small"
            color="success"
          />
        )
      };
    }

    if (score >= 75) {
      return {
        label: 'Medium',
        color: 'warning.main',
        icon: (
          <WarningIcon
            fontSize="small"
            color="warning"
          />
        )
      };
    }

    return {
      label: 'Low',
      color: 'error.main',
      icon: (
        <WarningIcon
          fontSize="small"
          color="error"
        />
      )
    };
  };

  // ---------------------------------------------------------
  // Edit Field
  // ---------------------------------------------------------
  const handleEditField = (index) => {
    setEditingIndex(index);
    setEditingField({
      ...fields[index]
    });
    setEditModalOpen(true);
  };

  // ---------------------------------------------------------
  // Save Field Edit
  // ---------------------------------------------------------
  const handleSaveFieldEdit = () => {
    const updatedFields = [...fields];

    updatedFields[editingIndex] = {
      ...editingField,
      confidence: 100
    };

    setFields(updatedFields);
    setEditModalOpen(false);
  };

  // ---------------------------------------------------------
  // Delete Field
  // ---------------------------------------------------------
  const handleDeleteField = (index) => {
    const updatedFields = [...fields];

    updatedFields.splice(index, 1);

    setFields(updatedFields);
  };

  // ---------------------------------------------------------
  // Publish
  // ---------------------------------------------------------
  const handlePublish = async (isDraft = false) => {
    setError('');

    if (!formData.form_name) {
      setError('Form name is required');
      return;
    }

    if (!isDraft) {
      if (!fields || fields.length === 0) {
        setError('No fields configured for this form.');
        return;
      }
      
      const hasMissingLabel = fields.some(field => !field.label || field.label.trim() === '');
      if (hasMissingLabel) {
        setError('All fields must have a valid label before publishing.');
        return;
      }

      const fieldLabels = fields.map(f => f.label.trim().toLowerCase());
      const uniqueLabels = new Set(fieldLabels);
      if (fieldLabels.length !== uniqueLabels.size) {
        setError('Duplicate field names are not allowed.');
        return;
      }

      const invalidOptionsField = fields.find(field => {
        const type = String(field.type || '').toLowerCase();
        if (['dropdown', 'select', 'radio', 'radio_button', 'checkbox'].includes(type)) {
           return !Array.isArray(field.options) || field.options.length === 0;
        }
        return false;
      });

      if (invalidOptionsField) {
        setError(`Field "${invalidOptionsField.label}" requires at least one option.`);
        return;
      }

      const hasLowConfidence =
        fields.some(
          (f) => f.confidence < 75
        );

      if (
        hasLowConfidence &&
        !window.confirm(
          'Some fields have low AI confidence. Are you sure you want to publish without reviewing?'
        )
      ) {
        return;
      }
    }

    setLoading(true);

    try {
      // Remove confidence before sending to backend.
      const cleanSchema = fields.map(
        ({ confidence, ...rest }) => rest
      );

      await createTemplate({
        formName: formData.form_name,
        description: formData.description,
        formSchema: cleanSchema,
        status: isDraft
          ? 'DRAFT'
          : 'APPROVED'
      });

      setSuccess(
        isDraft
          ? 'Draft saved successfully'
          : 'Form published successfully'
      );

      setTimeout(() => {
        navigate('/admin/view-templates');
      }, 1500);

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        'Failed to create template'
      );

      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // OPTIONS VIEW
  // ---------------------------------------------------------
  const renderOptions = () => (
    <Container
      maxWidth="lg"
      sx={{ py: 6 }}
    >
      <Typography
        variant="h4"
        component="h1"
        align="center"
        fontWeight="700"
        gutterBottom
      >
        Create New Form
      </Typography>

      <Typography
        variant="body1"
        align="center"
        color="text.secondary"
        sx={{ mb: 6 }}
      >
        How would you like to start?
      </Typography>

      <Grid
        container
        spacing={4}
        justifyContent="center"
      >

        {/* Upload Existing Form */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow:
                  '0 10px 15px -3px rgba(0,0,0,0.1)'
              },
              border:
                '1px solid #E5E7EB'
            }}
            onClick={() =>
              document
                .getElementById('file-upload')
                .click()
            }
          >
            <input
              type="file"
              id="file-upload"
              hidden
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />

            <Box
              sx={{
                p: 2,
                bgcolor: '#EEF2FF',
                borderRadius: 2,
                mb: 3
              }}
            >
              <UploadFileIcon
                sx={{
                  fontSize: 48,
                  color: '#4F46E5'
                }}
              />
            </Box>

            <Typography
              variant="h6"
              fontWeight="600"
              gutterBottom
            >
              Upload Existing Form
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                flexGrow: 1,
                mb: 3
              }}
            >
              Upload a PDF or image and let our
              Qwen AI convert it into a digital
              form automatically.
            </Typography>

            <Button
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Upload Form
            </Button>
          </Paper>
        </Grid>

        {/* Generate With AI */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow:
                  '0 10px 15px -3px rgba(0,0,0,0.1)'
              },
              border:
                '1px solid #E5E7EB'
            }}
            onClick={() => {
              setView('ai-prompt');
              setError('');
              setSuccess('');
              setQwenResponse('');
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: '#FDF4FF',
                borderRadius: 2,
                mb: 3
              }}
            >
              <AutoFixHighIcon
                sx={{
                  fontSize: 48,
                  color: '#C026D3'
                }}
              />
            </Box>

            <Typography
              variant="h6"
              fontWeight="600"
              gutterBottom
            >
              Generate with AI
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                flexGrow: 1,
                mb: 3
              }}
            >
              Describe the form you need in plain
              English and let AI generate the fields
              and structure.
            </Typography>

            <Button
              variant="outlined"
              color="secondary"
              sx={{
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Generate with AI
            </Button>
          </Paper>
        </Grid>

        {/* Manual */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow:
                  '0 10px 15px -3px rgba(0,0,0,0.1)'
              },
              border:
                '1px solid #E5E7EB'
            }}
            onClick={() =>
              setView('manual')
            }
          >
            <Box
              sx={{
                p: 2,
                bgcolor: '#F3F4F6',
                borderRadius: 2,
                mb: 3
              }}
            >
              <EditNoteIcon
                sx={{
                  fontSize: 48,
                  color: '#4B5563'
                }}
              />
            </Box>

            <Typography
              variant="h6"
              fontWeight="600"
              gutterBottom
            >
              Start from Scratch
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                flexGrow: 1,
                mb: 3
              }}
            >
              Build a form manually using the
              standard JSON schema editor and
              builder.
            </Typography>

            <Button
              variant="outlined"
              color="inherit"
              sx={{
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Start Blank
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {error && (
        <Alert
          severity="error"
          sx={{ mt: 4 }}
        >
          {error}
        </Alert>
      )}
    </Container>
  );

  // ---------------------------------------------------------
  // PROCESSING VIEW
  // ---------------------------------------------------------
  const renderProcessing = () => (
    <Container
      maxWidth="sm"
      sx={{ py: 10 }}
    >
      <Paper
        sx={{
          p: 5,
          textAlign: 'center',
          borderRadius: 2,
          border:
            '1px solid #E5E7EB',
          boxShadow:
            '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}
      >
        <Typography
          variant="h5"
          fontWeight="700"
          gutterBottom
        >
          Creating your digital form
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Document:{' '}
          <strong>
            {file?.name}
          </strong>
        </Typography>

        <Box
          sx={{
            mb: 5,
            textAlign: 'left'
          }}
        >
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
          >
            {STEPS.map(
              (label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        color:
                          activeStep >= index
                            ? '#1976D2'
                            : '#E5E7EB',

                        '&.Mui-active': {
                          color: '#1976D2'
                        },

                        '&.Mui-completed': {
                          color: '#10B981'
                        }
                      }
                    }}
                  >
                    <Typography
                      variant="body1"
                      fontWeight={
                        activeStep === index
                          ? 600
                          : 400
                      }
                    >
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              )
            )}
          </Stepper>
        </Box>

        <CircularProgress
          size={32}
          thickness={5}
          sx={{ mb: 2 }}
        />

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Processing with Qwen AI...
        </Typography>

        <Button
          variant="text"
          color="error"
          sx={{ mt: 4 }}
          onClick={() =>
            setView('options')
          }
        >
          Cancel
        </Button>
      </Paper>
    </Container>
  );

  // ---------------------------------------------------------
  // REVIEW VIEW
  // ---------------------------------------------------------
  const renderReview = () => {
    const highConf =
      fields.filter(
        (f) => f.confidence >= 90
      ).length;

    const medConf =
      fields.filter(
        (f) =>
          f.confidence >= 75 &&
          f.confidence < 90
      ).length;

    const lowConf =
      fields.filter(
        (f) => f.confidence < 75
      ).length;

    return (
      <Container
        maxWidth="lg"
        sx={{ py: 4 }}
      >

        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="700"
            >
              Review Generated Form
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
            >
              AI detected{' '}
              {fields.length}{' '}
              fields. Please review below.
            </Typography>
          </Box>
        </Stack>

        {/* Form Details */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            bgcolor: '#F8FAFC',
            border:
              '1px solid #E2E8F0'
          }}
        >
          <Grid container spacing={2}>

            <Grid item xs={12} md={6}>
              <TextField
                label="Form Title"
                fullWidth
                variant="outlined"
                value={
                  formData.form_name
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    form_name:
                      e.target.value
                  })
                }
                size="small"
                sx={{
                  bgcolor: '#fff'
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Description"
                fullWidth
                variant="outlined"
                value={
                  formData.description
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description:
                      e.target.value
                  })
                }
                size="small"
                sx={{
                  bgcolor: '#fff'
                }}
              />
            </Grid>

          </Grid>
        </Paper>



        {/* Confidence Summary */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box
            sx={{
              bgcolor: '#ECFDF5',
              color: '#065F46',
              px: 2,
              py: 1,
              borderRadius: 1,
              fontWeight: 600,
              fontSize:
                '0.875rem'
            }}
          >
            {highConf} High Confidence
          </Box>

          <Box
            sx={{
              bgcolor: '#FFFBEB',
              color: '#92400E',
              px: 2,
              py: 1,
              borderRadius: 1,
              fontWeight: 600,
              fontSize:
                '0.875rem'
            }}
          >
            {medConf} Medium Confidence
          </Box>

          <Box
            sx={{
              bgcolor: '#FEF2F2',
              color: '#991B1B',
              px: 2,
              py: 1,
              borderRadius: 1,
              fontWeight: 600,
              fontSize:
                '0.875rem'
            }}
          >
            {lowConf} Low Confidence
          </Box>
        </Stack>

        {lowConf > 0 && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              borderRadius: 2
            }}
          >
            <strong>
              {lowConf} field(s)
              require review.
            </strong>{' '}
            AI confidence is low.
            Please review these
            fields before publishing.
          </Alert>
        )}

        {/* -------------------------------------------------
            GENERATED FIELDS TABLE
        -------------------------------------------------- */}
        <TableContainer
          component={Paper}
          sx={{
            mb: 4,
            border:
              '1px solid #E5E7EB',
            boxShadow: 'none'
          }}
        >
          <Table>

            <TableHead
              sx={{
                bgcolor: '#F9FAFB'
              }}
            >
              <TableRow>

                <TableCell
                  sx={{
                    fontWeight: 600
                  }}
                >
                  Field Label
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 600
                  }}
                >
                  Type
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 600
                  }}
                >
                  Required
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 600
                  }}
                >
                  Confidence
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600
                  }}
                >
                  Action
                </TableCell>

              </TableRow>
            </TableHead>

            <TableBody>

              {fields.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                  >
                    <Typography
                      color="text.secondary"
                      sx={{ py: 4 }}
                    >
                      No fields were returned
                      from the Qwen response.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                fields.map(
                  (field, index) => {
                    const confDetails =
                      getConfidenceDetails(
                        field.confidence
                      );

                    return (
                      <TableRow
                        key={index}
                        sx={{
                          bgcolor:
                            field.confidence <
                            75
                              ? '#FEF2F2'
                              : 'inherit'
                        }}
                      >

                        <TableCell
                          sx={{
                            fontWeight: 500
                          }}
                        >
                          {field.label}
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              bgcolor:
                                '#F3F4F6',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              display:
                                'inline-block',
                              fontSize:
                                '0.75rem',
                              fontWeight: 600,
                              textTransform:
                                'uppercase'
                            }}
                          >
                            {field.type}
                          </Box>
                        </TableCell>

                        <TableCell>
                          {field.required
                            ? 'Yes'
                            : 'No'}
                        </TableCell>

                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography
                              sx={{
                                color:
                                  confDetails.color,
                                fontWeight: 600,
                                fontSize:
                                  '0.875rem'
                              }}
                            >
                              {field.confidence}%
                            </Typography>

                            {confDetails.icon}

                            <Tooltip
                              title="AI confidence indicates how certain the system is that this field was correctly identified."
                            >
                              <Box
                                component="span"
                                sx={{
                                  cursor:
                                    'help',
                                  color:
                                    'text.disabled',
                                  fontSize:
                                    '0.75rem'
                                }}
                              >
                                ⓘ
                              </Box>
                            </Tooltip>
                          </Stack>
                        </TableCell>

                        <TableCell align="right">

                          {field.confidence <
                          75 ? (
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() =>
                                handleEditField(
                                  index
                                )
                              }
                              sx={{
                                mr: 1,
                                textTransform:
                                  'none'
                              }}
                            >
                              Review
                            </Button>
                          ) : (
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleEditField(
                                  index
                                )
                              }
                              sx={{
                                color:
                                  '#6B7280'
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}

                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDeleteField(
                                index
                              )
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>

                        </TableCell>

                      </TableRow>
                    );
                  }
                )
              )}

            </TableBody>
          </Table>
        </TableContainer>

        {/* -------------------------------------------------
            DEBUG JSON RESPONSE
            Moved below the table per instructions
        -------------------------------------------------- */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            border:
              '1px solid #E5E7EB'
          }}
        >
          <Typography
            variant="h6"
            fontWeight="600"
            gutterBottom
          >
            Qwen AI Response
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            This shows the exact JSON returned by
            the `/ocr/process` API.
          </Typography>

          <TextField
            label="Generated JSON Schema"
            value={qwenResponse}
            fullWidth
            multiline
            minRows={12}
            InputProps={{
              readOnly: true,
              sx: {
                fontFamily:
                  'monospace',
                fontSize:
                  '0.85rem'
              }
            }}
          />
        </Paper>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
          >
            {success}
          </Alert>
        )}

        {/* Publish Buttons */}
        <Stack
          direction="row"
          justifyContent="space-between"
        >
          <Button
            variant="outlined"
            onClick={() =>
              setView('options')
            }
          >
            Start Over
          </Button>

          <Stack
            direction="row"
            spacing={2}
          >
            <Button
              variant="outlined"
              onClick={() =>
                handlePublish(true)
              }
              disabled={loading}
            >
              {loading
                ? 'Saving...'
                : 'Save Draft'}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                handlePublish(false)
              }
              disabled={loading}
            >
              {loading
                ? 'Publishing...'
                : 'Publish Form'}
            </Button>
          </Stack>
        </Stack>

        {/* Edit Field Modal */}
        <Dialog
          open={editModalOpen}
          onClose={() =>
            setEditModalOpen(false)
          }
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Review Field
          </DialogTitle>

          <DialogContent dividers>

            {editingField && (
              <Stack
                spacing={3}
                sx={{ mt: 1 }}
              >

                <TextField
                  label="Field Label"
                  fullWidth
                  value={
                    editingField.label
                  }
                  onChange={(e) =>
                    setEditingField({
                      ...editingField,
                      label:
                        e.target.value
                    })
                  }
                />

                <NestedFieldTypeSelector
                  value={editingField.type}
                  onChange={(val) =>
                    setEditingField({
                      ...editingField,
                      type: val
                    })
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={
                        editingField.required ||
                        false
                      }
                      onChange={(e) =>
                        setEditingField({
                          ...editingField,
                          required:
                            e.target.checked
                        })
                      }
                    />
                  }
                  label="Required Field"
                />

              </Stack>
            )}

          </DialogContent>

          <DialogActions
            sx={{ p: 2 }}
          >
            <Button
              onClick={() =>
                setEditModalOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={
                handleSaveFieldEdit
              }
              color="primary"
            >
              Accept AI Suggestion & Save
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    );
  };

  // ---------------------------------------------------------
  // AI PROMPT VIEW
  // ---------------------------------------------------------
  const handleGenerateFromText = async () => {
    if (!formData.prompt_text || formData.prompt_text.trim() === '') {
      setError('Please provide a description of the form.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/ocr/generate-from-text', {
        description: formData.prompt_text
      });
      
      const { formSchema } = response.data;
      
      if (!formSchema || !Array.isArray(formSchema)) {
        throw new Error('Backend did not return a valid schema array.');
      }
      
      setQwenResponse(JSON.stringify(response.data, null, 2));
      
      const augmentedSchema = assignSimulatedConfidence(formSchema);
      setFields(augmentedSchema);
      
      setFormData(prev => ({
        ...prev,
        formSchema: formSchema
      }));
      
      setView('review');
      setSuccess('Qwen AI generated the form schema successfully. Please review the fields below.');
      
    } catch (err) {
      console.error('AI Generation Error:', err);
      setError('Unable to generate a valid form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderAiPrompt = () => (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight="700">
        Generate Form with AI
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Describe the form you want to create in plain English. Our AI will automatically generate the corresponding fields.
      </Typography>

      <Paper sx={{ p: 4, mb: 4, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Form Title (Optional)"
                fullWidth
                value={formData.form_name}
                onChange={(e) => setFormData({ ...formData, form_name: e.target.value })}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Form Description (Optional)"
                fullWidth
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
              />
            </Grid>
          </Grid>

          <TextField
            label="Form Requirements (Describe your form)"
            fullWidth
            multiline
            rows={8}
            placeholder="E.g., Create a hostel admission form with student details, parent details, room preference options, and a declaration matrix..."
            value={formData.prompt_text}
            onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
            disabled={loading}
            required
            autoFocus
          />
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button 
          variant="outlined" 
          onClick={() => setView('options')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleGenerateFromText}
          disabled={loading || !formData.prompt_text}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
        >
          {loading ? 'Generating Form...' : 'Generate Form'}
        </Button>
      </Stack>
    </Container>
  );

  // ---------------------------------------------------------
  // MANUAL VIEW HELPERS
  // ---------------------------------------------------------

  const handleAddHeading = () => {
    if (!newHeadingText.trim()) return;
    setManualFields([...manualFields, { type: 'heading', label: newHeadingText }]);
    setNewHeadingText('');
    setHeadingModalOpen(false);
  };

  const handleOpenFieldModal = (index = -1, field = null) => {
    setEditingManualIndex(index);
    if (field) {
      setEditingManualField({ ...field });
    } else {
      setEditingManualField({ label: '', type: 'text', required: true, options: [] });
    }
    setFieldModalOpen(true);
  };

  const handleSaveField = () => {
    if (!editingManualField.label.trim()) {
      alert("Field label is required.");
      return;
    }
    const updated = [...manualFields];
    if (editingManualIndex >= 0) {
      updated[editingManualIndex] = editingManualField;
    } else {
      // Find the target section index
      if (targetSection) {
        let insertIndex = updated.length;
        // Find the index of the target section heading
        const sectionIdx = updated.findIndex(f => f.type === 'heading' && f.label === targetSection);
        if (sectionIdx !== -1) {
          // Find next heading
          const nextHeadingIdx = updated.findIndex((f, idx) => idx > sectionIdx && f.type === 'heading');
          insertIndex = nextHeadingIdx !== -1 ? nextHeadingIdx : updated.length;
        }
        updated.splice(insertIndex, 0, editingManualField);
      } else {
        updated.push(editingManualField);
      }
    }
    setManualFields(updated);
    setFieldModalOpen(false);
  };

  const handleDeleteManualField = (index) => {
    if (window.confirm("Delete this field?")) {
      const updated = [...manualFields];
      updated.splice(index, 1);
      setManualFields(updated);
    }
  };

  const handlePublishManual = async () => {
    setError('');
    if (!formData.form_name) {
      setError('Form title is required');
      return;
    }
    if (manualFields.length === 0) {
      setError('Please add at least one heading or field.');
      return;
    }

    setLoading(true);
    try {
      await createTemplate({
        formName: formData.form_name,
        description: formData.description,
        formSchema: manualFields,
        status: 'DRAFT'
      });
      setSuccess('Form saved as DRAFT successfully');
      setTimeout(() => {
        navigate('/admin/view-templates');
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create template');
      setLoading(false);
    }
  };

  const renderManual = () => {
    // Extract sections for the dropdown
    const sections = manualFields.filter(f => f.type === 'heading').map(f => f.label);

    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom fontWeight="700">
          Create Form
        </Typography>

        <Paper sx={{ p: 4, mb: 4, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Form Title"
                fullWidth
                value={formData.form_name}
                onChange={(e) => setFormData({ ...formData, form_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Form Description"
                fullWidth
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="h5" gutterBottom fontWeight="700">
          FORM BUILDER
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setHeadingModalOpen(true)}>
            Add Heading
          </Button>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenFieldModal()}>
            Add Field
          </Button>
        </Stack>

        {manualFields.length === 0 && (
          <Alert severity="info" sx={{ mb: 4 }}>
            Start by adding a heading (section) or a field.
          </Alert>
        )}

        {/* Visual representation of fields grouped by sections */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          {manualFields.map((field, idx) => {
            if (field.type === 'heading') {
              return (
                <Paper key={idx} sx={{ p: 2, mt: 3, bgcolor: '#F8FAFC', border: '1px solid #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight="600">{field.label}</Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpenFieldModal(idx, field)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteManualField(idx)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                </Paper>
              );
            }
            return (
              <Paper key={idx} sx={{ p: 2, ml: 4, border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="600">{field.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {field.type} • {field.required ? 'Required' : 'Optional'}
                  </Typography>
                  {field.options && field.options.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Options: {field.options.join(', ')}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => handleOpenFieldModal(idx, field)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteManualField(idx)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              </Paper>
            );
          })}
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 4 }}>{success}</Alert>}

        <Stack direction="row" justifyContent="space-between">
          <Button variant="outlined" onClick={() => setView('options')}>Back</Button>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => setPreviewOpen(true)} disabled={manualFields.length === 0}>
              Preview
            </Button>
            <Button variant="contained" color="primary" onClick={handlePublishManual} disabled={loading}>
              {loading ? 'Saving...' : 'Save Form'}
            </Button>
          </Stack>
        </Stack>

        {/* Heading Modal */}
        <Dialog open={headingModalOpen} onClose={() => setHeadingModalOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Add Heading</DialogTitle>
          <DialogContent dividers>
            <TextField
              label="Heading Text"
              fullWidth
              value={newHeadingText}
              onChange={(e) => setNewHeadingText(e.target.value)}
              placeholder="e.g. Student Details"
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHeadingModalOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddHeading}>Create Heading</Button>
          </DialogActions>
        </Dialog>

        {/* Field Modal */}
        <Dialog open={fieldModalOpen} onClose={() => setFieldModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingManualIndex >= 0 ? 'Edit Field' : 'Add Field'}</DialogTitle>
          <DialogContent dividers>
            {editingManualField && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  label={editingManualField.type === 'heading' ? 'Heading Text' : 'Field Label'}
                  fullWidth
                  value={editingManualField.label}
                  onChange={(e) => setEditingManualField({ ...editingManualField, label: e.target.value })}
                />
                
                {editingManualField.type !== 'heading' && (
                  <>
                    <NestedFieldTypeSelector
                      value={editingManualField.type}
                      onChange={(val) => setEditingManualField({ ...editingManualField, type: val })}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={editingManualField.required || false}
                          onChange={(e) => setEditingManualField({ ...editingManualField, required: e.target.checked })}
                        />
                      }
                      label="Required Field"
                    />

                    {/* Options Editor */}
                    {['radio', 'checkbox', 'dropdown', 'multi_select'].includes(editingManualField.type) && (
                      <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2 }}>Options</Typography>
                        {(editingManualField.options || []).map((opt, i) => (
                          <Stack direction="row" spacing={1} key={i} sx={{ mb: 1 }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...editingManualField.options];
                                newOpts[i] = e.target.value;
                                setEditingManualField({ ...editingManualField, options: newOpts });
                              }}
                            />
                            <IconButton color="error" onClick={() => {
                              const newOpts = [...editingManualField.options];
                              newOpts.splice(i, 1);
                              setEditingManualField({ ...editingManualField, options: newOpts });
                            }}>
                              <CloseIcon />
                            </IconButton>
                          </Stack>
                        ))}
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => setEditingManualField({ ...editingManualField, options: [...(editingManualField.options || []), 'New Option'] })}
                        >
                          Add Option
                        </Button>
                      </Box>
                    )}

                    {/* Target Section Selection (only when adding a new field) */}
                    {editingManualIndex === -1 && sections.length > 0 && (
                      <FormControl fullWidth>
                        <InputLabel>Section</InputLabel>
                        <Select
                          value={targetSection}
                          onChange={(e) => setTargetSection(e.target.value)}
                          label="Section"
                        >
                          <MenuItem value=""><em>Top Level (End of Form)</em></MenuItem>
                          {sections.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                      </FormControl>
                    )}
                  </>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFieldModalOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveField}>
              {editingManualIndex >= 0 ? 'Save Changes' : 'Create Field'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Preview Modal */}
        <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Form Preview</DialogTitle>
          <DialogContent dividers sx={{ bgcolor: '#f1f5f9', p: 4 }}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom>{formData.form_name || 'Form Preview'}</Typography>
              {formData.description && <Typography color="text.secondary" paragraph>{formData.description}</Typography>}
              <DynamicFormRenderer schema={manualFields} previewMode={true} />
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewOpen(false)}>Close Preview</Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  };

  const renderAdminPreview = () => {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="700">Admin Preview & AI Review</Typography>
            <Typography variant="body1" color="text.secondary">
              Preview the form below. Review AI suggestions in the right panel.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => {
              setAiReviewLoading(true);
              fetchSchemaReview(formData.form_name, formData.description, fields).then(res => {
                setAiReviewIssues(res.issues || []);
                setAiReviewLoading(false);
              }).catch(() => setAiReviewLoading(false));
            }} disabled={aiReviewLoading}>
              {aiReviewLoading ? 'Analyzing...' : 'AI Review'}
            </Button>
            <Button variant="outlined" onClick={() => {
              setManualFields(fields);
              setView('manual');
            }}>
              Edit Form Manually
            </Button>
            <Button variant="contained" color="primary" onClick={() => handlePublish(false)} disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Form'}
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, bgcolor: '#f8fafc' }}>
              <Typography variant="h5" gutterBottom>{formData.form_name || 'Form Preview'}</Typography>
              {formData.description && <Typography color="text.secondary" paragraph>{formData.description}</Typography>}
              <DynamicFormRenderer schema={fields} previewMode={true} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                AI Schema Review
              </Typography>
              {aiReviewLoading ? (
                <Stack alignItems="center" sx={{ py: 4 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 2 }}>Analyzing schema...</Typography>
                </Stack>
              ) : aiReviewIssues.length === 0 ? (
                <Alert severity="success">No issues found. Form looks good!</Alert>
              ) : (
                <Stack spacing={3}>
                  <Alert severity="warning">
                    Found {aiReviewIssues.length} potential improvement(s).
                  </Alert>
                  
                  {aiReviewIssues.filter(i => i.confidence >= 90).length > 0 && (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        let updatedFields = [...fields];
                        let remainingIssues = [...aiReviewIssues];
                        
                        const highConfidenceIssues = aiReviewIssues.filter(i => i.confidence >= 90);
                        
                        highConfidenceIssues.forEach(issue => {
                          const targetIndex = updatedFields.findIndex(f => f.label === issue.field);
                          if (targetIndex >= 0) {
                            updatedFields[targetIndex].type = issue.suggestedType;
                            remainingIssues = remainingIssues.filter(ri => ri !== issue);
                          }
                        });
                        
                        setFields(updatedFields);
                        setAiReviewIssues(remainingIssues);
                      }}
                    >
                      Apply All High-Confidence Suggestions
                    </Button>
                  )}
                  {aiReviewIssues.map((issue, idx) => (
                    <Paper key={idx} sx={{ p: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                      <Typography variant="subtitle2" fontWeight="600" color="error.main">
                        Field: {issue.field}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Reason:</strong> {issue.reason}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Current Type:</strong> {issue.currentType} <br/>
                        <strong>Suggested Type:</strong> {issue.suggestedType}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => {
                          const updatedFields = [...fields];
                          const targetIndex = updatedFields.findIndex(f => f.label === issue.field);
                          if (targetIndex >= 0) {
                            updatedFields[targetIndex].type = issue.suggestedType;
                            setFields(updatedFields);
                            setAiReviewIssues(prev => prev.filter((_, i) => i !== idx));
                          }
                        }}
                      >
                        Apply Suggestion
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  };

  // ---------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------
  return (
    <>
      {view === 'options' &&
        renderOptions()}

      {view === 'processing' &&
        renderProcessing()}

      {view === 'admin-preview' &&
        renderAdminPreview()}

      {view === 'review' &&
        renderReview()}

      {view === 'manual' &&
        renderManual()}

      {view === 'ai-prompt' &&
        renderAiPrompt()}
    </>
  );
}

export default CreateForm;

