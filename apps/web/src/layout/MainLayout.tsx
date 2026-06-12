import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const MOBILE_BREAKPOINT = 768;

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
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ minHeight: '64px !important', gap: 1 }}>
            {isMobile && (
              <IconButton edge="start" onClick={toggleMobile} size="small">
                <Menu size={20} />
              </IconButton>
            )}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
              {/* Page title will go here */}
            </Typography>
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
