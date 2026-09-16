import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import { 
  CheckCircleOutline as CheckIcon,
  InfoOutlined as InfoIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Assignment as DocsIcon
} from '@mui/icons-material';

function FormDetailsModal({ open, onClose, template, onStartApplication }) {
  if (!template) return null;

  // Mock data for display purposes
  const requiredDocsList = template.requiredDocsList || ['Student ID Card', 'Passport-size photograph'];
  const processingTime = template.processingTime || '2-3 working days';
  const fee = template.fee || 'Free';
  const estimatedTime = template.estimatedTime || '5 minutes';
  const purpose = template.purpose || 'For official college purposes, internships, or scholarships.';

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
            {template.formName || template.form_name}
          </Typography>
          <Chip label={template.category || 'Academic'} size="small" color="primary" variant="outlined" />
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: '16px !important' }}>
        <Typography variant="body1" color="text.secondary" paragraph>
          {template.description || 'Complete this form to apply for the respective student service.'}
        </Typography>

        <Box sx={{ bgcolor: 'blue.50', p: 2, borderRadius: 2, mb: 3, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <InfoIcon color="primary" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>Purpose</Typography>
            <Typography variant="body2" color="primary.dark">{purpose}</Typography>
          </Box>
        </Box>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DocsIcon fontSize="small" color="action" /> Required Documents
        </Typography>
        <List dense sx={{ mb: 2, bgcolor: 'slate.50', borderRadius: 2 }}>
          {requiredDocsList.map((doc, idx) => (
            <ListItem key={idx}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={doc} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Estimated Time to Fill</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon fontSize="small" color="action" /> {estimatedTime}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Processing Time</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{processingTime}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Application Fee</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon fontSize="small" color="action" /> {fee}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
          Cancel
        </Button>
        <Button 
          onClick={() => onStartApplication(template.id)} 
          variant="contained" 
          autoFocus
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 4, boxShadow: 'none' }}
        >
          Start Application
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FormDetailsModal;
