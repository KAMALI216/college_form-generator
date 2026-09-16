import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Chip,
  IconButton
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Drafts as DraftsIcon,
  Inbox as InboxIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { getAdminStats, getAdminSubmissions } from '../../services/adminService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Color Palette based on standard SaaS design
const colors = {
  primary: '#1976D2',
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Red
  background: '#F9FAFB',
  card: '#FFFFFF',
  textMain: '#111827', // Gray 900
  textSecondary: '#6B7280', // Gray 500
  border: '#E5E7EB', // Gray 200
  draft: '#9CA3AF' // Gray 400
};

const mockChartData = [
  { name: 'Mon', submissions: 12 },
  { name: 'Tue', submissions: 19 },
  { name: 'Wed', submissions: 15 },
  { name: 'Thu', submissions: 22 },
  { name: 'Fri', submissions: 28 },
  { name: 'Sat', submissions: 10 },
  { name: 'Sun', submissions: 14 },
];

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, submissionsData] = await Promise.all([
          getAdminStats(),
          getAdminSubmissions(),
        ]);
        setStats(statsData);
        // Take top 5 recent submissions
        setRecentSubmissions(submissionsData.slice(0, 5));
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: '80vh' }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 1, px: { xs: 1, md: 3 } }}>
      
      {/* HEADER SECTION */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ color: colors.textMain, fontWeight: '700', letterSpacing: '-0.5px' }}>
            Good morning, Admin 👋
          </Typography>
          <Typography variant="body1" sx={{ color: colors.textSecondary, mt: 0.5 }}>
            Manage your forms, submissions and student activity.
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => navigate('/admin/create-form')}
            sx={{ 
              bgcolor: colors.primary, 
              color: '#fff', 
              fontWeight: 'bold', 
              textTransform: 'none',
              px: 3,
              py: 1.2,
              borderRadius: 2,
              boxShadow: '0 4px 6px -1px rgba(25, 118, 210, 0.2)'
            }}
          >
            Create New Form
          </Button>
        </Box>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      {/* KPI SECTION */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, minmax(0, 1fr))' }, 
          gap: 3, 
          mb: 4 
        }}
      >
        {[
          { label: 'Total Forms', value: stats?.totalTemplates || 0, icon: <DescriptionIcon />, color: colors.primary, trend: '↑ 2 this month', trendColor: colors.success },
          { label: 'Published', value: stats?.approvedTemplates || 0, icon: <CheckCircleIcon />, color: colors.success, trend: 'Active forms', trendColor: colors.textSecondary },
          { label: 'Drafts', value: stats?.draftTemplates || 0, icon: <DraftsIcon />, color: colors.draft, trend: 'Needs completion', trendColor: colors.warning },
          { label: 'Submissions', value: stats?.totalSubmissions || 0, icon: <InboxIcon />, color: colors.primary, trend: '↑ 14% this month', trendColor: colors.success },
        ].map((kpi, idx) => (
          <Box key={idx}>
            <Card sx={{ border: `1px solid ${colors.border}`, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Box sx={{ bgcolor: `${kpi.color}15`, p: 1.2, borderRadius: 2, display: 'flex' }}>
                    {React.cloneElement(kpi.icon, { sx: { color: kpi.color } })}
                  </Box>
                  <IconButton size="small" sx={{ color: colors.border }}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 500, mb: 0.5 }}>
                  {kpi.label}
                </Typography>
                <Typography variant="h4" sx={{ color: colors.textMain, fontWeight: '800' }}>
                  {kpi.value}
                </Typography>
                <Typography variant="caption" sx={{ color: kpi.trendColor, fontWeight: 500, mt: 1, display: 'block' }}>
                  {kpi.trend}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* MIDDLE SECTION - Analytics & Attention */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ border: `1px solid ${colors.border}`, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
                <Box>
                  <Typography variant="h6" sx={{ color: colors.textMain, fontWeight: '700' }}>
                    Submission Overview
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
                    Total Submissions: {stats?.totalSubmissions || 128} <Typography component="span" sx={{ color: colors.success, fontSize: '0.875rem', ml: 1, fontWeight: 'bold' }}>↑ 14.2%</Typography>
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  {['7 Days', '30 Days', '3 Months', '1 Year'].map((range, i) => (
                    <Button key={i} size="small" variant={i === 1 ? "contained" : "outlined"} sx={{ textTransform: 'none', borderRadius: 2, py: 0.5 }}>
                      {range}
                    </Button>
                  ))}
                </Stack>
              </Stack>

              <Box sx={{ height: 280, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: colors.textSecondary, fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.textSecondary, fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                      labelStyle={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="submissions" stroke={colors.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorSubmissions)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ border: `1px solid ${colors.border}`, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ color: colors.textMain, fontWeight: '700', mb: 3 }}>
                Requires Attention
              </Typography>
              
              <Stack spacing={3} sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ bgcolor: `${colors.warning}15`, p: 1, borderRadius: 2 }}>
                    <WarningIcon sx={{ color: colors.warning }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textMain }}>7 Pending Submissions</Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>Submissions waiting for approval</Typography>
                    <Typography variant="button" sx={{ color: colors.primary, cursor: 'pointer', textTransform: 'none', fontWeight: 600 }}>Review now →</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ bgcolor: `${colors.draft}15`, p: 1, borderRadius: 2 }}>
                    <DraftsIcon sx={{ color: colors.draft }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textMain }}>2 Draft Forms</Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>Forms that need to be published</Typography>
                    <Typography variant="button" sx={{ color: colors.primary, cursor: 'pointer', textTransform: 'none', fontWeight: 600 }}>Complete forms →</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ bgcolor: `${colors.error}15`, p: 1, borderRadius: 2 }}>
                    <ScheduleIcon sx={{ color: colors.error }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textMain }}>1 Expiring Form</Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>Hostel Application closes tomorrow</Typography>
                    <Typography variant="button" sx={{ color: colors.primary, cursor: 'pointer', textTransform: 'none', fontWeight: 600 }}>View form →</Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* LOWER SECTION - Recent Submissions & Top Forms */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ border: `1px solid ${colors.border}`, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 0 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ color: colors.textMain, fontWeight: '700' }}>
                  Recent Submissions
                </Typography>
                <Button variant="text" sx={{ fontWeight: 'bold', textTransform: 'none' }} onClick={() => navigate('/admin/submissions')}>
                  View All <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                </Button>
              </Stack>
              <TableContainer>
                <Table size="medium">
                  <TableHead sx={{ bgcolor: colors.background }}>
                    <TableRow>
                      <TableCell sx={{ color: colors.textSecondary, fontWeight: '600' }}>Student</TableCell>
                      <TableCell sx={{ color: colors.textSecondary, fontWeight: '600' }}>Form</TableCell>
                      <TableCell sx={{ color: colors.textSecondary, fontWeight: '600' }}>Status</TableCell>
                      <TableCell sx={{ color: colors.textSecondary, fontWeight: '600' }}>Date</TableCell>
                      <TableCell sx={{ color: colors.textSecondary, fontWeight: '600' }} align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentSubmissions.map((sub, idx) => (
                      <TableRow key={idx} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{sub.submittedByName}</TableCell>
                        <TableCell>{sub.formName}</TableCell>
                        <TableCell>
                          <Chip 
                            icon={<CheckCircleIcon fontSize="small" />} 
                            label="Submitted" 
                            size="small" 
                            sx={{ bgcolor: `${colors.success}15`, color: colors.success, fontWeight: 600, borderRadius: 1 }} 
                          />
                        </TableCell>
                        <TableCell sx={{ color: colors.textSecondary }}>{new Date(sub.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Button size="small" sx={{ fontWeight: 'bold', textTransform: 'none' }}>Review</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {recentSubmissions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6, color: colors.textSecondary }}>
                          <Box sx={{ mb: 1 }}><InboxIcon sx={{ fontSize: 40, color: colors.border }} /></Box>
                          <Typography variant="body1" fontWeight="500">No submissions yet</Typography>
                          <Typography variant="body2">Once students submit forms, they will appear here.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ border: `1px solid ${colors.border}`, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: colors.textMain, fontWeight: '700', mb: 3 }}>
                Top Forms
              </Typography>
              
              <Stack spacing={3}>
                {stats?.mostUsedForm ? (
                  <>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="600" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {stats.mostUsedForm}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">{stats.totalSubmissions || 186}</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={87} sx={{ height: 8, borderRadius: 4, bgcolor: `${colors.primary}20`, '& .MuiLinearProgress-bar': { bgcolor: colors.primary } }} />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="600" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Scholarship Application 2026
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">142</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={65} sx={{ height: 8, borderRadius: 4, bgcolor: `${colors.primary}20`, '& .MuiLinearProgress-bar': { bgcolor: colors.primary } }} />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="600" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Hostel Accommodation
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">98</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={45} sx={{ height: 8, borderRadius: 4, bgcolor: `${colors.primary}20`, '& .MuiLinearProgress-bar': { bgcolor: colors.primary } }} />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No form data available yet.</Typography>
                  </Box>
                )}
              </Stack>
              
              <Button variant="text" fullWidth sx={{ mt: 3, fontWeight: 'bold', textTransform: 'none' }} onClick={() => navigate('/admin/view-templates')}>
                View All Forms
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;