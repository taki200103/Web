import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableHead,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import axios from 'axios';

const MembersTab = ({ groupId }) => {
  const [members, setMembers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");
  const [isLeader, setIsLeader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const fetchMembers = async () => {
    if (!groupId) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:3000/api/groups/${groupId}/members`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMembers(response.data.members);
      setIsLeader(response.data.isLeader);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching members:', error);
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!isLeader) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:3000/api/groups/${groupId}/requests`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  useEffect(() => {
    if (isLeader) {
      fetchRequests();
    }
  }, [groupId, isLeader]);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewMemberId("");
  };

  const handleAddMember = async () => {
    if (!newMemberId.trim()) {
      alert('Vui lòng nhập User ID!');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `http://localhost:3000/api/groups/${groupId}/members`,
        { userId: newMemberId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      await fetchMembers();
      handleCloseDialog();
      alert('Thêm thành viên thành công!');
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi thêm thành viên!');
    }
  };

  const handleDeleteClick = (member) => {
    if (member.role === 'leader') {
      alert('Không thể xóa leader khỏi nhóm!');
      return;
    }
    setSelectedMember(member);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `http://localhost:3000/api/groups/${groupId}/members/${selectedMember.user_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      await fetchMembers();
      setConfirmDelete(false);
      setSelectedMember(null);
      alert('Xóa thành viên thành công!');
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa thành viên!');
    }
  };

  const handleRequest = async (userId, action) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `http://localhost:3000/api/groups/${groupId}/requests/${userId}`,
        { action },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (action === 'accept') {
        await fetchMembers();
      }
      await fetchRequests();
      
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleChangeTab}>
          <Tab label="Thành viên" />
          {isLeader && <Tab label={`Yêu cầu tham gia (${requests.length})`} />}
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Danh sách thành viên
            </Typography>
            {isLeader && (
              <Button 
                variant="contained" 
                onClick={handleOpenDialog}
              >
                Thêm thành viên
              </Button>
            )}
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên thành viên</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell>Ngày tham gia</TableCell>
                  {isLeader && <TableCell align="right">Thao tác</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.user_id}>
                    <TableCell>{member.user_name}</TableCell>
                    <TableCell>
                      {member.role === 'leader' ? 'Trưởng nhóm' : 'Thành viên'}
                    </TableCell>
                    <TableCell>
                      {new Date(member.date_join).toLocaleDateString('vi-VN')}
                    </TableCell>
                    {isLeader && (
                      <TableCell align="right">
                        {member.role !== 'leader' && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteClick(member)}
                          >
                            Xóa
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {members.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isLeader ? 4 : 3} align="center">
                      Chưa có thành viên nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {activeTab === 1 && isLeader && (
        <>
          <Typography variant="h6" mb={2}>
            Danh sách yêu cầu tham gia
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên</TableCell>
                  <TableCell>Ngày yêu cầu</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.user_id}>
                    <TableCell>{request.user_name}</TableCell>
                    <TableCell>
                      {new Date(request.date_join).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleRequest(request.user_id, 'accept')}
                        sx={{ mr: 1 }}
                      >
                        Chấp nhận
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleRequest(request.user_id, 'reject')}
                      >
                        Từ chối
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Không có yêu cầu tham gia nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Thêm thành viên mới</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="User ID"
            fullWidth
            value={newMemberId}
            onChange={(e) => setNewMemberId(e.target.value)}
            placeholder="Nhập User ID của thành viên"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleAddMember}>
            Thêm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Xác nhận xóa thành viên</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa thành viên {selectedMember?.user_name} khỏi nhóm?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MembersTab;
