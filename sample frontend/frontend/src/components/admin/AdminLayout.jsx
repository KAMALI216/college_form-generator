import React, { useState } from 'react';
import { 
  Box, 
  CssBaseline, 
  Typography, 
  IconButton, 
  Avatar, 
  Stack, 
  Badge, 
  Menu, 
  MenuItem, 
  Divider,
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import AdminSidebar from './AdminSidebar';

const drawerWidth = 260;

function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#F9FAFB'
        }}
      >
        <Box sx={{ 
          px: { xs: 2, sm: 4 }, 
          py: 2, 
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <Stack direction="row" alignItems="center">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' }, color: '#6B7280' }}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton 
              sx={{ color: '#6B7280', bgcolor: '#F3F4F6', '&:hover': { bgcolor: '#E5E7EB' } }}
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon fontSize="small" />
            </IconButton>
            
            <IconButton 
              sx={{ color: '#6B7280', bgcolor: '#F3F4F6', '&:hover': { bgcolor: '#E5E7EB' } }}
              onClick={handleOpenNavMenu}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
            
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              PaperProps={{
                elevation: 3,
                sx: { width: 320, borderRadius: 2, mt: 1.5 }
              }}
            >
              <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
                <Typography variant="caption" sx={{ color: '#1976D2', cursor: 'pointer', fontWeight: 500 }}>Mark all read</Typography>
              </Box>
              <Divider />
              
              <MenuItem sx={{ py: 1.5, px: 2, borderLeft: '3px solid #ED6C02', bgcolor: 'rgba(237, 108, 2, 0.04)' }}>
                <Stack spacing={0.5}>
                  <Typography variant="body2" fontWeight="bold">⚠ 12 submissions require review</Typography>
                  <Typography variant="caption" color="text.secondary">Review pending student submissions</Typography>
                  <Typography variant="caption" color="text.disabled">10 minutes ago</Typography>
                </Stack>
              </MenuItem>
              
              <MenuItem sx={{ py: 1.5, px: 2 }}>
                <Stack spacing={0.5}>
                  <Typography variant="body2" fontWeight="bold">● New scholarship submission</Typography>
                  <Typography variant="caption" color="text.secondary">Scholarship Application submitted</Typography>
                  <Typography variant="caption" color="text.disabled">30 minutes ago</Typography>
                </Stack>
              </MenuItem>
              
              <MenuItem sx={{ py: 1.5, px: 2 }}>
                <Stack spacing={0.5}>
                  <Typography variant="body2" fontWeight="bold">✓ Form published successfully</Typography>
                  <Typography variant="caption" color="text.secondary">Student Registration is now live</Typography>
                  <Typography variant="caption" color="text.disabled">Yesterday</Typography>
                </Stack>
              </MenuItem>
              
              <Divider />
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="button" sx={{ color: '#1976D2', cursor: 'pointer' }}>View all notifications →</Typography>
              </Box>
            </Menu>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ cursor: 'pointer', pl: 1, borderLeft: '1px solid #E5E7EB' }}>
              <Avatar sx={{ bgcolor: '#1976D2', width: 32, height: 32, fontSize: '0.9rem' }}>A</Avatar>
              <Typography variant="body2" fontWeight="500" sx={{ display: { xs: 'none', sm: 'block' } }}>Admin ▼</Typography>
            </Stack>
          </Stack>
        </Box>
        
        {/* Page Content */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {children}
        </Box>
      </Box>

      {/* Search Command Palette Overlay */}
      <Dialog 
        open={searchOpen} 
        onClose={() => setSearchOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, top: '-15%', position: 'relative' }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search forms, students, submissions..."
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 0, 
                '& fieldset': { border: 'none', borderBottom: '1px solid #E5E7EB' },
                fontSize: '1.1rem',
                py: 1
              }
            }}
          />
          <Box sx={{ p: 2 }}>
            <Typography variant="overline" sx={{ color: '#9CA3AF', fontWeight: 'bold' }}>Recent Searches</Typography>
            <List dense>
              <ListItem disablePadding>
                <ListItemButton sx={{ borderRadius: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}><DescriptionIcon fontSize="small" sx={{ color: '#9CA3AF' }} /></ListItemIcon>
                  <ListItemText primary="Scholarship Form" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton sx={{ borderRadius: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}><PersonIcon fontSize="small" sx={{ color: '#9CA3AF' }} /></ListItemIcon>
                  <ListItemText primary="Rahul Kumar" />
                </ListItemButton>
              </ListItem>
            </List>
            
            <Typography variant="overline" sx={{ color: '#9CA3AF', fontWeight: 'bold', mt: 2, display: 'block' }}>Forms</Typography>
            <List dense>
              <ListItem disablePadding>
                <ListItemButton sx={{ borderRadius: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}><FolderIcon fontSize="small" sx={{ color: '#1976D2' }} /></ListItemIcon>
                  <ListItemText primary="Student Registration Form" secondary="Published" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default AdminLayout;

