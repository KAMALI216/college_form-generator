import React, { useCallback, useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { CloudUpload as UploadIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';

function ResumeUploader({ onUploadSuccess, onUploadError }) {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];
    if (!validTypes.includes(file.type)) {
      onUploadError('Unsupported file type. Please upload a PDF, DOCX, or Image (PNG/JPG).');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      onUploadError('File is too large. Maximum size is 5MB.');
      return;
    }

    setProcessing(true);
    onUploadSuccess(file);
  };

  return (
    <Box 
      sx={{ 
        border: '2px dashed',
        borderColor: dragActive ? 'primary.main' : 'grey.300',
        borderRadius: 4,
        p: 6,
        textAlign: 'center',
        bgcolor: dragActive ? 'primary.50' : 'slate.50',
        transition: 'all 0.2s ease',
        cursor: processing ? 'not-allowed' : 'pointer',
        opacity: processing ? 0.7 : 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => {
        if (!processing) document.getElementById('resume-upload-input').click();
      }}
    >
      <input
        id="resume-upload-input"
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
        multiple={false}
        onChange={handleChange}
        style={{ display: 'none' }}
        disabled={processing}
      />
      
      {processing ? (
        <>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="h6" color="primary">Processing File...</Typography>
          <Typography variant="body2" color="text.secondary">Please wait while we prepare your resume.</Typography>
        </>
      ) : (
        <>
          <Box sx={{ bgcolor: 'blue.50', p: 2, borderRadius: '50%', mb: 2 }}>
            <UploadIcon color="primary" sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'slate.800' }}>
            Drag and drop your resume here
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            or click to browse files
          </Typography>
          <Button variant="outlined" component="span" startIcon={<FileIcon />}>
            Browse Files
          </Button>
          <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block' }}>
            Supported formats: PDF, DOCX, PNG, JPG (Max 5MB)
          </Typography>
        </>
      )}
    </Box>
  );
}

export default ResumeUploader;
