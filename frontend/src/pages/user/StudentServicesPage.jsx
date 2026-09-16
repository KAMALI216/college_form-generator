import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Tabs, Tab, CircularProgress, Paper } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getMySubmissions } from '../../services/submissionService';
import FormCard from '../../components/user/FormCard';
import FormDetailsModal from '../../components/user/FormDetailsModal';

function StudentServicesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryTab, setCategoryTab] = useState('All');
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [templatesRes, submissionsData] = await Promise.all([
          api.get('/templates'),
          getMySubmissions()
        ]);
        
        const enhancedTemplates = templatesRes.data.map((t) => {
          return {
            ...t,
            category: t.category || 'Other'
          };
        });
        
        setTemplates(enhancedTemplates);
        setMySubmissions(submissionsData || []);
      } catch (requestError) {
        console.error('Failed to load student services', requestError);
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

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = (template.formName || template.form_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (template.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryTab === 'All' || template.category === categoryTab;
    return matchesSearch && matchesCategory;
  });

  const CATEGORIES = ['All', 'Academic', 'Certificates', 'Student Services', 'Hostel', 'Admissions', 'Examination', 'Finance', 'Administrative', 'Other'];

  return (
    <Box sx={{ pb: 8, maxWidth: '1200px', mx: 'auto', mt: 4 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>
          Student Services
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
          Apply for college forms and student services from one place.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
        <TextField
          placeholder="Search forms..."
          size="medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            sx: { borderRadius: 3, bgcolor: 'white', minWidth: { xs: '100%', md: '400px' } }
          }}
        />
        <Tabs 
          value={categoryTab} 
          onChange={(e, v) => setCategoryTab(v)} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' } }}
        >
          {CATEGORIES.map(cat => <Tab label={cat} value={cat} key={cat} />)}
        </Tabs>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>
          Available Forms
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography color="text.secondary">Loading student services...</Typography>
        </Box>
      ) : filteredTemplates.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'white', borderRadius: 4, border: '1px dashed #cbd5e1' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery ? "No forms found." : "No student services are currently available."}
          </Typography>
          {searchQuery && (
            <Typography variant="body2" color="text.secondary">
              Try a different search term.
            </Typography>
          )}
        </Paper>
      ) : (
        <div className="student-services-grid">
          {filteredTemplates.map((template) => {
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

      <FormDetailsModal 
        open={isModalOpen}
        onClose={handleCloseModal}
        template={selectedTemplate}
        onStartApplication={handleStartApplication}
      />
    </Box>
  );
}

export default StudentServicesPage;
