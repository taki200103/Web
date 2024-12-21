import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Avatar, 
  IconButton
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import Component1 from './Component1';
import Component2 from './Component2';
import Component3 from './Component3';
import Component4 from './Component4';
import UserProfile from '../user_info/user_menu';

const MenuLayout = ({ onLogout }) => {
  const navigate = useNavigate();
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        p: 1,
        borderRadius: '17px',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Component1 user={user} />

      <Box sx={{ 
        flex: 1,
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: '140px',
        paddingRight: '200px',
        overflow: 'auto',
        maxWidth: 'calc(100% - 200px)',
      }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: '1000px',
            margin: '0 auto 40px',
            height: 80,
            backgroundImage: 'url(/logo.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        />

        <Component4 />

        <Box sx={{
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
        }}>
          <Component2 />
          <Component3 />
        </Box>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: 30,
          right: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 1.75,
          zIndex: 20,
        }}
      >
        <IconButton
          aria-label="notifications"
          sx={{
            width: 60,
            height: 60,
            bgcolor: 'transparent',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <NotificationsIcon sx={{ fontSize: 30 }} />
        </IconButton>

        <IconButton
          onClick={() => setOpenUserMenu(true)}
          sx={{
            p: 0,
            '&:hover': {
              opacity: 0.8,
            },
          }}
        >
          <Avatar
            alt="User Avatar"
            src="/path/to/avatar.jpg"
            sx={{ width: 57, height: 57 }}
          />
        </IconButton>
      </Box>

      <UserProfile 
        open={openUserMenu}
        onClose={() => setOpenUserMenu(false)}
        onLogout={handleLogout}
        user={user}
      />
    </Box>
  );
};

export default MenuLayout;
