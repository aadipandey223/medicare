import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  Avatar,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  LockReset as LockResetIcon,
  History as HistoryIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import GoldDustCursor from './GoldDustCursor';

const drawerWidth = 280;

function AdminNavigation({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Doctor Management', icon: <PeopleIcon />, path: '/admin/doctors' },
    { text: 'Patient Management', icon: <PersonIcon />, path: '/admin/patients' },
    { text: 'Password Resets', icon: <LockResetIcon />, path: '/admin/password-resets' },
    { text: 'Audit Logs', icon: <HistoryIcon />, path: '/admin/audit-logs' },
    { text: 'System Settings', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#0b0b0c', color: '#e0e0e0' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(192, 192, 192, 0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(192, 192, 192, 0.2)',
              border: '2px solid rgba(192, 192, 192, 0.3)',
            }}
          >
            <AdminIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#e0e0e0' }}>
              Admin Portal
            </Typography>
            <Chip
              label="Admin"
              size="small"
              sx={{
                bgcolor: 'rgba(184, 134, 11, 0.2)',
                color: '#DAA520',
                border: '1px solid rgba(218, 165, 32, 0.3)',
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Box>
        </Box>
        <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
          {user?.name || 'Admin User'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#666' }}>
          {user?.email || ''}
        </Typography>
      </Box>

      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  bgcolor: isActive ? 'rgba(192, 192, 192, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(192, 192, 192, 0.3)' : '1px solid transparent',
                  '&:hover': {
                    bgcolor: 'rgba(192, 192, 192, 0.1)',
                    border: '1px solid rgba(192, 192, 192, 0.2)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#DAA520' : '#a0a0a0', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#e0e0e0' : '#a0a0a0',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
        <Divider sx={{ mb: 2, borderColor: 'rgba(192, 192, 192, 0.1)' }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            border: '1px solid rgba(192, 192, 192, 0.1)',
            '&:hover': {
              bgcolor: 'rgba(192, 192, 192, 0.1)',
              border: '1px solid rgba(192, 192, 192, 0.2)',
            },
            transition: 'all 0.2s',
          }}
        >
          <ListItemIcon sx={{ color: '#a0a0a0', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: '0.9rem',
              color: '#a0a0a0',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0b0b0c' }}>
      <GoldDustCursor />
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#0b0b0c',
              borderRight: '1px solid rgba(192, 192, 192, 0.1)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#0b0b0c',
              borderRight: '1px solid rgba(192, 192, 192, 0.1)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#0b0b0c',
          minHeight: '100vh',
        }}
      >
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            mr: 2,
            display: { sm: 'none' },
            color: '#e0e0e0',
            mb: 2,
          }}
        >
          <MenuIcon />
        </IconButton>
        {children}
      </Box>
    </Box>
  );
}

export default AdminNavigation;

