import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button
} from '@mui/material';
import {
  WorkspacePremium as CertificateIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  CheckCircle as VerifiedIcon
} from '@mui/icons-material';

const MOCK_CERTIFICATES = [
  { id: 1, name: 'Bonafide Certificate', certNo: 'CERT-2026-0451', issueDate: '26 Aug 2026', status: 'Active' },
  { id: 2, name: 'First Year Grade Sheet', certNo: 'ACAD-2024-8891', issueDate: '15 Jul 2024', status: 'Active' },
  { id: 3, name: 'Hostel No-Due Certificate', certNo: 'HSTL-2025-1102', issueDate: '10 May 2025', status: 'Active' },
];

function MyCertificates() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#1e293b' }}>
          My Certificates
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and download your approved digital certificates.
        </Typography>
      </Box>

      {MOCK_CERTIFICATES.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'white', borderRadius: 4, border: '1px dashed #cbd5e1' }}>
          <CertificateIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No certificates available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your approved certificates will appear here.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {MOCK_CERTIFICATES.map((cert) => (
            <Grid item xs={12} md={6} key={cert.id}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }
                }}
              >
                <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: '50%', display: 'flex' }}>
                  <CertificateIcon color="success" fontSize="large" />
                </Box>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'slate.800', lineHeight: 1.2 }}>
                      {cert.name}
                    </Typography>
                    <VerifiedIcon color="primary" sx={{ fontSize: 16 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Cert No: <Box component="span" sx={{ fontWeight: 600 }}>{cert.certNo}</Box>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Issued on {cert.issueDate}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<ViewIcon />}
                      sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                    >
                      View
                    </Button>
                    <Button 
                      variant="contained" 
                      size="small"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, boxShadow: 'none' }}
                    >
                      Download PDF
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default MyCertificates;
