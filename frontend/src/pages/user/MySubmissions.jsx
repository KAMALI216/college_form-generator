import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Divider,
  IconButton
} from '@mui/material';
import { 
  Visibility as ViewIcon, 
  UploadFile as UploadIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Send as SendIcon
} from '@mui/icons-material';
import api from '../../services/api';

function normalizeSubmission(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch { return {}; }
  }
  return {};
}

const getStatusColor = (status) => {
  if (!status) return 'default';
  switch (status.toUpperCase()) {
    case 'APPROVED': return 'success';
    case 'REJECTED': return 'error';
    case 'CORRECTION_REQUIRED': return 'warning';
    case 'PENDING': return 'primary';
    default: return 'default';
  }
};

const STEPS = ['Submitted', 'Under Verification', 'Approved', 'Certificate Generated'];

function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const { data } = await api.get('/submissions/my');
        const enhancedData = data.map((sub) => ({
          ...sub,
          status: sub.status || 'PENDING',
          appId: `APP-2026-${(1000 + sub.id).toString()}`
        }));
        setSubmissions(enhancedData);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Failed to load submissions');
      }
    };
    loadSubmissions();
  }, []);

  const handleView = (submission) => {
    setSelectedSubmission(submission);
    setDialogOpen(true);
  };

  const getActiveStep = (status) => {
    if (!status) return 0;
    const s = status.toUpperCase();
    if (s === 'PENDING') return 0;
    if (s === 'REJECTED' || s === 'CORRECTION_REQUIRED') return 1;
    if (s === 'APPROVED') return 2;
    return 0;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#1e293b' }}>
            My Applications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage your submitted forms.
          </Typography>
        </Box>
      </Box>

      {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}

      <Paper sx={{ overflow: 'hidden', borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'slate.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Application ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Form Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Submitted Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id} hover>
                <TableCell sx={{ fontWeight: 500, color: 'primary.main' }}>
                  {submission.appId}
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>
                  {submission.formName || submission.form_name}
                </TableCell>
                <TableCell>
                  {(submission.submittedAt || submission.submitted_at) 
                    ? new Date(submission.submittedAt || submission.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                    : '-'}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={submission.status} 
                    size="small" 
                    color={getStatusColor(submission.status)} 
                    variant="flat"
                    sx={{ fontWeight: 600, fontSize: '0.75rem', borderRadius: 1.5 }} 
                  />
                </TableCell>
                <TableCell align="right">
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => handleView(submission)}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                    startIcon={<ViewIcon />}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    You haven't submitted any applications.
                  </Typography>
                  <Button variant="contained" href="#services" sx={{ mt: 1, textTransform: 'none', borderRadius: 2 }}>
                    Browse Forms
                  </Button>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Paper>

      {/* Application Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
              {selectedSubmission?.formName || selectedSubmission?.form_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {selectedSubmission?.appId}
            </Typography>
          </Box>
          <IconButton onClick={() => setDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          
          {/* Tracking Timeline */}
          <Box sx={{ p: 4, bgcolor: 'slate.50' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 3 }}>Application Tracking</Typography>
            <Stepper activeStep={getActiveStep(selectedSubmission?.status)} alternativeLabel>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel error={label === 'Under Verification' && (selectedSubmission?.status === 'REJECTED' || selectedSubmission?.status === 'CORRECTION_REQUIRED')}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Correction UI Mock */}
            {(selectedSubmission?.status?.toUpperCase() === 'CORRECTION_REQUIRED' || selectedSubmission?.status?.toUpperCase() === 'REJECTED') && (
              <Alert severity="error" sx={{ mt: 4, borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>Application Rejected / Correction Required</Typography>
                <Typography variant="body2" paragraph>
                  Admin Comment: "{selectedSubmission?.adminComment || 'Please review and fix your application.'}"
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button variant="contained" color="warning" size="small" startIcon={<UploadIcon />} sx={{ textTransform: 'none' }}>
                    Upload Document
                  </Button>
                  <Button variant="outlined" color="warning" size="small" startIcon={<EditIcon />} sx={{ textTransform: 'none' }}>
                    Edit Application
                  </Button>
                  <Button variant="outlined" color="warning" size="small" startIcon={<SendIcon />} sx={{ textTransform: 'none' }}>
                    Resubmit
                  </Button>
                </Box>
              </Alert>
            )}
          </Box>

          <Divider />

          {/* Submission Data */}
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Submitted Details</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {Object.entries(normalizeSubmission(selectedSubmission?.submission)).map(([key, value]) => (
                <Paper key={key} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'white' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                    {key}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'slate.800', whiteSpace: 'pre-wrap' }}>
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default MySubmissions;