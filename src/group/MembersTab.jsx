import React, { useState } from "react";
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
} from "@mui/material";

const MembersTab = () => {
  const [members, setMembers] = useState([
    { id: 55, name: "Đỗ Quang Bắc Kỳ", email: "ky.dqb226111@sis.hust.edu.vn", role: "member", status: "Registered", joinedAt: "2024-10-21 12:00:17" },
    { id: 47, name: "Nguyễn Quốc Khánh", email: "khanh.nq235118@sis.hust.edu.vn", role: "member", status: "Registered", joinedAt: "2024-10-08 21:40:15" },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "" });

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewMember({ name: "", email: "" });
  };

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      setMembers([
        ...members,
        {
          id: members.length + 1,
          name: newMember.name,
          email: newMember.email,
          role: "member",
          status: "Registered",
          joinedAt: new Date().toISOString(),
        },
      ]);
      handleCloseDialog();
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h5" mb={2}>
        Members
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpenDialog} sx={{ mb: 2 }}>
        Add People
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.id}</TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>{member.status}</TableCell>
                <TableCell>{member.joinedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog thêm thành viên */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Member</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            fullWidth
            value={newMember.email}
            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAddMember}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MembersTab;
