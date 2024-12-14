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

  useEffect(() => {
    const fetchMembers = async () => {
      if (!groupId) return;

      try {
        const token = localStorage.getItem('authToken');
        console.log('Fetching members for group:', groupId);
        
        const response = await axios.get(
          `http://localhost:3000/api/groups/${groupId}/members`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        console.log('Members response:', response.data);
        setMembers(response.data.members);
        setIsLeader(response.data.isLeader);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching members:', error);
        setLoading(false);
      }
    };

    fetchMembers();
  }, [groupId]);

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

      // Refresh member list
      const response = await axios.get(
        `http://localhost:3000/api/groups/${groupId}/members`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setMembers(response.data.members);
      handleCloseDialog();
      alert('Thêm thành viên thành công!');
    } catch (error) {
      console.error('Error adding member:', error);
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
      console.log('Deleting member:', selectedMember); // Debug log

      await axios.delete(
        `http://localhost:3000/api/groups/${groupId}/members/${selectedMember.user_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Refresh member list
      const response = await axios.get(
        `http://localhost:3000/api/groups/${groupId}/members`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMembers(response.data.members);
      setConfirmDelete(false);
      setSelectedMember(null);
      alert('Xóa thành viên thành công!');
    } catch (error) {
      console.error('Error deleting member:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa thành viên!');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Members
        </Typography>
        {isLeader && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleOpenDialog}
          >
            Add Member
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Joined At</TableCell>
              {isLeader && <TableCell align="center">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isLeader ? 5 : 4} align="center">
                  Chưa có thành viên nào
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.user_id}>
                  <TableCell>{member.user_id}</TableCell>
                  <TableCell>{member.user_name}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    {new Date(member.date_join).toLocaleDateString('vi-VN')} {member.time_join?.substring(0, 5)}
                  </TableCell>
                  {isLeader && (
                    <TableCell align="center">
                      {member.role !== 'leader' && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(member)}
                        >
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Member</DialogTitle>
        <DialogContent>
          <TextField
            label="User ID"
            fullWidth
            value={newMemberId}
            onChange={(e) => setNewMemberId(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Nhập User ID của thành viên"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAddMember}>
            Add
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
