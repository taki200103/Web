import React from 'react';
import { Box, Avatar } from '@mui/material';
import Component1 from './menu/Component1';
import Component2 from './menu/Component2';
import Component3 from './menu/Component3';
import Component4 from './menu/Component4';

const MenuLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        p: 1.5,
        borderRadius: '16px', // Bo góc cho toàn bộ layout
        overflow: 'hidden',  // Đảm bảo phần tử con không vượt ra ngoài góc bo
      }}
    >
      {/* Component 1 */}
      <Component1 />

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Logo phía trên Lịch với borderRadius */}
        <Box
          sx={{
            width: '80%',
            margin: '0 auto 40px',
            height: 80,
            backgroundImage: 'url(/logo.png)', // Đường dẫn logo
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            borderRadius: '16px', // Bo góc cho ảnh logo
            overflow: 'hidden', // Đảm bảo rằng không có phần nào vượt ra ngoài góc bo
          }}
        />

        {/* Component 2 - Lịch */}
        <Component2 />

        {/* Component 4 - Thanh tìm kiếm */}
        <Component4 />

        {/* Component 3 */}
        <Component3 />
      </Box>

      {/* Hình tròn avatar nhỏ ở góc trên bên phải */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 30,
          zIndex: 20, // Đảm bảo nó nằm trên các phần tử khác
        }}
      >
        <Avatar
          alt="User Avatar"
          src="/path/to/avatar.jpg"  // Đường dẫn ảnh avatar
          sx={{ width: 70, height: 70 }}  // Kích thước avatar
        />
      </Box>
    </Box>
  );
};

export default MenuLayout;
