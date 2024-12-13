import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(22); // Ngày được chọn mặc định
  const [currentMonth, setCurrentMonth] = useState(10); // Tháng hiện tại (0-indexed)
  const [currentYear, setCurrentYear] = useState(2024); // Năm hiện tại

  const datesWithEvents = [5, 12, 15, 22]; // Các ngày có sự kiện
  const events = [
    {
      time: "09:20 - 11:45",
      title: "156282 - Tư tưởng Hồ Chí Minh - SSH1151",
      location: "D9-301",
      description: "Sáng thứ 6, tiết 4-6, Tuần 12",
    },
    {
      time: "12:30 - 15:50",
      title: "151967 - Nhập môn an toàn thông tin - IT4015",
      location: "D3-5-401",
      description: "Chiều thứ 6, tiết 1-4, Tuần 12",
    },
  ];

  // Hàm tính số ngày trong tháng
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Xử lý thay đổi tháng
  const handleMonthChange = (direction) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(null); // Bỏ chọn ngày khi chuyển tháng
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
        padding: 2,
      }}
    >
      {/* Điều hướng tháng */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 2,
        }}
      >
        <IconButton onClick={() => handleMonthChange(-1)}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6" align="center">
          {new Date(currentYear, currentMonth).toLocaleString('default', {
            month: 'long',
          })}{' '}
          {currentYear}
        </Typography>
        <IconButton onClick={() => handleMonthChange(1)}>
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Lưới ngày trong tháng */}
      <Grid container spacing={1}>
        {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map(
          (_, index) => {
            const day = index + 1;
            return (
              <Grid item xs={1.7} key={day}>
                <Box
                  onClick={() => setSelectedDate(day)}
                  sx={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '50%',
                    backgroundColor:
                      day === selectedDate
                        ? '#d32f2f' // Màu đỏ cho ngày được chọn
                        : datesWithEvents.includes(day)
                        ? '#29b6f6' // Màu xanh cho ngày có sự kiện
                        : '#f5f5f5', // Màu nền mặc định
                    color: day === selectedDate ? '#fff' : '#000',
                    cursor: 'pointer',
                  }}
                >
                  {day}
                </Box>
              </Grid>
            );
          }
        )}
      </Grid>

      {/* Thông tin ngày được chọn */}
      <Typography variant="h6" sx={{ marginTop: 3 }}>
        {selectedDate
          ? `Ngày ${selectedDate} tháng ${
              currentMonth + 1
            } năm ${currentYear}`
          : 'Chọn một ngày'}
      </Typography>

      {/* Các sự kiện */}
      {selectedDate === 22 && currentMonth === 10 && currentYear === 2024 ? (
        events.map((event, index) => (
          <Paper
            key={index}
            elevation={2}
            sx={{
              padding: 2,
              marginTop: 2,
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
            }}
          >
            <Typography variant="body1" fontWeight="bold">
              {event.time}
            </Typography>
            <Typography variant="body2">{event.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {event.location}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {event.description}
            </Typography>
          </Paper>
        ))
      ) : (
        <Typography sx={{ marginTop: 2 }}>Không có sự kiện.</Typography>
      )}
    </Box>
  );
};

export default Calendar;
