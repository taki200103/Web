import React, { useState } from 'react';
import { Box, Typography, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Calendar from './Calendar';

const Component2 = () => {
  const [openDialog, setOpenDialog] = useState(false);

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, p: 5 }}>
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
        <Box
          key={day}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Box
            sx={{
              width: 45,
              height: 45,
              borderRadius: '50%',
              bgcolor: '#e0e0e0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
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
              <IconButton onClick={handleDialogOpen} sx={{ color: '#fff' }}>
                <CalendarMonthIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      ))}

      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Chọn Ngày</DialogTitle>
        <DialogContent>
          <Calendar />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Component2;
