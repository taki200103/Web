import React from 'react';
import { Box, TextField } from '@mui/material';

// thanh tìm kiếm

const Component4 = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: '35px' }}> {/* Thêm marginTop rõ ràng */}
      <TextField
        variant="outlined"
        placeholder="Search..."
        sx={{
          width: '65%',
          '& .MuiOutlinedInput-root': {
            borderRadius: '30px', // Bo góc cho thanh tìm kiếm
          },
        }}
      />
    </Box>
  );
};

export default Component4;
