import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Avatar, 
  IconButton, 
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Component1 from './Component1';
import Component2 from './Component2';
import Component3 from './Component3';
import UserProfile from '../user_info/user_menu';

const MenuLayout = ({ onLogout }) => {
  const navigate = useNavigate();
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');

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

  const handleSearch = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.searchTasks(value);
      if (response.length > 0) {
        setSearchResults(response);
        setSelectedTask(response[0]); // Chọn task đầu tiên
        setOpenDialog(true);
      } else {
        setError('Không tìm thấy công việc nào.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Có lỗi xảy ra khi tìm kiếm.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  const handleCloseError = () => {
    setError('');
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

        <Box sx={{ 
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <TextField
            variant="outlined"
            placeholder="Tìm kiếm công việc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              width: '65%',
              '& .MuiOutlinedInput-root': {
                borderRadius: '30px',
                backgroundColor: '#fff'
              },
            }}
            InputProps={{
              endAdornment: loading && <CircularProgress size={20} />,
            }}
          />
        </Box>

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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Chi tiết công việc</DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box sx={{ minWidth: 400 }}>
              <Typography variant="h6" gutterBottom>
                {selectedTask.task}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Loại công việc:</strong> {selectedTask.taskType}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Trạng thái:</strong> {selectedTask.status}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Mô tả:</strong> {selectedTask.description}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Thời gian bắt đầu:</strong> {selectedTask.timeStart}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Thời gian kết thúc:</strong> {selectedTask.timeEnd}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Người tạo:</strong> {selectedTask.createdBy}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Ngày tạo:</strong> {selectedTask.createdAt}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

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
