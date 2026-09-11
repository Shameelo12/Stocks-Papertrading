import React, { useState } from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar + main.
          minHeight: 0 is load-bearing. A flex item defaults to min-height:auto,
          which refuses to shrink below its content; without this the row is sized
          by the page content instead of the viewport, and the sidebar stops
          wherever the content happens to end rather than reaching the bottom. */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
