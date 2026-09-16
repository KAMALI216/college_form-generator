import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  Divider,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { getSubmissionById, updateSubmissionStatus } from '../../services/adminService';

function SubmissionVerification() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const data = await getSubmissionById(id);
        setSubmission(data);
      } catch (error) {
        console.error('Failed to fetch submission', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id]);

  const handleApprove = async () => {
    if (window.confirm('Are you sure you want to approve this application?')) {
      try {
        await updateSubmissionStatus(id, 'APPROVED');
        setSubmission(prev => ({ ...prev, status: 'APPROVED' }));
      } catch (error) {
        alert('Failed to approve application');
      }
    }
  };

  const handleReject = async () => {
    try {
      await updateSubmissionStatus(id, 'REJECTED', rejectionReason);
      setSubmission(prev => ({ ...prev, status: 'REJECTED', adminComment: rejectionReason }));
      setRejectDialogOpen(false);
    } catch (error) {
      alert('Failed to reject application');
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!submission) {
    return (
      <Container sx={{ py: 10 }}>
        <Typography variant="h5" color="error">Submission not found.</Typography>
        <Button onClick={() => navigate('/admin/submissions')} sx={{ mt: 2 }}>Back to Submissions</Button>
      </Container>
    );
  }

  const formData = submission.formData || {};
  const formSchema = submission.formSchema || {};
  const student = submission.student || {};
  const statusColor = submission.status === 'APPROVED' ? 'success' : submission.status === 'REJECTED' ? 'error' : 'warning';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/admin/submissions')}
        sx={{ mb: 2, textTransform: 'none', color: 'text.secondary' }}
      >
        Back to Submissions
      </Button>

      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="overline" color="text.secondary" fontWeight={600}>
              FORM:
            </Typography>
            <Typography variant="h5" fontWeight="700" color="primary.main" gutterBottom>
              {submission.form?.title || 'Unknown Form'}
            </Typography>
            
            <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ mt: 2, display: 'block' }}>
              Student:
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {student.fullName || 'Unknown Student'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {student.email || 'No email provided'}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 4 }} />
        
        {formSchema.sections && formSchema.sections.map((section, idx) => (
          <Box key={idx} sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#1e293b' }}>
              {section.heading || 'Details'}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              {section.fields && section.fields.map((field, fieldIdx) => {
                const label = field.label;
                const value = formData[label];
                return (
                  <Box key={fieldIdx} sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {label}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                      {value !== undefined && value !== null && value !== '' ? value.toString() : '—'}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            <Divider sx={{ mt: 4 }} />
          </Box>
        ))}

        <Box sx={{ mb: 4 }}>
            <Typography variant="overline" color="text.secondary" fontWeight={600}>
              Application Status
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip label={submission.status} color={statusColor} sx={{ fontWeight: 600 }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Submitted on: {new Date(submission.submittedAt).toLocaleString()}
            </Typography>
        </Box>

        {submission.adminComment && (
          <Box sx={{ mt: 4, p: 2, bgcolor: '#fef2f2', borderRadius: 1, border: '1px solid #fca5a5' }}>
            <Typography variant="subtitle2" color="error" fontWeight="600">Admin Comment / Rejection Reason</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{submission.adminComment}</Typography>
          </Box>
        )}

        {submission.status !== 'APPROVED' && submission.status !== 'REJECTED' && (
          <Box sx={{ mt: 6, display: 'flex', gap: 2, justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', pt: 3 }}>
            <Button
              variant="outlined"
              color="error"
              size="large"
              startIcon={<CloseIcon />}
              onClick={() => setRejectDialogOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600, px: 4 }}
            >
              Reject Application
            </Button>
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<CheckIcon />}
              onClick={handleApprove}
              sx={{ textTransform: 'none', fontWeight: 600, px: 4, boxShadow: 'none' }}
            >
              Approve Application
            </Button>
          </Box>
        )}
      </Paper>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: 'error.main' }}>Reject Application</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this application. The student will be able to see this reason.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error" sx={{ textTransform: 'none', boxShadow: 'none' }} disabled={!rejectionReason.trim()}>
            Reject Application
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default SubmissionVerification;
