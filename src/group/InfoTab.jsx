import React from "react";
import { Box, Typography, Table, TableBody, TableRow, TableCell, Paper, CircularProgress } from "@mui/material";

const InfoTab = ({ groupInfo, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!groupInfo) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography color="text.secondary">
          Không tìm thấy thông tin nhóm
        </Typography>
      </Box>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatTime = (time) => {
    return time ? time.substring(0, 5) : '';
  };

  return (
    <Box sx={{ width: '90%', margin: '0 auto' }}>
      <Typography variant="h5" mb={3} align="center" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        Group Information
      </Typography>
      <Paper elevation={2}>
        <Table size="small">
          <TableBody>
            <TableRow hover>
              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Group ID</TableCell>
              <TableCell>{groupInfo.group_id}</TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Name</TableCell>
              <TableCell>{groupInfo.group_name}</TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell sx={{ fontWeight: 'bold' }}>Created by</TableCell>
              <TableCell>{groupInfo.leader_name}</TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell sx={{ fontWeight: 'bold' }}>Created at</TableCell>
              <TableCell>
                {formatDate(groupInfo.creation_date)} {formatTime(groupInfo.time_created)}
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell sx={{ fontWeight: 'bold' }}>Number of members</TableCell>
              <TableCell>{groupInfo.total_members}</TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell>{groupInfo.description || 'No description'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default InfoTab;
