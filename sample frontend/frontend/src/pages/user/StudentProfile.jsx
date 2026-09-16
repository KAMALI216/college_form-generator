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
import { getProfile, updateProfile } from '../../services/profileService';
import { calculateProfileCompletion, getMissingProfileFields } from '../../utils/profileCompletion';
import ProfileEditor from '../../components/user/ProfileEditor';
import ResumeUploader from '../../components/user/ResumeUploader';
import { extractResumeInformation } from '../../services/resumeService';

function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [missing, setMissing] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Re-upload state
  const [reuploadOpen, setReuploadOpen] = useState(false);
  const [reuploadStep, setReuploadStep] = useState('upload'); // upload -> extracting -> diff -> save
  const [extractedData, setExtractedData] = useState(null);
  const [reuploadError, setReuploadError] = useState('');

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      setCompletion(calculateProfileCompletion(data));
      setMissing(getMissingProfileFields(data));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (updatedProfile) => {
    try {
      await updateProfile(updatedProfile);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully.');
      await loadProfile();
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
      console.log("EXTRACTED PROFILE FROM RESUME:", data);

      const reviewProfile = {
        ...profile,
        personal: {
          ...profile?.personal,
          fullName: data.fullName || profile?.personal?.fullName || '',
          dateOfBirth: profile?.personal?.dateOfBirth || '',
          gender: profile?.personal?.gender || ''
        },
        contact: {
          ...profile?.contact,
          email: data.email || profile?.contact?.email || '',
          phone: data.phone || profile?.contact?.phone || ''
        },
        address: {
          ...profile?.address
        },
        links: {
          ...profile?.links,
          linkedin: data.linkedin || profile?.links?.linkedin || '',
          github: data.github || profile?.links?.github || '',
          portfolio: data.portfolio || profile?.links?.portfolio || ''
        },
        skills: Array.isArray(data.skills) && data.skills.length > 0
          ? data.skills
          : profile?.skills || [],
        education: profile?.education || [],
        experience: profile?.experience || [],
        projects: profile?.projects || [],
        certifications: profile?.certifications || [],
        achievements: profile?.achievements || []
      };

      console.log("PROFILE SENT TO REVIEW FORM:", reviewProfile);
      console.log("REVIEW FULL NAME:", reviewProfile?.personal?.fullName);
      console.log("REVIEW EMAIL:", reviewProfile?.contact?.email);
      console.log("REVIEW PHONE:", reviewProfile?.contact?.phone);
      console.log("REVIEW SKILLS:", reviewProfile?.skills);

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
      await updateProfile(updatedProfile);
      setReuploadOpen(false);
      setSuccessMsg('Profile updated from resume successfully.');
      await loadProfile();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>Your profile isn't set up yet.</Typography>
        <Typography color="text.secondary">Complete your profile once to automatically fill your future applications.</Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>Please log out and log in again to trigger the setup, or refresh the page.</Typography>
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
          {profile.personal?.fullName?.charAt(0) || 'U'}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{profile.personal?.fullName || 'Anonymous User'}</Typography>
          <Box sx={{ display: 'flex', gap: 3, mt: 1, flexWrap: 'wrap', color: 'text.secondary' }}>
            {profile.contact?.email && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><EmailIcon fontSize="small" /> {profile.contact.email}</Box>}
            {profile.contact?.phone && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PhoneIcon fontSize="small" /> {profile.contact.phone}</Box>}
            {profile.address?.city && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><LocationIcon fontSize="small" /> {profile.address.city}, {profile.address.state}</Box>}
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
        <Grid item xs={12} md={8}>
          {/* Education */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon color="primary" /> Education
            </Typography>
            {(profile.education || []).length === 0 ? (
              <Typography color="text.secondary">No education details added.</Typography>
            ) : (
              (profile.education || []).map((edu, idx) => (
                <Box key={idx} sx={{ mb: idx !== profile.education.length - 1 ? 3 : 0, pb: idx !== profile.education.length - 1 ? 3 : 0, borderBottom: idx !== profile.education.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{edu.degree} in {edu.branch}</Typography>
                  <Typography variant="body2" color="text.secondary">{edu.institution}</Typography>
                  <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">{edu.startYear} - {edu.endYear}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>CGPA: {edu.cgpa || edu.percentage}</Typography>
                  </Box>
                </Box>
              ))
            )}
          </Paper>

          {/* Experience */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon color="primary" /> Experience
            </Typography>
            {(profile.experience || []).length === 0 ? (
              <Typography color="text.secondary">No experience details added.</Typography>
            ) : (
              (profile.experience || []).map((exp, idx) => (
                <Box key={idx} sx={{ mb: idx !== profile.experience.length - 1 ? 3 : 0, pb: idx !== profile.experience.length - 1 ? 3 : 0, borderBottom: idx !== profile.experience.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{exp.role}</Typography>
                  <Typography variant="body2" color="text.secondary">{exp.company}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{exp.startDate} - {exp.endDate}</Typography>
                  <Typography variant="body2">{exp.description}</Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {/* Skills */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Skills</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(profile.skills || []).length === 0 ? (
                <Typography color="text.secondary">No skills added.</Typography>
              ) : (
                (profile.skills || []).map((skill, idx) => (
                  <Chip key={idx} label={skill} size="small" sx={{ bgcolor: 'blue.50', color: 'blue.800', fontWeight: 600 }} />
                ))
              )}
            </Box>
          </Paper>

          {/* Personal Information */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Personal Info</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{profile.personal?.dateOfBirth || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Gender</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{profile.personal?.gender || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Address</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {profile.address?.address ? `${profile.address.address}, ${profile.address.city}, ${profile.address.state} - ${profile.address.pincode}` : '-'}
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
