import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Badge,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  InputBase,
  alpha,
  styled
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  Description as FormsIcon,
  Assignment as ApplicationsIcon,
  Folder as DocumentsIcon,
  CardMembership as CertificatesIcon,
  HelpOutline as HelpIcon,
  Person as PersonIcon,
  School as AcademicIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useUserAuth } from '../../context/UserAuthContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const NAV_ITEMS = [
  { label: 'Home', path: '/user/dashboard', icon: <HomeIcon /> },
  { label: 'Forms', path: '/forms', icon: <FormsIcon /> },
  { label: 'My Applications', path: '/user/my-submissions', icon: <ApplicationsIcon /> },
  { label: 'My Documents', path: '/user/documents', icon: <DocumentsIcon /> },
  { label: 'Certificates', path: '/user/certificates', icon: <CertificatesIcon /> },
  { label: 'Help', path: '/user/help', icon: <HelpIcon /> },
];

function StudentHeader({ mobileOpen, handleDrawerToggle }) {
  const { user, logout } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  
  const handleOpenNotifications = (event) => setAnchorElNotifications(event.currentTarget);
  const handleCloseNotifications = () => setAnchorElNotifications(null);

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/user/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ my: 2 }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
          🎓 Student Services
        </Typography>
        <Typography variant="caption" color="text.secondary">
          College Online Portal
        </Typography>
      </Box>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton 
              component={Link} 
              to={item.path}
              selected={location.pathname === item.path || (item.path === '/forms' && location.pathname.startsWith('/forms'))}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  borderRight: '3px solid #2563eb'
                }
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#2563eb' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  color: location.pathname === item.path ? '#2563eb' : 'inherit'
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Desktop Logo */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/user/dashboard"
              sx={{
                mr: 4,
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                textDecoration: 'none',
              }}
            >
              <Box component="span" sx={{ fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 1 }}>
                <span className="text-2xl">🎓</span> Student Services Portal
              </Box>
              <Box component="span" sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, mt: -0.5 }}>
                College Online Application & Services
              </Box>
            </Typography>

            {/* Mobile Menu Icon */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="open drawer"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Mobile Logo */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/user/dashboard"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 700,
                color: '#1e3a8a',
                textDecoration: 'none',
                alignItems: 'center',
                gap: 1
              }}
            >
              <span>🎓</span> Portal
            </Typography>

            {/* Desktop Navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path || (item.path === '/forms' && location.pathname.startsWith('/forms'));
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </Box>

            {/* Right Side Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 0 }}>
              <Search sx={{ display: { xs: 'none', sm: 'block' } }}>
                <SearchIconWrapper>
                  <SearchIcon fontSize="small" />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search forms..."
                  inputProps={{ 'aria-label': 'search' }}
                />
              </Search>

              <Tooltip title="Notifications">
                <IconButton size="large" onClick={handleOpenNotifications} color="inherit" sx={{ ml: 1 }}>
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Menu
                sx={{ mt: '45px' }}
                id="menu-notifications"
                anchorEl={anchorElNotifications}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElNotifications)}
                onClose={handleCloseNotifications}
              >
                <MenuItem onClick={handleCloseNotifications}>
                  <Typography variant="body2">Your Bonafide application has been approved.</Typography>
                </MenuItem>
                <MenuItem onClick={handleCloseNotifications}>
                  <Typography variant="body2">Scholarship application requires correction.</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleCloseNotifications} sx={{ justifyContent: 'center', color: 'primary.main' }}>
                  <Typography variant="body2" fontWeight="bold">View All Notifications</Typography>
                </MenuItem>
              </Menu>

              <Tooltip title="Student Profile">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 2, border: '2px solid #e2e8f0' }}>
                  <Avatar alt={user?.username || 'Student'} src="/static/images/avatar/2.jpg" sx={{ bgcolor: '#2563eb' }}>
                    {getInitials(user?.username)}
                  </Avatar>
                </IconButton>
              </Tooltip>
              
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight="bold">{user?.username || 'Student'}</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.email || 'student@college.edu'}</Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/user/profile'); }}>
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                  My Profile
                </MenuItem>
                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/user/profile'); }}>
                  <ListItemIcon><AcademicIcon fontSize="small" /></ListItemIcon>
                  Academic Details
                </MenuItem>
                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/user/documents'); }}>
                  <ListItemIcon><DocumentsIcon fontSize="small" /></ListItemIcon>
                  My Documents
                </MenuItem>
                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/user/settings'); }}>
                  <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon fontSize="small" /></ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile.
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default StudentHeader;
