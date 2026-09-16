import React from 'react';
import { Card, CardContent, Typography, Box, Button, Chip, Divider } from '@mui/material';
import { 
  AccessTime as TimeIcon, 
  AttachMoney as MoneyIcon, 
  FileCopy as DocsIcon,
  Description as FormIcon,
  School as AcademicIcon,
  Home as HostelIcon,
  EmojiEvents as ScholarshipIcon,
  Badge as CertIcon,
  AccountCircle as UserIcon,
  WarningAmber as DefaultIcon
} from '@mui/icons-material';

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'academic': return <AcademicIcon color="primary" />;
    case 'hostel': return <HostelIcon color="secondary" />;
    case 'scholarships': return <ScholarshipIcon color="warning" />;
    case 'certificates': return <CertIcon color="success" />;
    case 'student services': return <UserIcon color="info" />;
    default: return <FormIcon color="primary" />;
  }
};

const getCategoryColor = (category) => {
  switch (category?.toLowerCase()) {
    case 'academic': return 'primary';
    case 'hostel': return 'secondary';
    case 'scholarships': return 'warning';
    case 'certificates': return 'success';
    case 'student services': return 'info';
    default: return 'default';
  }
};

function FormCard({ template, onViewDetails }) {
  // Mock data for new UI requirements that might not be in template yet
  const category = template.category || 'Academic';
  const estimatedTime = template.estimatedTime || '5 mins';
  const requiredDocs = template.requiredDocs || 0;
  const fee = template.fee || 'Free';
  const status = template.status || null; // e.g. "Submitted", "Draft"

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }
      }}
      className="border border-slate-200 rounded-xl overflow-hidden"
      elevation={0}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: '12px', 
              backgroundColor: `${getCategoryColor(category)}.50`,
              display: 'flex'
            }}>
              {getCategoryIcon(category)}
            </Box>
            <Chip 
              label={category} 
              size="small" 
              color={getCategoryColor(category)} 
              variant="outlined"
              sx={{ fontWeight: 500, fontSize: '0.75rem' }} 
            />
          </Box>
          {status && (
            <Chip 
              label={status} 
              size="small" 
              color={status === 'Draft' ? 'default' : 'success'} 
              sx={{ fontWeight: 600, fontSize: '0.75rem' }} 
            />
          )}
        </Box>

        <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1, color: 'slate.800', lineHeight: 1.3 }}>
          {template.formName || template.form_name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {template.description || 'Application form for student services.'}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <TimeIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>{estimatedTime}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <MoneyIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>{fee}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <DocsIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>{requiredDocs} docs</Typography>
          </Box>
        </Box>
      </CardContent>
      
      <Divider />
      
      <Box sx={{ p: 2, display: 'flex', gap: 2, bgcolor: 'slate.50' }}>
        <Button 
          variant="outlined" 
          fullWidth
          onClick={() => onViewDetails(template)}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
        >
          View Details
        </Button>
        {!status ? (
          <Button 
            variant="contained" 
            fullWidth
            onClick={() => onViewDetails(template, true)}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
          >
            Apply Now
          </Button>
        ) : (
          <Button 
            variant="contained" 
            fullWidth
            color="success"
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
          >
            Track Status
          </Button>
        )}
      </Box>
    </Card>
  );
}

export default FormCard;
