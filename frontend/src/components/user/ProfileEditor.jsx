import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Paper,
  MenuItem
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';

function ProfileEditor({ initialData, onSave, onCancel, showExtractedNotice = false }) {
  const [profile, setProfile] = useState(() => initialData || {});

  const handleChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(profile);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {showExtractedNotice && (
        <Paper sx={{ p: 2, bgcolor: 'info.50', color: 'info.dark', border: '1px solid', borderColor: 'info.main', mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Information extracted from your resume. Please verify before saving.
          </Typography>
        </Paper>
      )}

      {/* PERSONAL INFO */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Personal Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} size="small" value={profile.dob || ''} onChange={(e) => handleChange('dob', e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Gender" size="small" value={profile.gender || ''} onChange={(e) => handleChange('gender', e.target.value)}>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Parent Name" size="small" value={profile.parentName || ''} onChange={(e) => handleChange('parentName', e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Phone Number" size="small" value={profile.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Address" size="small" multiline rows={2} value={profile.address || ''} onChange={(e) => handleChange('address', e.target.value)} />
          </Grid>
        </Grid>
      </Paper>

      {/* ACADEMIC INFO */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Academic Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Register Number" size="small" value={profile.registerNumber || ''} onChange={(e) => handleChange('registerNumber', e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Department" size="small" value={profile.department || ''} onChange={(e) => handleChange('department', e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Semester" type="number" size="small" value={profile.semester || ''} onChange={(e) => handleChange('semester', e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Academic Year (e.g. 2023-2024)" size="small" value={profile.academicYear || ''} onChange={(e) => handleChange('academicYear', e.target.value)} />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} startIcon={<BackIcon />}>
            Back
          </Button>
        )}
        <Button variant="contained" color="primary" onClick={handleSave} startIcon={<SaveIcon />}>
          Save Profile
        </Button>
      </Box>
    </Box>
  );
}

export default ProfileEditor;
