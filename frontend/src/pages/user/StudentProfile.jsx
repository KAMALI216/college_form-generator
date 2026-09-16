import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Divider,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  CloudUpload as UploadIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { calculateProfileCompletion, getMissingProfileFields } from '../../utils/profileCompletion';
import { useUserAuth } from '../../context/UserAuthContext';
import { updateProfileAPI } from '../../services/profileService';
import ProfileEditor from '../../components/user/ProfileEditor';
import ResumeUploader from '../../components/user/ResumeUploader';
import { extractResumeInformation } from '../../services/resumeService';

function StudentProfile() {
  const { user, profile, loading: authLoading, updateProfileContext } = useUserAuth();
  const [completion, setCompletion] = useState(0);
  const [missing, setMissing] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Re-upload state
  const [reuploadOpen, setReuploadOpen] = useState(false);
  const [reuploadStep, setReuploadStep] = useState('upload'); // upload -> extracting -> diff -> save
  const [extractedData, setExtractedData] = useState(null);
  const [reuploadError, setReuploadError] = useState('');

  useEffect(() => {
    if (profile) {
      setCompletion(calculateProfileCompletion(profile));
      setMissing(getMissingProfileFields(profile));
    }
  }, [profile]);

  const handleSaveProfile = async (updatedProfile) => {
    try {
      const savedProfile = await updateProfileAPI(updatedProfile);
      updateProfileContext(savedProfile);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Resume Re-upload Handlers ---
  const handleReuploadSuccess = async (file) => {
    setReuploadStep('extracting');
    setReuploadError('');
    try {
      const data = await extractResumeInformation(file);
      
      // For now, mapping only flat fields to the new profile shape
      const reviewProfile = {
        ...profile,
        phone: data.phone || profile?.phone || '',
        registerNumber: profile?.registerNumber || '',
        department: profile?.department || '',
        semester: profile?.semester || '',
        academicYear: profile?.academicYear || '',
        dob: profile?.dob || '',
        gender: profile?.gender || '',
        parentName: profile?.parentName || '',
        address: profile?.address || ''
      };

      setExtractedData(reviewProfile);
      setReuploadStep('diff');
    } catch (err) {
      console.error(err);
      setReuploadError('Extraction failed. Please try again.');
      setReuploadStep('upload');
    }
  };

  const handleDiffSave = async (updatedProfile) => {
    try {
      const savedProfile = await updateProfileAPI(updatedProfile);
      updateProfileContext(savedProfile);
      setReuploadOpen(false);
      setSuccessMsg('Profile updated from resume successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">Loading profile...</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>Unable to load your profile.</Typography>
        <Typography color="text.secondary">Please try refreshing the page or logging in again.</Typography>
      </Box>
    );
  }

  if (isEditing) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Edit Profile</Typography>
        <ProfileEditor 
          initialData={profile} 
          onSave={handleSaveProfile} 
          onCancel={() => setIsEditing(false)} 
        />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}
      
      {/* Profile Header & Completion */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'flex-start' }}>
        <Avatar sx={{ width: 120, height: 120, bgcolor: 'primary.main', fontSize: 40, fontWeight: 700 }}>
          {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{user?.fullName || user?.username || 'Student'}</Typography>
          <Box sx={{ display: 'flex', gap: 3, mt: 1, flexWrap: 'wrap', color: 'text.secondary' }}>
            {user?.email && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><EmailIcon fontSize="small" /> {user.email}</Box>}
            {profile?.phone && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PhoneIcon fontSize="small" /> {profile.phone}</Box>}
            {profile?.address && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><LocationIcon fontSize="small" /> {profile.address}</Box>}
          </Box>
          <Box sx={{ mt: 3, maxWidth: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Profile Completion</Typography>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>{completion}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={completion} sx={{ height: 8, borderRadius: 4, bgcolor: 'slate.100', '& .MuiLinearProgress-bar': { borderRadius: 4 } }} />
            {missing.length > 0 && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <WarningIcon fontSize="inherit" /> Missing: {missing.slice(0, 3).join(', ')}{missing.length > 3 ? '...' : ''}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 200 }}>
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>Edit Profile</Button>
          <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => { setReuploadStep('upload'); setReuploadOpen(true); }}>Upload Resume</Button>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          {/* Personal Information */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Personal Info</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{profile.dob || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Gender</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{profile.gender || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Parent Name</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{profile.parentName || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Address</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{profile.address || '-'}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          {/* Academic Information */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Academic Info</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Register Number</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{profile.registerNumber || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Department</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{profile.department || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Semester / Year</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {profile.semester ? `Semester ${profile.semester}` : '-'} / {profile.academicYear ? profile.academicYear : '-'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>



      {/* Reupload Modal */}
      <Dialog open={reuploadOpen} onClose={() => { if (reuploadStep !== 'extracting') setReuploadOpen(false); }} maxWidth="md" fullWidth>
        <DialogTitle>Update Profile from Resume</DialogTitle>
        <DialogContent dividers>
          {reuploadStep === 'upload' && (
            <Box>
              {reuploadError && <Alert severity="error" sx={{ mb: 2 }}>{reuploadError}</Alert>}
              <ResumeUploader onUploadSuccess={handleReuploadSuccess} onUploadError={setReuploadError} />
            </Box>
          )}
          {reuploadStep === 'extracting' && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography>Extracting new information...</Typography>
            </Box>
          )}
          {reuploadStep === 'diff' && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                We've extracted information from your new resume. Please review and confirm the changes below.
              </Alert>
              {/* For simplicity, we just use ProfileEditor initialized with the new data, acting as the 'Use New' confirmation */}
              <ProfileEditor initialData={extractedData} onSave={handleDiffSave} onCancel={() => setReuploadOpen(false)} />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default StudentProfile;
