import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, Container, Box, Paper, Avatar, Divider, 
  Button, Dialog, DialogContent, DialogTitle, IconButton, 
  List, ListItem, ListItemAvatar, ListItemText,
  TextField, CircularProgress, Snackbar, Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../utils/api';
import axios from 'axios';

function UserProfile({ open, onClose, onLogout, user }) {
  console.log('UserProfile rendered, open:', open);
  
  const [openInfo, setOpenInfo] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openChangeName, setOpenChangeName] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(true);
  
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [nameForm, setNameForm] = useState({
    newName: ''
  });

  const [userInfo, setUserInfo] = useState({
    id: '',
    email: '',
    name: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (user) {
      setUserInfo({
        id: user.user_id,
        email: user.email,
        name: user.user_name || user.username
      });
      setLoading(false);
    }
  }, [user]);

  const handleInfoOpen = () => {
    setOpenInfo(true);
    setShowMainMenu(false);
  };
  const handleInfoClose = () => {
    setOpenInfo(false);
    setShowMainMenu(true);
  };
  const handleChangePasswordOpen = () => {
    setOpenChangePassword(true);
    setShowMainMenu(false);
  };
  const handleChangePasswordClose = () => {
    setOpenChangePassword(false);
    setShowMainMenu(true);
  };
  const handleChangeNameOpen = () => {
    setOpenChangeName(true);
    setShowMainMenu(false);
  };
  const handleChangeNameClose = () => {
    setOpenChangeName(false);
    setShowMainMenu(true);
  };

  const handleNavigation = (action) => {
    switch(action) {
      case "Thông tin người dùng":
        handleInfoOpen();
        break;
      case "Đổi mật khẩu":
        setOpenChangePassword(true);
        break;
      case "Đổi tên":
        setOpenChangeName(true);
        break;
      case "Đăng xuất":
        if (onLogout) onLogout();
        onClose();
        break;
      default:
        break;
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleNameChange = (e) => {
    setNameForm({
      ...nameForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async () => {
    setIsSubmitting(true);
    try {
        // Kiểm tra mật khẩu mới và xác nhận mật khẩu
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showMessage("Mật khẩu mới và xác nhận mật khẩu không khớp!", "error");
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực!');
        }

        const response = await axios.put(
            'http://localhost:3000/api/users/change-password',
            {
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        // Cập nhật localStorage với token mới
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Đóng dialog và hiển thị thông báo thành công
        handleChangePasswordClose();
        showMessage(response.data.message);

        // Reset form
        setPasswordForm({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        });

    } catch (error) {
        showMessage(
            error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu!',
            'error'
        );
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleNameSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực!');
      }

      const response = await axios.put(
        'http://localhost:3000/api/users/change-name',
        { newName: nameForm.newName },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Cập nhật localStorage với thông tin mới
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Cập nhật state
      setUserInfo({
        ...userInfo,
        name: response.data.user.user_name
      });

      // Đóng dialog và hiển thị thông báo thành công
      handleChangeNameClose();
      showMessage(response.data.message);

      // Reset form
      setNameForm({ newName: '' });

    } catch (error) {
      // Hiển thị thông báo lỗi
      showMessage(error.response?.data?.message || 'Có lỗi xảy ra khi đổi tên!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showMessage = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ 
        sx: { 
          borderRadius: 4,
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0,
          width: '400px',
          '& .MuiDialog-paper': {
            margin: 0,
          }
        } 
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{userInfo.name}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {showMainMenu ? (
        <DialogContent sx={{ textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              margin: 'auto',
              marginBottom: 2,
              backgroundColor: '#3f51b5',
            }}
          >
            <PersonIcon fontSize="large" />
          </Avatar>
          <Typography variant="subtitle1">To Do List</Typography>
          <List>
            <ListItem button onClick={() => handleNavigation("Thông tin người dùng")}>
              <ListItemAvatar>
                <Avatar><PersonIcon /></Avatar>
              </ListItemAvatar>
              <ListItemText primary="Thông tin người dùng" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation("Đổi tên")}>
              <ListItemAvatar>
                <Avatar><PersonIcon /></Avatar>
              </ListItemAvatar>
              <ListItemText primary="Đổi tên" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation("Đổi mật khẩu")}>
              <ListItemAvatar>
                <Avatar><LockIcon /></Avatar>
              </ListItemAvatar>
              <ListItemText primary="Đổi mật khẩu" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation("Đăng xuất")}>
              <ListItemAvatar>
                <Avatar><ExitToAppIcon /></Avatar>
              </ListItemAvatar>
              <ListItemText primary="Đăng xuất" />
            </ListItem>
          </List>
        </DialogContent>
      ) : null}

      {/* Info Modal */}
      <Dialog
        open={openInfo}
        onClose={handleInfoClose}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton onClick={handleInfoClose}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Thông Tin Chi Tiết</Typography>
          <IconButton onClick={handleInfoClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                margin: 'auto',
                marginBottom: 2,
                backgroundColor: '#3f51b5',
              }}
            >
              <PersonIcon fontSize="large" />
            </Avatar>

            <Typography variant="h6" gutterBottom>
              Thông Tin Người Dùng
            </Typography>

            <Divider sx={{ marginY: 2 }} />

            <Box sx={{ textAlign: 'left', paddingX: 2 }}>
              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>ID:</strong> {userInfo.id}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>Email:</strong> {userInfo.email}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>Tên Người Dùng:</strong> {userInfo.name}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>Mật Khẩu:</strong> ********
              </Typography>
            </Box>
          </Paper>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog
        open={openChangePassword}
        onClose={handleChangePasswordClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton onClick={handleChangePasswordClose}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Đổi Mật Khẩu</Typography>
          <IconButton onClick={handleChangePasswordClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Mật khẩu cũ"
              type="password"
              name="oldPassword"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Mật khẩu mới"
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Nhập lại mật khẩu mới"
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              onClick={handlePasswordSubmit}
            >
              Xác nhận
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Change Name Modal */}
      <Dialog
        open={openChangeName}
        onClose={handleChangeNameClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton onClick={handleChangeNameClose}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Đổi Tên</Typography>
          <IconButton onClick={handleChangeNameClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Tên mới"
              name="newName"
              value={nameForm.newName}
              onChange={handleNameChange}
              error={nameForm.newName.length > 0 && nameForm.newName.length < 3}
              helperText={
                nameForm.newName.length > 0 && nameForm.newName.length < 3 
                  ? "Tên phải có ít nhất 3 ký tự"
                  : ""
              }
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              onClick={handleNameSubmit}
              disabled={nameForm.newName.length < 3 || isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default UserProfile;
