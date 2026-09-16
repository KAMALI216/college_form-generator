import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  Typography, 
  Box, 
  Button, 
  IconButton, 
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Close as CloseIcon, 
  UploadFile as UploadFileIcon, 
  Edit as EditIcon, 
  WarningAmber as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ResumeUploader from './ResumeUploader';
import ProfileEditor from './ProfileEditor';
import { extractResumeInformation } from '../../services/resumeService';
import { updateProfile } from '../../services/profileService';

function ProfileOnboardingModal({ open, onClose }) {
  const navigate = useNavigate();
  // flow steps: 'intro' -> 'upload' -> 'extracting' -> 'review' -> 'manual'
  const [step, setStep] = useState('intro');
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState('');

  const handleManualEntry = () => {
    setExtractedData({});
    setStep('manual');
  };

  const handleUploadClick = () => {
    setStep('upload');
  };

  const handleUploadSuccess = async (file) => {
    setStep('extracting');
    setError('');
    try {
      const data = await extractResumeInformation(file);
      setExtractedData(data);
      setStep('review');
    } catch (err) {
      setError(err.message || 'Failed to extract resume information. Please try again or enter details manually.');
      setStep('upload');
    }
  };

  const handleUploadError = (errorMsg) => {
    setError(errorMsg);
  };

  const handleSaveProfile = async (profileData) => {
    try {
      const updated = await updateProfile(profileData);
      // Let the parent know we completed
      if (onClose) onClose();
      // Optional: reload the page or navigate
      navigate('/user/dashboard', { replace: true });
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="md" 
      fullWidth 
      disableEscapeKeyDown={step === 'extracting'}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' && step !== 'extracting') onClose();
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {step === 'intro' && 'Complete Your Profile'}
          {step === 'upload' && 'Upload Resume'}
          {step === 'extracting' && 'Extracting Information'}
          {step === 'review' && 'Review Your Profile'}
          {step === 'manual' && 'Enter Profile Details'}
        </Typography>
        {step !== 'extracting' && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {step === 'intro' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ bgcolor: 'blue.50', display: 'inline-flex', p: 3, borderRadius: '50%', mb: 3 }}>
              <UploadFileIcon color="primary" sx={{ fontSize: 64 }} />
            </Box>
            <Typography variant="h6" gutterBottom>
              Complete your profile once and we'll automatically fill your basic information in future forms.
            </Typography>
            <Typography color="text.secondary" paragraph sx={{ mb: 4 }}>
              You can upload your resume for automatic extraction or enter your details manually.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: 'auto' }}>
              <Button 
                variant="contained" 
                size="large" 
                startIcon={<UploadFileIcon />}
                onClick={handleUploadClick}
              >
                Upload Resume
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                startIcon={<EditIcon />}
                onClick={handleManualEntry}
              >
                Enter Details Manually
              </Button>
              <Button 
                variant="text" 
                color="inherit" 
                onClick={onClose}
              >
                Complete Later
              </Button>
            </Box>
          </Box>
        )}

        {step === 'upload' && (
          <Box sx={{ py: 2 }}>
            <Alert severity="info" sx={{ mb: 4 }}>
              Uploading your resume saves time! We'll extract your personal info, education, and experience to build your profile automatically.
            </Alert>
            <ResumeUploader 
              onUploadSuccess={handleUploadSuccess} 
              onUploadError={handleUploadError} 
            />
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button variant="text" onClick={() => setStep('intro')}>Back</Button>
            </Box>
          </Box>
        )}

        {step === 'extracting' && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom color="primary.main">
              Extracting information...
            </Typography>
            <Typography color="text.secondary">
              Our AI is reading your resume. This will just take a moment.
            </Typography>
          </Box>
        )}

        {(step === 'review' || step === 'manual') && (
          <ProfileEditor 
            initialData={extractedData} 
            showExtractedNotice={step === 'review'}
            onSave={handleSaveProfile}
            onCancel={() => setStep(step === 'review' ? 'upload' : 'intro')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ProfileOnboardingModal;
