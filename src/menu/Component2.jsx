import React, { useState } from 'react';
import { Box, Typography, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Calendar from './Calendar'; // Giả sử bạn đã tạo Calendar component như trên , co the xoa menu di de ko loi

// Lịch

const Component2 = () => {
  const [openDialog, setOpenDialog] = useState(false); // State để mở/đóng Dialog

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, p: 1 }}>
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
        <Box
          key={day}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          <Box
            sx={{
              width: 45,
              height: 45,
              borderRadius: '50%',
              bgcolor: '#f5f5f5',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography>{day}</Typography>
          </Box>
          {day === 'Sun' && (
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '39%',
                bgcolor: '#1976d2',
                color: '#fff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <IconButton onClick={handleDialogOpen}>
                <CalendarMonthIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      ))}

      {/* Hộp thoại hiển thị Calendar */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Chọn Ngày</DialogTitle>
        <DialogContent>
          <Calendar /> {/* Thêm component Calendar của bạn vào đây */}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Component2;
