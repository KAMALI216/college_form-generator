import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Checkbox,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Download as DownloadIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAdminSubmissions, updateSubmissionStatus, exportFormSubmissions } from '../../services/adminService';

const getStatusDetails = (status) => {
  switch (status?.toUpperCase()) {
    case 'APPROVED': return { label: 'Approved', color: 'success', icon: <CheckIcon fontSize="small" /> };
    case 'REJECTED': return { label: 'Rejected', color: 'error', icon: <CloseIcon fontSize="small" /> };
    case 'DRAFT': return { label: 'Draft', color: 'default', icon: <CircleIcon fontSize="small" sx={{ fontSize: '10px' }} /> };
    default: return { label: 'Pending', color: 'warning', icon: <CircleIcon fontSize="small" sx={{ fontSize: '10px' }} /> };
  }
};

function Submissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [formFilter, setFormFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const data = await getAdminSubmissions();
        setSubmissions(data);
      } catch (err) {
        setError('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const uniqueFormNames = [...new Set(submissions.map((s) => s.formName))];

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      (sub.submittedByName && sub.submittedByName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.formName && sub.formName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesForm = formFilter ? sub.formName === formFilter : true;
    const matchesStatus = statusFilter ? sub.status === statusFilter : true;
    return matchesSearch && matchesForm && matchesStatus;
  });

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(filteredSubmissions.map(s => s.submissionId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (event, id) => {
    if (event.target.checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const isSelected = (id) => selectedIds.indexOf(id) !== -1;

  const handleBulkAction = async (action) => {
    if (window.confirm(`Are you sure you want to ${action} ${selectedIds.length} submissions?`)) {
      try {
        const promises = [];
        for (const id of selectedIds) {
          if (action === 'Approve') promises.push(updateSubmissionStatus(id, 'APPROVED'));
          if (action === 'Reject') promises.push(updateSubmissionStatus(id, 'REJECTED'));
          if (action === 'Delete') {
            // If delete API exists, call it. For now we only implement Approve/Reject.
            alert('Delete not implemented yet.');
            return;
          }
        }
        await Promise.all(promises);
        
        // Refresh local state
        const newSubmissions = submissions.map(sub => {
          if (selectedIds.includes(sub.submissionId)) {
            if (action === 'Approve') return { ...sub, status: 'APPROVED' };
            if (action === 'Reject') return { ...sub, status: 'REJECTED' };
          }
          return sub;
        });
        setSubmissions(newSubmissions);
        setSelectedIds([]);
      } catch (error) {
        alert('Failed to update submissions.');
      }
    }
  };

  const handleExport = async () => {
    if (formFilter) {
      const selectedForm = submissions.find(s => s.formName === formFilter);
      if (selectedForm && selectedForm.formId) {
        try {
          const response = await exportFormSubmissions(selectedForm.formId);
          // Create blob link to download
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${selectedForm.formName.replace(/[^a-zA-Z0-9]/g, '_')}_Approved.xlsx`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        } catch (error) {
          alert('Failed to download Excel. Ensure the form has approved submissions.');
        }
        return;
      }
    }
    alert('Please filter by a specific Form first before exporting.');
  };

  return (
    <Container maxWidth={false} sx={{ py: 2, px: { xs: 1, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: '700', letterSpacing: '-0.5px' }}>
            Submissions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Review and manage all student form submissions
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate('/admin/dashboard')} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          Back to Dashboard
        </Button>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search students, forms..."
            variant="outlined"
            size="small"
            fullWidth
            sx={{ flexGrow: 2 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 150, flexGrow: 1 }}>
            <InputLabel>Form</InputLabel>
            <Select value={formFilter} label="Form" onChange={(e) => setFormFilter(e.target.value)}>
              <MenuItem value=""><em>All Forms</em></MenuItem>
              {uniqueFormNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150, flexGrow: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value=""><em>All Statuses</em></MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="DRAFT">Draft</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150, flexGrow: 1 }}>
            <TextField 
              type="date" 
              size="small"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }} 
            />
          </FormControl>
          <Button variant="outlined" sx={{ height: 40, minWidth: 40, p: 0, color: '#6B7280', borderColor: '#E5E7EB' }}>
            <FilterListIcon />
          </Button>
        </Stack>
      </Paper>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <Paper sx={{ p: 1.5, mb: 3, borderRadius: 2, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E40AF', ml: 1 }}>
            {selectedIds.length} selected
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="contained" color="success" startIcon={<CheckIcon />} onClick={() => handleBulkAction('Approve')} sx={{ textTransform: 'none', boxShadow: 'none' }}>
              Approve
            </Button>
            <Button size="small" variant="contained" color="error" startIcon={<CloseIcon />} onClick={() => handleBulkAction('Reject')} sx={{ textTransform: 'none', boxShadow: 'none' }}>
              Reject
            </Button>
            <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} sx={{ textTransform: 'none', bgcolor: '#fff' }}>
              Export Form
            </Button>
            <IconButton size="small" color="error" onClick={() => handleBulkAction('Delete')}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Paper>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F9FAFB' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedIds.length > 0 && selectedIds.length < filteredSubmissions.length}
                  checked={filteredSubmissions.length > 0 && selectedIds.length === filteredSubmissions.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#4B5563' }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#4B5563' }}>Form</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#4B5563' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#4B5563' }}>Submitted Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#4B5563' }} align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubmissions.map((sub) => {
              const isItemSelected = isSelected(sub.submissionId);
              const statusDetails = getStatusDetails(sub.status);
              
              return (
                <TableRow key={sub.submissionId} hover selected={isItemSelected} sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={isItemSelected} onChange={(event) => handleSelectOne(event, sub.submissionId)} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">{sub.submittedByName}</Typography>
                    <Typography variant="caption" color="text.secondary">{sub.submittedByEmail}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{sub.formName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={statusDetails.icon} 
                      label={statusDetails.label} 
                      size="small" 
                      color={statusDetails.color}
                      variant="outlined"
                      sx={{ 
                        fontWeight: 600, 
                        borderWidth: 1.5,
                        '& .MuiChip-icon': { ml: 1 } 
                      }} 
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      size="small" 
                      onClick={() => navigate(`/admin/submissions/${sub.submissionId}`)}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Review →
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && filteredSubmissions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">No submissions found for the selected filters.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Submissions;
