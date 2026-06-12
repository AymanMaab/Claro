import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, IconButton, Avatar } from '@mui/material';
import { Menu, Bell } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import Sidebar from './Sidebar';

const MOBILE_BREAKPOINT = 480;

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobile = () => setMobileOpen((o) => !o);

  const user = useAppSelector((s) => s.auth.user);
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?'
    : '?';


  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <Box
          onClick={toggleMobile}
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.4)',
            zIndex: 1199,
          }}
        />
      )}

      <Sidebar
        isMobile={isMobile}
        isOpen={mobileOpen}
        onToggle={toggleMobile}
      />

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ml: isMobile ? '58px' : 0,
          transition: 'margin-left 0.25s ease',
        }}
      >
        {/* TopBar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: 'primary.dark',
            borderBottom: '1px solid',
            borderColor: 'rgba(255,255,255,0.1)',
            color: '#fff',
          }}
        >
          <Toolbar sx={{ minHeight: '64px !important', gap: 1 }}>
            {isMobile && (
              <IconButton edge="start" onClick={toggleMobile} size="small" sx={{ color: '#fff' }}>
                <Menu size={20} />
              </IconButton>
            )}
            <Box sx={{ flex: 1 }} />
            <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}>
              <Bell size={20} />
            </IconButton>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                ml: 1,
                fontSize: 13,
                fontWeight: 600,
                background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.light} 100%)`,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {initials}
            </Avatar>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
