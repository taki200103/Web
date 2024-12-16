import React, { useState, useEffect } from 'react';
import { Box, IconButton, Menu, MenuItem, Dialog, Typography, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupMenu from '../group/GroupMenu';
import UserProfile from '../user_info/user_menu';
import { useNavigate } from 'react-router-dom';
import CreateGroupDialog from './CreateGroupDialog';
import axios from 'axios';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

//

const Component1 = ({ user }) => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [openGroupMenu, setOpenGroupMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [groupIdToJoin, setGroupIdToJoin] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('authToken');
        console.log('Token:', token);

        const response = await axios.get(
          'http://localhost:3000/api/groups/user-groups',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        console.log('API Response:', response.data);

        if (response.data.success) {
          setGroups(response.data.groups);
          console.log('Groups after setting:', response.data.groups);
        }
      } catch (error) {
        console.error('Error details:', error.response || error);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    console.log('Current groups state:', groups);
  }, [groups]);

  const handleAddGroup = () => {
    setOpenCreateGroup(true);
  };

  const handleContextMenu = (event, index) => {
    event.preventDefault();
    setSelectedIndex(index); // Lưu chỉ mục của ô được chọn
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
    });
  };

  const handleClose = () => {
    setContextMenu(null);
    setSelectedIndex(null);
    setIsMenuOpen(false);
  };

  const handleRemoveGroup = () => {
    setGroups((prev) => prev.filter((_, i) => i !== selectedIndex));
    handleClose();
  };

  const handleGroupClick = (group) => {
    console.log('Selected group:', group); // Debug log
    setSelectedGroup(group);
    setOpenGroupMenu(true);
  };

  const handleCloseGroupMenu = () => {
    setOpenGroupMenu(false);
  };

  const handleOpen = () => {
    setIsMenuOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleOpenMainMenu = () => {
    setIsMenuOpen(true);
  };

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [...prev, newGroup]);
  };

  const handleJoinGroup = async () => {
    try {
        if (!groupIdToJoin.trim()) {
            alert('Vui lòng nhập Group ID!');
            return;
        }

        const token = localStorage.getItem('authToken');
        const response = await axios.post(
            `http://localhost:3000/api/groups/${groupIdToJoin}/join`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (response.data.success) {
            alert(response.data.message);
            setOpenJoinDialog(false);
            setGroupIdToJoin('');
        } else {
            alert(response.data.message || 'Có lỗi xảy ra!');
        }
    } catch (error) {
        console.error('Join group error:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi tham gia nhóm!');
    }
  };

  return (
    <Box
      sx={{
        width: '250px', // Chiều rộng cố định của sidebar
        height: '100vh', // Chiều cao 100% của viewport
        bgcolor: '#f5f5f5', // Màu nền xám nhạt
        display: 'flex',
        flexDirection: 'column', // Sắp xếp các phần tử theo chiều dọc
        alignItems: 'center', // Căn giữa các phần tử theo chiều ngang
        p: 2, // Padding 16px
        border: '1px solid #ccc', // Viền xám nhạt
        borderRadius: 1, // Bo góc nhẹ
      }}
    >
      {/* Avatar hình tròn với ảnh nền */}
      <Box
        sx={{
          width: 100,
          height: 100,
          borderRadius: '50%', // Bo tròn thành hình tròn
          backgroundImage: 'url("/todo.png")',
          backgroundSize: 'cover', // Ảnh phủ kín container
          backgroundPosition: 'center',
          flexShrink: 0, // Không cho phép co lại khi không gian không đủ
          mb: 2, // Margin bottom 16px
        }}
      ></Box>

      {/* Nút + để thêm nhóm */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start', // Căn trái các phần tử
          width: '100%',
          gap: 1, // Khoảng cách 8px giữa các phần t
          mb: 2,
        }}
      >
        <IconButton onClick={handleAddGroup} color="primary">
          <AddIcon />
        </IconButton>
        <IconButton onClick={() => setOpenJoinDialog(true)} color="primary">
          <GroupAddIcon />
        </IconButton>
      </Box>

      {/* Danh sách các ô group */}
      <Box
        sx={{
          width: '100%',
          bgcolor: '#e0e0e0',
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 150px)',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '4px'
          }
        }}
      >
        {groups.length === 0 ? (
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center', 
              color: 'text.secondary',
              py: 2 
            }}
          >
            Chưa có nhóm nào
          </Typography>
        ) : (
          groups.map((group) => (
            <Box
              key={group.group_id}
              onClick={() => handleGroupClick(group)}
              onContextMenu={(e) => handleContextMenu(e, group)}
              sx={{
                width: '100%',
                minHeight: 65,
                bgcolor: '#fff',
                borderRadius: 1,
                p: 2,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {group.group_name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {group.role === 'leader' ? 'Trưởng nhóm' : 'Thành viên'}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {/* Dialog hiển thị GroupMenu */}
      <Dialog
        open={openGroupMenu}
        onClose={handleCloseGroupMenu}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '90vw',
            height: '90vh',
            maxWidth: 'none',
            maxHeight: 'none'
          }
        }}
      >
        <GroupMenu group={selectedGroup} onClose={handleCloseGroupMenu} />
      </Dialog>

      {/* Menu ngữ cảnh với vị trí dựa trên tọa độ chuột */}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleRemoveGroup}>Xóa</MenuItem>
      </Menu>

      <UserProfile 
        open={isMenuOpen}
        onClose={handleClose}
        onLogout={handleLogout}
        openMainMenu={handleOpenMainMenu}
        user={user}
      />

      <CreateGroupDialog
        open={openCreateGroup}
        onClose={() => setOpenCreateGroup(false)}
        onSuccess={handleGroupCreated}
      />

      <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)}>
        <DialogTitle>Tham gia nhóm</DialogTitle>
        <DialogContent>
            <TextField
                autoFocus
                margin="dense"
                label="Nhập Group ID"
                fullWidth
                value={groupIdToJoin}
                onChange={(e) => setGroupIdToJoin(e.target.value)}
                sx={{
                    '& .MuiInputLabel-root': {
                        color: '#000000',  // Màu đen cho label
                        fontWeight: 400    // Giảm độ đậm của chữ (normal weight)
                    },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#1976d2'  // Màu xanh cho border
                        },
                        '&:hover fieldset': {
                            borderColor: '#1976d2'  // Màu xanh khi hover
                        }
                    }
                }}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenJoinDialog(false)}>Hủy</Button>
            <Button 
                onClick={handleJoinGroup}
                disabled={groupIdToJoin.trim() === ''}
            >
                Gửi yêu cầu
            </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Component1;
