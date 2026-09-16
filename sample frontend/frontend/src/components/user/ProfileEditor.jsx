import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Paper,
  Divider,
  IconButton,
  MenuItem
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';


function ProfileEditor({ initialData, onSave, onCancel, showExtractedNotice = false }) {
  const [profile, setProfile] = useState(() => initialData || {});

  const handleChange = (section, field, value) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section, index, field, value) => {
    setProfile(prev => {
      const newArray = [...(prev[section] || [])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [section]: newArray };
    });
  };

  const addArrayItem = (section, defaultItem) => {
    setProfile(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), { ...defaultItem, id: Date.now().toString() }]
    }));
  };

  const removeArrayItem = (section, index) => {
    setProfile(prev => {
      const newArray = [...(prev[section] || [])];
      newArray.splice(index, 1);
      return { ...prev, [section]: newArray };
    });
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
            <TextField fullWidth label="Full Name" size="small" value={profile.personal?.fullName || ''} onChange={(e) => handleChange('personal', 'fullName', e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} size="small" value={profile.personal?.dateOfBirth || ''} onChange={(e) => handleChange('personal', 'dateOfBirth', e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Gender" size="small" value={profile.personal?.gender || ''} onChange={(e) => handleChange('personal', 'gender', e.target.value)}>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* CONTACT INFO */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Contact & Address</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email" type="email" size="small" value={profile.contact?.email || ''} onChange={(e) => handleChange('contact', 'email', e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Phone Number" size="small" value={profile.contact?.phone || ''} onChange={(e) => handleChange('contact', 'phone', e.target.value)} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Address Line 1" size="small" value={profile.address?.address || ''} onChange={(e) => handleChange('address', 'address', e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="City" size="small" value={profile.address?.city || ''} onChange={(e) => handleChange('address', 'city', e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="State" size="small" value={profile.address?.state || ''} onChange={(e) => handleChange('address', 'state', e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="PIN Code" size="small" value={profile.address?.pincode || ''} onChange={(e) => handleChange('address', 'pincode', e.target.value)} />
          </Grid>
        </Grid>
      </Paper>

      {/* EDUCATION */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Education</Typography>
          <Button startIcon={<AddIcon />} size="small" variant="outlined" onClick={() => addArrayItem('education', { institution: '', degree: '', branch: '', startYear: '', endYear: '', cgpa: '' })}>Add</Button>
        </Box>
        {(profile.education || []).map((edu, index) => (
          <Box key={edu.id || index} sx={{ mb: 3, p: 2, bgcolor: 'slate.50', borderRadius: 2, position: 'relative' }}>
            <IconButton size="small" color="error" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => removeArrayItem('education', index)}><DeleteIcon fontSize="small" /></IconButton>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Institution" size="small" value={edu.institution} onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Degree" size="small" value={edu.degree} onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Branch / Specialization" size="small" value={edu.branch} onChange={(e) => handleArrayChange('education', index, 'branch', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="Start Year" size="small" value={edu.startYear} onChange={(e) => handleArrayChange('education', index, 'startYear', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="End Year" size="small" value={edu.endYear} onChange={(e) => handleArrayChange('education', index, 'endYear', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="CGPA / Percentage" size="small" value={edu.cgpa || edu.percentage || ''} onChange={(e) => handleArrayChange('education', index, 'cgpa', e.target.value)} />
              </Grid>
            </Grid>
          </Box>
        ))}
        {(!profile.education || profile.education.length === 0) && <Typography variant="body2" color="text.secondary">No education records added.</Typography>}
      </Paper>

      {/* EXPERIENCE */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Experience</Typography>
          <Button startIcon={<AddIcon />} size="small" variant="outlined" onClick={() => addArrayItem('experience', { company: '', role: '', startDate: '', endDate: '', description: '' })}>Add</Button>
        </Box>
        {(profile.experience || []).map((exp, index) => (
          <Box key={exp.id || index} sx={{ mb: 3, p: 2, bgcolor: 'slate.50', borderRadius: 2, position: 'relative' }}>
            <IconButton size="small" color="error" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => removeArrayItem('experience', index)}><DeleteIcon fontSize="small" /></IconButton>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Company" size="small" value={exp.company} onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Role" size="small" value={exp.role} onChange={(e) => handleArrayChange('experience', index, 'role', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="Start Date" size="small" value={exp.startDate} onChange={(e) => handleArrayChange('experience', index, 'startDate', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="End Date" size="small" value={exp.endDate} onChange={(e) => handleArrayChange('experience', index, 'endDate', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={2} label="Description" size="small" value={exp.description} onChange={(e) => handleArrayChange('experience', index, 'description', e.target.value)} />
              </Grid>
            </Grid>
          </Box>
        ))}
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
