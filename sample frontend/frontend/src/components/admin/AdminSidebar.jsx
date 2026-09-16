import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  AddBox as AddBoxIcon,
  Inbox as InboxIcon,
  BarChart as AnalyticsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 260;

const navGroups = [
  {
    title: 'OVERVIEW',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    ]
  },
  {
    title: 'FORMS',
    items: [
      { text: 'All Forms', icon: <DescriptionIcon />, path: '/admin/view-templates' },
    ]
  },
  {
    title: 'SUBMISSIONS',
    items: [
      { text: 'Submissions', icon: <InboxIcon />, path: '/admin/submissions' },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { text: 'Analytics', icon: <AnalyticsIcon />, path: '/admin/analytics', disabled: true },
      { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings', disabled: true },
    ]
  }
];

function AdminSidebar({ mobileOpen, handleDrawerToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path || (location.pathname.startsWith('/admin/templates/') && path === '/admin/view-templates');
  };

  const drawerContent = (
    <>
      <Toolbar sx={{ mb: 1, mt: 1 }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: '#fff' }}>
          FormFlow
          <Typography component="span" variant="caption" sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.1)', px: 1, py: 0.5, borderRadius: 1 }}>
            Admin
          </Typography>
        </Typography>
      </Toolbar>
      
      <Box sx={{ px: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          fullWidth 
          startIcon={<AddBoxIcon />}
          onClick={() => navigate('/admin/create-form')}
          sx={{ 
            bgcolor: '#1976D2', 
            textTransform: 'none', 
            fontWeight: 'bold',
            py: 1,
            '&:hover': { bgcolor: '#1565C0' }
          }}
        >
          Create Form
        </Button>
      </Box>

      <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {navGroups.map((group, index) => (
          <Box key={group.title} sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ px: 3, mb: 1, display: 'block', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', letterSpacing: 1 }}>
              {group.title}
            </Typography>
            <List disablePadding>
              {group.items.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    disabled={item.disabled}
                    selected={isActive(item.path)}
                    onClick={() => navigate(item.path)}
                    sx={{
                      mx: 2,
                      borderRadius: 1.5,
                      py: 1,
                      '&.Mui-selected': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                        },
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                      },
                      color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.7)'
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive(item.path) ? 600 : 500, fontSize: '0.9rem' }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
        
        <Box sx={{ flexGrow: 1 }} />
        
        <List sx={{ mt: 'auto', pb: 2 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                mx: 2,
                borderRadius: 1.5,
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff'
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            bgcolor: '#0F172A', // Dark navy
            color: '#ffffff',
            borderRight: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            bgcolor: '#0F172A', // Dark navy
            color: '#ffffff',
            borderRight: 'none',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

export default AdminSidebar;

