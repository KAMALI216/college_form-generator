import React, { useEffect, useState } from 'react';
import { 
  Alert, Box, Grid, Typography, Button, Tabs, Tab, TextField, 
  InputAdornment, Paper, CircularProgress
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { Search as SearchIcon, AddCircleOutline, TrackChanges, Folder, CardMembership } from '@mui/icons-material';
import api from '../../services/api';
import { getMyStats, getMySubmissions } from '../../services/submissionService';
import { useUserAuth } from '../../context/UserAuthContext';
import FormCard from '../../components/user/FormCard';
import FormDetailsModal from '../../components/user/FormDetailsModal';

function FormList() {
  const { user, profile, loading: authLoading } = useUserAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dynamic Data
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, correction: 0 });

  // Dashboard state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryTab, setCategoryTab] = useState('All');
  
  // Modal state
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [templatesRes, statsData, submissionsData] = await Promise.all([
          api.get('/templates'),
          getMyStats(),
          getMySubmissions()
        ]);
        
        // Enhance templates with mock categories if they don't have one
        const enhancedTemplates = templatesRes.data.map((t) => {
          return {
            ...t,
            category: t.category || 'Other'
          };
        });
        
        setTemplates(enhancedTemplates);
        setStats(statsData);
        setMySubmissions(submissionsData || []);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Unable to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleOpenDetails = (template, directStart = false, appState = 'NOT_STARTED') => {
    if (directStart) {
      if (appState === 'SUBMITTED' || appState === 'APPROVED' || appState === 'REJECTED') {
        navigate('/user/my-submissions');
      } else {
        navigate(`/forms/${template.id}`);
      }
    } else {
      if (appState === 'SUBMITTED' || appState === 'APPROVED' || appState === 'REJECTED') {
        navigate('/user/my-submissions');
      } else {
        setSelectedTemplate(template);
        setIsModalOpen(true);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleStartApplication = (templateId) => {
    navigate(`/forms/${templateId}`);
    handleCloseModal();
  };

  const handleTabChange = (event, newValue) => {
    setCategoryTab(newValue);
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = (template.formName || template.form_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (template.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryTab === 'All' || template.category === categoryTab;
    return matchesSearch && matchesCategory;
  });

  const CATEGORIES = ['All', 'Academic', 'Certificates', 'Student Services', 'Hostel', 'Admissions', 'Examination', 'Finance', 'Administrative', 'Other'];

  const formatNumber = (num) => (num < 10 && num > 0 ? `0${num}` : num.toString());

  // Dynamic summary data
  const summaryStats = [
    { label: 'Total Applications', value: formatNumber(stats.total), color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Pending', value: formatNumber(stats.pending), color: '#eab308', bg: '#fefce8' },
    { label: 'Approved', value: formatNumber(stats.approved), color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Correction Required', value: formatNumber(stats.correction), color: '#ef4444', bg: '#fef2f2' },
  ];

  const quickActions = [
    { label: 'Apply for a Form', icon: <AddCircleOutline />, path: '#services', color: 'primary' },
    { label: 'Track My Application', icon: <TrackChanges />, path: '/user/my-submissions', color: 'secondary' },
    { label: 'My Documents', icon: <Folder />, path: '/user/documents', color: 'info' },
    { label: 'My Certificates', icon: <CardMembership />, path: '/user/certificates', color: 'success' },
  ];

  const getStudentName = () => {
    if (user?.username) return user.username;
    if (user?.email) return user.email.split('@')[0];
    return 'Student';
  };

  return (
    <Box sx={{ pb: 8 }}>
      {/* 1. WELCOME SECTION */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
          Welcome back, {getStudentName()} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your college applications and student services from one place.
        </Typography>
        
        <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'white', borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 4 } }}>
          {authLoading ? (
            <Typography variant="body2" color="text.secondary">Loading profile...</Typography>
          ) : (
            <>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>Register Number</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e3a8a' }}>{profile?.registerNumber || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>Department</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e3a8a' }}>{profile?.department || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>Year / Semester</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
                  {profile?.academicYear ? profile.academicYear : '-'} / {profile?.semester ? profile.semester : '-'}
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>

      {/* 2. APPLICATION SUMMARY */}
      <Box sx={{ mb: 6 }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            Unable to load dashboard statistics. Please try again.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {summaryStats.map((stat, idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <Paper 
                  component={Link}
                  to="/user/my-submissions"
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 4, 
                    border: '1px solid #e2e8f0',
                    bgcolor: stat.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', height: 40, mb: 1 }}>
                      <CircularProgress size={24} sx={{ color: stat.color }} />
                    </Box>
                  ) : (
                    <Typography variant="h3" sx={{ fontWeight: 800, color: stat.color, mb: 1, lineHeight: 1 }}>
                      {stat.value}
                    </Typography>
                  )}
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569' }}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* 3. QUICK ACTIONS */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>
          What do you need today?
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Button
                component={action.path.startsWith('#') ? 'a' : Link}
                href={action.path.startsWith('#') ? action.path : undefined}
                to={!action.path.startsWith('#') ? action.path : undefined}
                variant="outlined"
                color={action.color}
                fullWidth
                startIcon={action.icon}
                sx={{ 
                  py: 2, 
                  justifyContent: 'flex-start', 
                  px: 3, 
                  borderRadius: 3,
                  bgcolor: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderWidth: '2px',
                  '&:hover': { borderWidth: '2px' }
                }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 4. STUDENT SERVICES (Forms List) */}
      <Box id="services">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, mb: 4, gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
              Student Services
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Find and apply for the services you need.
            </Typography>
          </Box>
          <Button 
            component={Link} 
            to="/forms" 
            variant="text" 
            color="primary"
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            View All Services &rarr;
          </Button>
        </Box>

        {/* Error is already shown in the summary section above */}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredTemplates.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'white', borderRadius: 4, border: '1px dashed #cbd5e1' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No services found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or category filter.
            </Typography>
          </Paper>
        ) : (
          <div className="student-services-grid">
            {filteredTemplates.slice(0, 4).map((template) => {
              const userSubmission = mySubmissions.find(sub => sub.formId === template.id);
              return (
                <FormCard 
                  key={template.id}
                  template={template}
                  userSubmission={userSubmission}
                  onViewDetails={(t, directStart, appState) => handleOpenDetails(t, directStart, appState)} 
                />
              );
            })}
          </div>
        )}

        {filteredTemplates.length > 4 && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button 
              component={Link}
              to="/forms"
              variant="outlined"
              size="large"
              sx={{ borderRadius: 2, px: 4, py: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              View All {filteredTemplates.length} Forms
            </Button>
          </Box>
        )}
      </Box>

      {/* 5. FORM DETAILS MODAL */}
      <FormDetailsModal 
        open={isModalOpen}
        onClose={handleCloseModal}
        template={selectedTemplate}
        onStartApplication={handleStartApplication}
      />
    </Box>
  );
}

export default FormList;