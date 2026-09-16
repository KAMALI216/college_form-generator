import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton
} from '@mui/material';
import { deleteTemplate, getTemplateById, getAdminTemplates, approveTemplate, duplicateTemplate } from '../../services/templateService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import DynamicFormRenderer from '../../components/forms/DynamicFormRenderer';
import ErrorBoundary from '../../components/common/ErrorBoundary';

function ViewTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadTemplates = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminTemplates();
      setTemplates(data);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleViewJson = async (id) => {
    try {
      const data = await getTemplateById(id);
      setSelectedTemplate(data);
      setJsonDialogOpen(true);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load template');
    }
  };

  const handlePreview = async (id) => {
    try {
      const data = await getTemplateById(id);
      setSelectedTemplate(data);
      setPreviewDialogOpen(true);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load template');
    }
  };

  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) {
      return;
    }

    try {
      await deleteTemplate(templateToDelete.id);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      await loadTemplates();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await duplicateTemplate(id);
      await loadTemplates();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to duplicate template');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveTemplate(id);
      await loadTemplates();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to approve template');
    }
  };

  const filteredAndSortedTemplates = templates.filter(t => {
    const matchesSearch = (t.formName || t.form_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : (t.status === statusFilter.toUpperCase());
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt || a.created_at || 0);
    const dateB = new Date(b.createdAt || b.created_at || 0);
    const nameA = (a.formName || a.form_name || '').toLowerCase();
    const nameB = (b.formName || b.form_name || '').toLowerCase();
    
    if (sortOrder === 'Newest') return dateB - dateA;
    if (sortOrder === 'Oldest') return dateA - dateB;
    if (sortOrder === 'Name A-Z') return nameA.localeCompare(nameB);
    if (sortOrder === 'Name Z-A') return nameB.localeCompare(nameA);
    return 0;
  });

  const computeFieldStats = (schemaArray) => {
    if (!Array.isArray(schemaArray)) return null;
    const total = schemaArray.length;
    const required = schemaArray.filter(f => f.required).length;
    const optional = total - required;
    const typeCount = {};
    schemaArray.forEach(f => {
      const t = f.type || 'text';
      typeCount[t] = (typeCount[t] || 0) + 1;
    });
    const typeBreakdown = Object.entries(typeCount).map(([type, count]) => `${count} ${type}`).join(', ');
    
    return { total, required, optional, typeBreakdown };
  };
  
  const fieldStats = selectedTemplate ? computeFieldStats(selectedTemplate.formSchema || selectedTemplate.json_schema) : null;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          View Templates
        </Typography>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Search Form Name or Description"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortOrder}
              label="Sort By"
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <MenuItem value="Newest">Newest First</MenuItem>
              <MenuItem value="Oldest">Oldest First</MenuItem>
              <MenuItem value="Name A-Z">Name (A-Z)</MenuItem>
              <MenuItem value="Name Z-A">Name (Z-A)</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Form Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedTemplates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>{template.formName || template.form_name}</TableCell>
                <TableCell>{template.description || '-'}</TableCell>
                <TableCell>
                  {template.status === 'APPROVED' ? (
                    <Chip icon={<CheckCircleIcon fontSize="small" />} label="Published" size="small" sx={{ bgcolor: '#10B98115', color: '#10B981', fontWeight: 600, borderRadius: 1, '& .MuiChip-icon': { color: '#10B981', ml: 1 } }} />
                  ) : (
                    <Chip icon={<CircleIcon fontSize="small" sx={{ fontSize: '10px' }} />} label="Draft" size="small" sx={{ bgcolor: '#9CA3AF15', color: '#6B7280', fontWeight: 600, borderRadius: 1, '& .MuiChip-icon': { color: '#6B7280', ml: 1 } }} />
                  )}
                </TableCell>
                <TableCell>
                  {(template.createdAt || template.created_at) ? new Date(template.createdAt || template.created_at).toLocaleString() : '-'}
                </TableCell>
                <TableCell align="right">
                  {template.status === 'DRAFT' && (
                    <Button size="small" color="primary" onClick={() => handleApprove(template.id)} sx={{ mr: 1 }}>
                      Approve
                    </Button>
                  )}
                  <Button size="small" onClick={() => navigate(`/admin/templates/${template.id}/edit`)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button size="small" onClick={() => handlePreview(template.id)} sx={{ mr: 1 }}>
                    Preview
                  </Button>
                  <Button size="small" onClick={() => handleDuplicate(template.id)} sx={{ mr: 1 }}>
                    Duplicate
                  </Button>
                  <Button size="small" onClick={() => handleViewJson(template.id)} sx={{ mr: 1 }}>
                    View JSON
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDeleteClick(template)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {!loading && filteredAndSortedTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No templates found
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={jsonDialogOpen} onClose={() => setJsonDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Template JSON</DialogTitle>
        <DialogContent>
          {fieldStats && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Field Statistics</Typography>
              <Typography variant="body2">
                <strong>Total Fields:</strong> {fieldStats.total} 
                ({fieldStats.required} required, {fieldStats.optional} optional)
              </Typography>
              <Typography variant="body2">
                <strong>Types:</strong> {fieldStats.typeBreakdown}
              </Typography>
            </Box>
          )}
          <DialogContentText component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {selectedTemplate ? JSON.stringify(selectedTemplate.formSchema || selectedTemplate.json_schema, null, 2) : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJsonDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {templateToDelete?.formName || templateToDelete?.form_name || 'this template'}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedTemplate?.formName || selectedTemplate?.form_name} (Preview)</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedTemplate && (
            <ErrorBoundary>
              <DynamicFormRenderer 
                schema={selectedTemplate.formSchema || selectedTemplate.json_schema} 
                onSubmit={() => setPreviewDialogOpen(false)} 
                previewMode={true} 
              />
            </ErrorBoundary>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ViewTemplates;