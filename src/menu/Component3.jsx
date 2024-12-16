import React, { useState } from 'react';
import { Box, Grid, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import TaskList from './TaskList';

const Component3 = () => {
  const [open, setOpen] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState(null);
  //các ô group
  // Định nghĩa items với id tương ứng
  const items = [
    { id: 1, name: 'Học Tập' },
    { id: 2, name: 'Công Việc' },
    { id: 3, name: 'Gia Đình' },
    { id: 4, name: 'Hàng Ngày' },
    { id: 5, name: 'Hàng Tháng' },
    { id: 6, name: 'Hàng Năm' }
  ];

  // Hàm mở dialog với taskTypeId
  const handleClickOpen = (taskTypeId) => {
    setSelectedTaskType(taskTypeId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTaskType(null);
  };

  return (
    <Box sx={{ 
      flex: 1,
      pl: '8px',
      mt: 12,
    }}>
      <Grid container spacing={2.5} sx={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={item.id}>
            <Box
              onClick={() => handleClickOpen(item.id)}
              sx={{
                width: '100%',
                height: 150,
                bgcolor: '#e0e0e0',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 25,
                fontWeight: 'bold',
                color: '#1976d2',
                cursor: 'pointer',
              }}
            >
              {item.name}
            </Box>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
      >
        <DialogTitle>Danh Sách Nhiệm Vụ</DialogTitle>
        <DialogContent sx={{
          width: 900,
          height: 600,
          overflowY: 'auto',
        }}>
          <TaskList taskTypeId={selectedTaskType} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Component3;
