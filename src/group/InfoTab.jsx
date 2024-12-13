import React from "react";
import { Box, Typography, Table, TableBody, TableRow, TableCell, Paper } from "@mui/material";

const InfoTab = () => {
  const projectData = {
    name: "Project 1",
    creator: "BKCS SOICT",
    organization: "SoICT",
    createdAt: "2024-09-30 14:09:29",
    numberOfMembers: 25,
    numberOfTasks: 41,
    description:
      "Củng cố và mở rộng kiến thức chuyên môn, liên kết kiến thức của một nhóm học phần. Khuyến khích sinh viên phát triển kỹ năng chuyên nghiệp, năng lực làm việc theo nhóm.",
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
              <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Name</TableCell>
              <TableCell sx={{ width: '30%' }}>{projectData.name}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Creator</TableCell>
              <TableCell sx={{ width: '30%' }}>{projectData.creator}</TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell sx={{ fontWeight: 'bold' }}>Organization</TableCell>
              <TableCell>{projectData.organization}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Created at</TableCell>
              <TableCell>{projectData.createdAt}</TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell sx={{ fontWeight: 'bold' }}>Number of members</TableCell>
              <TableCell>{projectData.numberOfMembers}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Number of tasks</TableCell>
              <TableCell>{projectData.numberOfTasks}</TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell colSpan={3}>{projectData.description}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default InfoTab;
