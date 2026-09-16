import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Description as FormIcon,
  CloudUpload as UploadIcon,
  Send as SubmitIcon,
  HelpOutline as HelpIcon,
  WarningAmber as WarningIcon,
  CheckCircleOutline as CheckIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as OfficeIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';

function HelpSection({ title, icon, children }) {
  return (
    <Box className="help-card" sx={{ borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white', p: 0, height: 'auto' }}>
      <Box className="help-card-content" sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ p: 1.5, bgcolor: 'primary.50', borderRadius: 2, color: 'primary.main', display: 'flex' }}>
            {icon}
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'slate.800' }}>
            {title}
          </Typography>
        </Box>
        {children}
      </Box>
    </Box>
  );
}

function StudentHelp() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      q: 'Can I edit my form after submitting?',
      a: 'Editing a submitted form depends on its status. If the status is "Draft" or "Correction Required," you can edit it. Once "Under Verification" or "Approved," it cannot be edited unless requested by an administrator.'
    },
    {
      q: 'Can I submit the same form multiple times?',
      a: 'Usually, you can only submit one active application per form type (e.g., one Hostel Application per semester). If your previous application was rejected, you might be allowed to submit a new one.'
    },
    {
      q: 'What happens if I close the page before submitting?',
      a: 'If the form supports "Save as Draft," your progress will be saved automatically or when you click the Save button. Otherwise, unsaved information will be lost. Always check for a Draft indicator.'
    },
    {
      q: 'Can I upload a new document?',
      a: 'Yes, in the "My Documents" section, you can upload and manage your documents. If an application requires a correction due to a document issue, you can re-upload it directly from the application tracking page.'
    },
    {
      q: 'How do I know that my form was submitted?',
      a: 'You will see a success message on the screen, and the application will appear in your "My Submissions" list with the status "Submitted".'
    },
    {
      q: 'Where can I see my submitted forms?',
      a: 'Navigate to "My Submissions" from the top menu or the quick actions on your dashboard.'
    },
    {
      q: 'What should I do if the form isn\'t loading?',
      a: '1. Refresh the page.\n2. Check your internet connection.\n3. Log out and log in again.\n4. If the problem continues, contact the administrator.'
    }
  ];

  const filteredFaqs = faqs.filter(
    faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
           faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ pb: 8 }}>
      {/* 1. Welcome / Quick Introduction */}
      <Box sx={{ textAlign: 'center', mb: 8, mt: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>
          How can we help you?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          Find answers about browsing forms, filling applications, uploading documents, and checking your submissions.
        </Typography>
        
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <TextField
            fullWidth
            placeholder="Search help articles (e.g., How do I upload a document?)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
              sx: { borderRadius: 3, bgcolor: 'white', '& fieldset': { borderColor: '#cbd5e1' } }
            }}
          />
        </Box>
      </Box>

      {/* Quick Help Links */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <FormIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Forms</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <UploadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Uploads</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <SubmitIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Submit</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 2. Getting Started */}
      <HelpSection title="Getting Started" icon={<HelpIcon />}>
        <Grid container spacing={3}>
          {[
            { step: '1', title: 'Choose Form', desc: 'Browse available forms and select the application you want.' },
            { step: '2', title: 'Fill Details', desc: 'Enter required info carefully. Fields marked with * are mandatory.' },
            { step: '3', title: 'Review', desc: 'Check all information before submitting to ensure accuracy.' },
            { step: '4', title: 'Submit', desc: 'Click Submit Application after reviewing your information.' }
          ].map((s, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Box sx={{ position: 'relative', p: 3, bgcolor: 'slate.50', borderRadius: 3, height: '100%' }}>
                <Typography variant="h3" sx={{ color: 'blue.100', position: 'absolute', top: 10, right: 20, fontWeight: 900, zIndex: 0 }}>
                  {s.step}
                </Typography>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{s.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{s.desc}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </HelpSection>

      <div className="help-grid">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 3. Filling Out Forms */}
          <HelpSection title="Filling Forms" icon={<FormIcon />}>
            <Typography variant="body2" paragraph>
              Our forms dynamically adjust to what is needed. Here are common field types:
            </Typography>
            <Box sx={{ bgcolor: 'slate.50', borderRadius: 2, p: 2, mb: 2 }}>
              <Grid container spacing={1}>
                {[
                  ['Text', 'Enter names, addresses, etc.'],
                  ['Number', 'Enter numerical values'],
                  ['Date', 'Select a date'],
                  ['Email', 'Enter a valid email address'],
                  ['Phone', 'Enter your mobile number'],
                  ['Dropdown', 'Select one option'],
                  ['Radio Button', 'Select one option'],
                  ['Checkbox', 'Select one or more options']
                ].map(([type, exp], i) => (
                  <React.Fragment key={i}>
                    <Grid item xs={4}><Typography variant="body2" fontWeight={600}>{type}</Typography></Grid>
                    <Grid item xs={8}><Typography variant="body2" color="text.secondary">{exp}</Typography></Grid>
                  </React.Fragment>
                ))}
              </Grid>
            </Box>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.dark', bgcolor: 'warning.50', p: 1.5, borderRadius: 2 }}>
              <WarningIcon fontSize="small" /> 
              Tip: Fields marked with * are required and must be completed before submission.
            </Typography>
          </HelpSection>

          {/* 5. Common Form Errors */}
          <HelpSection title="Common Errors" icon={<WarningIcon />}>
            <List disablePadding>
              {[
                { err: 'This field is required', sol: 'You haven\'t entered information in a mandatory field. Fill in the highlighted field.' },
                { err: 'Invalid email', sol: 'The email format is incorrect (e.g., student@gmail.com).' },
                { err: 'Invalid phone number', sol: 'Check that your mobile number contains the required number of digits.' },
                { err: 'Please select an option', sol: 'A required dropdown/radio field hasn\'t been selected.' },
                { err: 'File upload failed', sol: 'Check file format, file size, internet connection, or if the file is corrupted.' }
              ].map((item, i) => (
                <ListItem key={i} sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 700, mb: 0.5 }}>"{item.err}"</Typography>
                  <Typography variant="body2" color="text.secondary">{item.sol}</Typography>
                </ListItem>
              ))}
            </List>
          </HelpSection>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 4. Document Upload Help */}
          <HelpSection title="Document Upload" icon={<UploadIcon />}>
            <Typography variant="body2" paragraph>
              Make sure your document is clear and readable before uploading.
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Common Examples:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {['Aadhaar Card', 'Mark Sheets', 'Transfer Certificate', 'Community Certificate', 'Income Certificate', 'Passport-size photo'].map(doc => (
                <Chip key={doc} label={doc} size="small" variant="outlined" />
              ))}
            </Box>
            <Box sx={{ bgcolor: 'blue.50', p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="primary.dark" sx={{ fontWeight: 700, mb: 1 }}>Typical Restrictions</Typography>
              <Typography variant="body2" color="primary.main">
                • Accepted Formats: PDF, JPG, PNG<br/>
                • Maximum size: 5 MB<br/>
                *(Check the specific form for exact restrictions)*
              </Typography>
            </Box>
          </HelpSection>

          {/* 7. Submission Status */}
          <HelpSection title="Submission Status" icon={<CheckIcon />}>
            <Typography variant="body2" paragraph>Understand what your application status means:</Typography>
            <List dense disablePadding>
              {[
                { status: 'Submitted', desc: 'Your application has been successfully submitted.', color: 'primary' },
                { status: 'Under Review', desc: 'The institution/admin is reviewing your application.', color: 'info' },
                { status: 'Approved', desc: 'Your application has been accepted.', color: 'success' },
                { status: 'Correction Required', desc: 'You need to update info or re-upload a document.', color: 'warning' },
                { status: 'Rejected', desc: 'Your application was not accepted.', color: 'error' },
                { status: 'Draft', desc: 'Your application has not yet been submitted.', color: 'default' },
              ].map((s, i) => (
                <ListItem key={i} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Chip label={s.status} size="small" color={s.color} sx={{ fontSize: '0.65rem', height: 20 }} />
                  </ListItemIcon>
                  <ListItemText primary={s.desc} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItem>
              ))}
            </List>
          </HelpSection>
        </Box>
      </div>

      {/* 10. Frequently Asked Questions */}
      <Box sx={{ mb: 6, mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'slate.800', mb: 3 }}>
          Frequently Asked Questions
        </Typography>
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <Accordion key={index} elevation={0} sx={{ border: '1px solid #e2e8f0', mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>{faq.q}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{faq.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography color="text.secondary">No FAQs found matching your search.</Typography>
        )}
      </Box>

      {/* 9. Account & Security / Support */}
      <div className="help-grid">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <HelpSection title="Account & Security" icon={<SecurityIcon />}>
            <List dense disablePadding>
              <ListItem sx={{ px: 0 }}><ListItemIcon sx={{ minWidth: 32 }}><CheckIcon color="success" fontSize="small"/></ListItemIcon><ListItemText primary="Never share your password or login credentials." /></ListItem>
              <ListItem sx={{ px: 0 }}><ListItemIcon sx={{ minWidth: 32 }}><CheckIcon color="success" fontSize="small"/></ListItemIcon><ListItemText primary="Always log out when using a shared computer." /></ListItem>
              <ListItem sx={{ px: 0 }}><ListItemIcon sx={{ minWidth: 32 }}><CheckIcon color="success" fontSize="small"/></ListItemIcon><ListItemText primary="Use an active email address for communications." /></ListItem>
              <ListItem sx={{ px: 0 }}><ListItemIcon sx={{ minWidth: 32 }}><CheckIcon color="success" fontSize="small"/></ListItemIcon><ListItemText primary="Contact admin immediately if you suspect unauthorized access." /></ListItem>
            </List>
          </HelpSection>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box className="help-card" sx={{ borderRadius: 4, border: '2px solid', borderColor: 'primary.main', bgcolor: 'primary.50', p: 0, height: 'auto' }}>
            <Box className="help-card-content" sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <HelpIcon color="primary" sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>Need More Help?</Typography>
                  <Typography variant="body2" color="text.secondary">Contact Administrator</Typography>
                </Box>
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', gap: 1, color: 'slate.700' }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2">support@college.edu</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', gap: 1, color: 'slate.700' }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">+91 1800 123 4567</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', gap: 1, color: 'slate.700' }}>
                    <OfficeIcon fontSize="small" color="action" />
                    <Typography variant="body2">Student Services Dept.</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', gap: 1, color: 'slate.700' }}>
                    <TimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">Mon-Fri, 9 AM - 5 PM</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            <Box className="help-card-action" sx={{ px: 4, pb: 4 }}>
              <Button variant="contained" fullWidth size="large" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                Contact Support
              </Button>
            </Box>
          </Box>
        </Box>
      </div>
    </Box>
  );
}

export default StudentHelp;
