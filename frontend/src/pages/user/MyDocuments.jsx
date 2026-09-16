import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Chip, IconButton, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  DeleteOutline as DeleteIcon,
  CheckCircle as VerifiedIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  CheckCircleOutline as CheckCircleOutlineIcon
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
  const [currentTab, setCurrentTab] = useState(0);

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

  const requiredDocs = mergedDocuments.filter(d => !d.isUploaded);
  const submittedDocs = mergedDocuments.filter(d => d.isUploaded);
  const totalDocs = mergedDocuments.length;

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: { xs: 2, md: '32px 40px' }, pb: 8 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
          My Documents
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your uploaded documents for fast application processing.
        </Typography>

        {/* Compact Summary */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', borderRadius: 2, px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Required</Typography>
            <Chip label={requiredDocs.length} size="small" sx={{ bgcolor: '#fee2e2', color: '#ef4444', fontWeight: 700 }} />
          </Box>
          <Box sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', borderRadius: 2, px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Submitted</Typography>
            <Chip label={submittedDocs.length} size="small" sx={{ bgcolor: '#dcfce7', color: '#22c55e', fontWeight: 700 }} />
          </Box>
          <Box sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', borderRadius: 2, px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Total</Typography>
            <Chip label={totalDocs} size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700 }} />
          </Box>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc', px: 2 }}>
            <Tabs 
              value={currentTab} 
              onChange={(e, val) => setCurrentTab(val)}
              textColor="primary"
              indicatorColor="primary"
              sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' } }}
            >
              <Tab label={`Required (${requiredDocs.length})`} />
              <Tab label={`Submitted (${submittedDocs.length})`} />
              <Tab label={`View All (${totalDocs})`} />
            </Tabs>
          </Box>

          <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* TAB 0: REQUIRED */}
            {currentTab === 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                  Documents Needed
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Upload the remaining documents required for your applications.
                </Typography>

                {requiredDocs.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2, color: '#166534' }}>
                    <CheckCircleOutlineIcon fontSize="small" />
                    <Typography variant="body2" fontWeight={600}>All required documents have been uploaded.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                    {requiredDocs.map((doc, idx) => (
                      <Box 
                        key={idx}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          p: 2,
                          borderBottom: idx === requiredDocs.length - 1 ? 'none' : '1px solid #e2e8f0',
                          '&:hover': { bgcolor: '#f8fafc' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                          <Box sx={{ color: 'text.secondary', display: 'flex' }}><FileIcon /></Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {doc.documentType}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
                            Required
                          </Typography>
                          <Button 
                            variant="outlined" 
                            color="primary" 
                            size="small" 
                            startIcon={<UploadIcon />}
                            onClick={() => handleOpenUpload(doc.documentType)}
                            sx={{ textTransform: 'none', borderRadius: 1.5 }}
                          >
                            Upload
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* TAB 1: SUBMITTED */}
            {currentTab === 1 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                  Submitted Documents
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Documents you have successfully uploaded.
                </Typography>

                {submittedDocs.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">No documents have been uploaded yet.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                    {submittedDocs.map((doc, idx) => (
                      <Box 
                        key={doc.id || idx}
                        sx={{ 
                          display: 'flex', 
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' }, 
                          justifyContent: 'space-between',
                          p: 2,
                          gap: 2,
                          borderBottom: idx === submittedDocs.length - 1 ? 'none' : '1px solid #e2e8f0',
                          '&:hover': { bgcolor: '#f8fafc' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1, minWidth: 0 }}>
                          <Box sx={{ color: 'success.main', display: 'flex', mt: 0.5 }}><VerifiedIcon /></Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }} noWrap>
                                {doc.documentType}
                              </Typography>
                              <Chip 
                                label={doc.status || 'Verified'} 
                                size="small" 
                                color={getStatusColor(doc.status || 'VERIFIED')} 
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary', flexWrap: 'wrap' }}>
                              <Typography variant="caption" noWrap sx={{ maxWidth: 150 }}>{doc.fileName}</Typography>
                              <Typography variant="caption">•</Typography>
                              <Typography variant="caption">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</Typography>
                              {doc.uploadedAt && (
                                <>
                                  <Typography variant="caption">•</Typography>
                                  <Typography variant="caption">{new Date(doc.uploadedAt).toLocaleDateString()}</Typography>
                                </>
                              )}
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                          <Button 
                            variant="outlined" 
                            color="inherit"
                            size="small" 
                            onClick={() => handleOpenUpload(doc.documentType)}
                            sx={{ textTransform: 'none', borderRadius: 1.5, color: 'text.secondary', borderColor: '#cbd5e1' }}
                          >
                            Replace
                          </Button>
                          <IconButton size="small" color="error" onClick={() => handleDelete(doc.id)} sx={{ border: '1px solid #fca5a5', borderRadius: 1.5 }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* TAB 2: VIEW ALL */}
            {currentTab === 2 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>
                  All Documents
                </Typography>

                <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                  {mergedDocuments.map((doc, idx) => (
                    <Box 
                      key={doc.id || idx}
                      sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' }, 
                        justifyContent: 'space-between',
                        p: 2,
                        gap: 2,
                        bgcolor: doc.isUploaded ? 'transparent' : '#f8fafc',
                        borderBottom: idx === mergedDocuments.length - 1 ? 'none' : '1px solid #e2e8f0'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                        <Box sx={{ color: doc.isUploaded ? 'success.main' : 'text.disabled', display: 'flex' }}>
                          {doc.isUploaded ? <VerifiedIcon /> : <FileIcon />}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: doc.isUploaded ? '#1e293b' : 'text.secondary' }}>
                            {doc.documentType}
                          </Typography>
                          {doc.isUploaded && (
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.5 }}>
                              {doc.fileName} ({(doc.fileSize / 1024 / 1024).toFixed(2)} MB)
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: { xs: '100%', sm: 'auto' }, justifyContent: 'space-between' }}>
                        <Chip 
                          label={doc.isUploaded ? (doc.status || 'Verified') : 'Not Uploaded'} 
                          size="small" 
                          color={doc.isUploaded ? getStatusColor(doc.status || 'VERIFIED') : 'default'} 
                          variant={doc.isUploaded ? 'outlined' : 'filled'}
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                        />
                        
                        <Button 
                          variant={doc.isUploaded ? "text" : "outlined"} 
                          color={doc.isUploaded ? "inherit" : "primary"}
                          size="small" 
                          startIcon={<UploadIcon />}
                          onClick={() => handleOpenUpload(doc.documentType)}
                          sx={{ textTransform: 'none', borderRadius: 1.5, color: doc.isUploaded ? 'text.secondary' : 'primary.main' }}
                        >
                          {doc.isUploaded ? 'Replace' : 'Upload'}
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
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
