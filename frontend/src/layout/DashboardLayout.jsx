import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 260;

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/import', label: 'Import', icon: <UploadFileIcon /> },
  { path: '/notification', label: 'Send notification', icon: <NotificationsIcon /> },
];

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (!isMobile) setOpen(true);
  }, [isMobile]);

  const handleDrawerToggle = () => setOpen(!open);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNav = (path) => {
    navigate(path);
    if (isMobile) setOpen(false);
  };
  const handleLogoutClick = () => {
    handleMenuClose();
    setLogoutConfirmOpen(true);
  };
  const handleLogoutConfirm = () => {
    setLogoutConfirmOpen(false);
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <>
      <Box
        onClick={() => navigate('/dashboard')}
        sx={{
          minHeight: { xs: 72, sm: 80 },
          px: 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
          color: '#fff',
          transition: 'opacity 0.2s ease',
          '&:hover': { opacity: 0.92 },
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.2)',
          }}
        >
          <NotificationsActiveIcon sx={{ fontSize: 26 }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="700" noWrap sx={{ lineHeight: 1.2 }}>
            Student Push
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }} noWrap>
            Notifications
          </Typography>
        </Box>
        {!isMobile && (
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); handleDrawerToggle(); }}
            aria-label="toggle drawer"
            sx={{ color: 'inherit' }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List sx={{ px: 0.5 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => handleNav(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
    </>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: open && !isMobile ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          ml: open && !isMobile ? `${DRAWER_WIDTH}px` : 0,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            {open && !isMobile ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={handleMenuOpen} sx={{ p: 0.5 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem disabled>
              <Typography variant="body2">{user?.name} ({user?.role})</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogoutClick}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
          <Dialog open={logoutConfirmOpen} onClose={() => setLogoutConfirmOpen(false)}>
            <DialogTitle>Logout</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to logout?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setLogoutConfirmOpen(false)}>Cancel</Button>
              <Button onClick={handleLogoutConfirm} color="error" variant="contained">
                Logout
              </Button>
            </DialogActions>
          </Dialog>
        </Toolbar>
      </AppBar>

      {/* Desktop: permanent drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            width: open ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              top: 64,
              height: 'calc(100vh - 64px)',
              transition: (theme) =>
                theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              ...(!open && {
                overflowX: 'hidden',
                width: 0,
                borderRight: 0,
              }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile: temporary drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              top: 56,
              height: 'calc(100vh - 56px)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pt: { xs: '56px', sm: '64px' },
          pl: 0,
          backgroundColor: '#fff',
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            flex: 1,
            py: { xs: 2, sm: 2.5, md: 3 },
            px: { xs: 2, sm: 3 },
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
