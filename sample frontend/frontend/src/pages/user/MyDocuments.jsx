import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Chip, IconButton, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  DeleteOutline as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as VerifiedIcon,
  Pending as PendingIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { getMyDocuments, uploadDocument, deleteDocument } from '../../services/documentService';

const REQUIRED_DOCUMENTS = [
  'Aadhaar Card',
  '10th Marksheet',
  '12th Marksheet',
  'Transfer Certificate',
  'Community Certificate',
  'Income Certificate',
  'Passport Size Photo',
  'Bank Passbook Front Page',
  'Nativity Certificate',
  'Medical Certificate'
];

function getStatusIcon(status) {
  if (!status) return null;
  switch (status.toUpperCase()) {
    case 'VERIFIED': return <VerifiedIcon color="success" fontSize="small" />;
    case 'PENDING': return <PendingIcon color="warning" fontSize="small" />;
    case 'REJECTED': return <WarningIcon color="error" fontSize="small" />;
    default: return null;
  }
}

function getStatusColor(status) {
  if (!status) return 'default';
  switch (status.toUpperCase()) {
    case 'VERIFIED': return 'success';
    case 'PENDING': return 'warning';
    case 'REJECTED': return 'error';
    default: return 'default';
  }
}

function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Upload State
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadDocuments = async () => {
    try {
      const docs = await getMyDocuments();
      setDocuments(docs || []);
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleOpenUpload = (docType) => {
    setSelectedType(docType);
    setUploadFile(null);
    setUploadOpen(true);
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile || !selectedType) return;
    setUploading(true);
    try {
      await uploadDocument(selectedType, uploadFile);
      setUploadOpen(false);
      await loadDocuments();
    } catch (err) {
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        await loadDocuments();
      } catch (err) {
        setError('Failed to delete document');
      }
    }
  };

  // Merge REQUIRED_DOCUMENTS with actual uploaded documents
  const mergedDocuments = REQUIRED_DOCUMENTS.map((reqType) => {
    const uploaded = documents.find(d => d.documentType === reqType);
    if (uploaded) {
      return { ...uploaded, isUploaded: true };
    }
    return {
      documentType: reqType,
      isUploaded: false,
      status: 'Not Uploaded'
    };
  });

  // Add any extra uploaded documents that are not in the REQUIRED_DOCUMENTS list
  documents.forEach(doc => {
    if (!REQUIRED_DOCUMENTS.includes(doc.documentType)) {
      mergedDocuments.push({ ...doc, isUploaded: true });
    }
  });

  return (
    <Box sx={{ pb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#1e293b' }}>
            My Documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your uploaded documents for fast application processing.
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {mergedDocuments.map((doc, idx) => (
            <Grid item xs={12} sm={6} md={4} key={doc.id || `req-${idx}`}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  border: doc.isUploaded ? '1px solid #cbd5e1' : '1px dashed #94a3b8',
                  bgcolor: doc.isUploaded ? 'white' : '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: doc.isUploaded ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: doc.isUploaded ? 'blue.50' : 'slate.200', borderRadius: 2 }}>
                    <FileIcon color={doc.isUploaded ? "primary" : "disabled"} />
                  </Box>
                  {doc.isUploaded ? (
                    <Chip 
                      icon={getStatusIcon(doc.status)}
                      label={doc.status} 
                      size="small" 
                      color={getStatusColor(doc.status)} 
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  ) : (
                    <Chip label="Not Uploaded" size="small" color="default" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                  )}
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'slate.800', mb: 0.5 }}>
                  {doc.documentType}
                </Typography>
                
                {doc.isUploaded ? (
                  <>
                    <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', mb: 3, flexWrap: 'wrap' }}>
                      <Typography variant="caption" noWrap title={doc.fileName} sx={{ maxWidth: 120 }}>{doc.fileName}</Typography>
                      <Typography variant="caption">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</Typography>
                      <Typography variant="caption">{new Date(doc.uploadedAt).toLocaleDateString()}</Typography>
                    </Box>

                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        fullWidth 
                        startIcon={<UploadIcon />}
                        onClick={() => handleOpenUpload(doc.documentType)}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        Replace
                      </Button>
                      <IconButton size="small" color="error" onClick={() => handleDelete(doc.id)} sx={{ border: '1px solid', borderColor: 'error.main', borderRadius: 2 }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ mt: 'auto' }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small" 
                      fullWidth 
                      startIcon={<UploadIcon />}
                      onClick={() => handleOpenUpload(doc.documentType)}
                      sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}
                    >
                      Upload
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={() => !uploading && setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload {selectedType}</DialogTitle>
        <DialogContent dividers>
          <input 
            type="file" 
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setUploadFile(e.target.files[0])}
            style={{ width: '100%', padding: '10px' }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Supported formats: PDF, JPG, PNG (Max size: 5MB)
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setUploadOpen(false)} disabled={uploading}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUploadSubmit} 
            disabled={!uploadFile || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyDocuments;
