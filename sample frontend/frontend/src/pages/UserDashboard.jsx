import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Container, Grid, Typography, Card, CardContent, Button, 
  CircularProgress, Stack, Chip, Divider, Paper, Alert 
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassIcon,
  ErrorOutline as ErrorIcon,
  Description as FormIcon,
  ArrowForward as ArrowIcon,
  WarningAmber as WarningAmberIcon
} from '@mui/icons-material';
import { getProfile } from '../services/profileService';
import { getMyStats, getMySubmissions } from '../services/submissionService';
import { getTemplates } from '../services/templateService';
import StudentHeader from '../components/user/StudentHeader';
import ProfileOnboardingModal from '../components/user/ProfileOnboardingModal';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, correction: 0 });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [availableForms, setAvailableForms] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileData, statsData, submissionsData, formsData] = await Promise.all([
          getProfile(),
          getMyStats(),
          getMySubmissions(),
          getTemplates()
        ]);
        
        setProfile(profileData);
        if (profileData && !profileData.profileCompleted) {
          setShowOnboarding(true);
        }

        setStats(statsData || { total: 0, pending: 0, approved: 0, correction: 0 });
        setRecentSubmissions(submissionsData.slice(0, 3) || []);
        setAvailableForms(formsData.slice(0, 3) || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'APPROVED': return 'success';
      case 'CORRECTION_REQUIRED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <StudentHeader mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      {showOnboarding && profile && (
        <ProfileOnboardingModal 
          open={showOnboarding} 
          onClose={() => setShowOnboarding(false)} 
          profile={profile} 
          onComplete={(updatedProfile) => {
            setProfile(updatedProfile);
            setShowOnboarding(false);
          }}
        />
      )}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        
        {/* STUDENT INFO HEADER */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="700" color="text.primary" gutterBottom>
            Welcome back, {profile?.user?.fullName || profile?.user?.username || 'Student'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your applications, profile, and documents from your personal portal.
          </Typography>
        </Box>

        {/* PROFILE COMPLETION ALERT */}
        {profile && !profile.profileCompleted && (
          <Alert 
            severity="info" 
            sx={{ mb: 4, borderRadius: 2, alignItems: 'center' }}
            action={
              <Button color="inherit" size="small" variant="outlined" onClick={() => navigate('/user/profile')}>
                Complete Profile
              </Button>
            }
          >
            <strong>Your profile is incomplete.</strong> Please provide the missing personal details to fully use the portal.
          </Alert>
        )}

        {/* ACADEMIC INFO CARD */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
            Academic Information (Provided by College)
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Register Number</Typography>
              <Typography variant="body1" fontWeight="600">{profile?.registerNumber || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Department</Typography>
              <Typography variant="body1" fontWeight="600">{profile?.department || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Year / Semester</Typography>
              <Typography variant="body1" fontWeight="600">
                {profile?.year ? `Year ${profile.year}` : '-'} / {profile?.semester ? `Sem ${profile.semester}` : '-'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* KPI STATS */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" fontWeight="500">Total Applications</Typography>
                    <Typography variant="h4" fontWeight="800" sx={{ mt: 1, color: '#0f172a' }}>{stats.total}</Typography>
                  </Box>
                  <Box sx={{ p: 1, bgcolor: '#f1f5f9', borderRadius: 2 }}><AssignmentIcon sx={{ color: '#475569' }} /></Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" fontWeight="500">Pending</Typography>
                    <Typography variant="h4" fontWeight="800" sx={{ mt: 1, color: '#d97706' }}>{stats.pending}</Typography>
                  </Box>
                  <Box sx={{ p: 1, bgcolor: '#fef3c7', borderRadius: 2 }}><HourglassIcon sx={{ color: '#d97706' }} /></Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" fontWeight="500">Approved</Typography>
                    <Typography variant="h4" fontWeight="800" sx={{ mt: 1, color: '#059669' }}>{stats.approved}</Typography>
                  </Box>
                  <Box sx={{ p: 1, bgcolor: '#d1fae5', borderRadius: 2 }}><CheckCircleIcon sx={{ color: '#059669' }} /></Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" fontWeight="500">Correction Required</Typography>
                    <Typography variant="h4" fontWeight="800" sx={{ mt: 1, color: '#dc2626' }}>{stats.correction}</Typography>
                  </Box>
                  <Box sx={{ p: 1, bgcolor: '#fee2e2', borderRadius: 2 }}><WarningAmberIcon sx={{ color: '#dc2626' }} /></Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* AVAILABLE FORMS */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="700">Available Forms</Typography>
              <Button size="small" onClick={() => navigate('/forms')} endIcon={<ArrowIcon fontSize="small" />} sx={{ textTransform: 'none' }}>
                View All
              </Button>
            </Box>
            <Stack spacing={2}>
              {availableForms.map((form) => (
                <Paper key={form.id} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s', '&:hover': { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderColor: '#cbd5e1' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ bgcolor: '#eff6ff', p: 1.5, borderRadius: 2, color: '#2563eb' }}>
                      <FormIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600">{form.formName}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                        {form.description || 'Application form'}
                      </Typography>
                    </Box>
                  </Box>
                  <Button variant="contained" size="small" sx={{ borderRadius: 2, textTransform: 'none', px: 2 }} onClick={() => navigate(`/forms/${form.id}`)}>
                    Apply
                  </Button>
                </Paper>
              ))}
              {availableForms.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #cbd5e1', bgcolor: 'transparent' }}>
                  <Typography variant="body2" color="text.secondary">No forms are currently open for submission.</Typography>
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* RECENT SUBMISSIONS */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="700">Recent Applications</Typography>
              <Button size="small" onClick={() => navigate('/user/my-submissions')} endIcon={<ArrowIcon fontSize="small" />} sx={{ textTransform: 'none' }}>
                Track All
              </Button>
            </Box>
            <Stack spacing={2}>
              {recentSubmissions.map((sub) => (
                <Paper key={sub.id} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="600">{sub.formName}</Typography>
                    <Chip 
                      label={sub.status || 'PENDING'} 
                      size="small" 
                      color={getStatusColor(sub.status)}
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                  </Typography>
                  {sub.status === 'CORRECTION_REQUIRED' && (
                    <Box sx={{ p: 1.5, bgcolor: '#fee2e2', borderRadius: 2, mb: 2, display: 'flex', gap: 1 }}>
                      <ErrorIcon fontSize="small" color="error" />
                      <Typography variant="body2" color="error">
                        {sub.adminComment || "Please review and fix your application."}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={() => navigate(`/user/my-submissions/${sub.id}`)} sx={{ textTransform: 'none', fontWeight: 600 }}>
                      View Details
                    </Button>
                  </Box>
                </Paper>
              ))}
              {recentSubmissions.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #cbd5e1', bgcolor: 'transparent' }}>
                  <Typography variant="body2" color="text.secondary">You haven't submitted any applications yet.</Typography>
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserDashboard;
