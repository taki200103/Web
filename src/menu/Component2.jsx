import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton,
  Paper 
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Calendar from './Calendar';
import api from '../utils/api';

const Component2 = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [currentWeekTasks, setCurrentWeekTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [openDayDialog, setOpenDayDialog] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasks = [];
        for (let type = 1; type <= 6; type++) {
          const data = await api.getTasksByType(type);
          if (data) {
            tasks.push(...data);
          }
        }
        console.log('Fetched tasks:', tasks);
        setCurrentWeekTasks(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
    const intervalId = setInterval(fetchTasks, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const getCurrentWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);

    const weekDays = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDays.push({
        name: days[i],
        date: date,
        isToday: date.toDateString() === now.toDateString()
      });
    }

    return weekDays;
  };

  const checkDateHasTask = (date) => {
    return currentWeekTasks.some(task => {
      const [startDateStr] = task.timeStart.split(' ');
      const [startDay, startMonth, startYear] = startDateStr.split('/').map(Number);
      const startDate = new Date(startYear, startMonth - 1, startDay);
      
      const [endDateStr] = task.timeEnd.split(' ');
      const [endDay, endMonth, endYear] = endDateStr.split('/').map(Number);
      const endDate = new Date(endYear, endMonth - 1, endDay);

      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const getTasksForDate = (date) => {
    return currentWeekTasks.filter(task => {
      const [startDateStr] = task.timeStart.split(' ');
      const [startDay, startMonth, startYear] = startDateStr.split('/').map(Number);
      const startDate = new Date(startYear, startMonth - 1, startDay);
      
      const [endDateStr] = task.timeEnd.split(' ');
      const [endDay, endMonth, endYear] = endDateStr.split('/').map(Number);
      const endDate = new Date(endYear, endMonth - 1, endDay);

      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setOpenDayDialog(true);
  };

  const handleDayDialogClose = () => {
    setOpenDayDialog(false);
    setSelectedDay(null);
  };

  const weekDays = getCurrentWeekDates();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, p: 5 }}>
      {weekDays.map((day) => (
        <Box
          key={day.name}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Box
            onClick={() => handleDayClick(day)}
            sx={{
              width: 45,
              height: 45,
              borderRadius: '50%',
              bgcolor: checkDateHasTask(day.date) ? '#1976d2' : 
                      day.isToday ? '#f57c00' : '#e0e0e0',
              color: (checkDateHasTask(day.date) || day.isToday) ? '#fff' : '#000',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }
            }}
          >
            <Typography>{day.name}</Typography>
          </Box>

          {day.name === 'Sun' && (
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
              <IconButton 
                onClick={() => setOpenDialog(true)} 
                sx={{ color: '#fff' }}
              >
                <CalendarMonthIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      ))}

      {/* Dialog cho lịch đầy đủ */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            width: '700px',
            height: '700px',
            maxWidth: '90vw',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f5f5f5',
          padding: '16px 24px'
        }}>
          Lịch Công Việc
        </DialogTitle>
        <DialogContent sx={{ padding: '25px', overflow: 'auto' }}>
          <Calendar />
        </DialogContent>
      </Dialog>

      {/* Dialog cho ngày được chọn */}
      <Dialog 
        open={openDayDialog} 
        onClose={handleDayDialogClose}
        PaperProps={{
          sx: {
            width: '500px',
            maxWidth: '90vw',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f5f5f5',
          padding: '16px 24px'
        }}>
          {selectedDay && `Công việc ${selectedDay.date.toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}`}
        </DialogTitle>
        <DialogContent sx={{ padding: '25px' }}>
          {selectedDay && getTasksForDate(selectedDay.date).map((task, index) => (
            <Paper
              key={index}
              elevation={2}
              sx={{
                p: 2,
                mb: 2,
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                {task.task}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {task.timeStart.split(' ')[1]} - {task.timeEnd.split(' ')[1]}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {task.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {task.taskType} - {task.status} - Tạo bởi: {task.createdBy}
              </Typography>
            </Paper>
          ))}
          {selectedDay && getTasksForDate(selectedDay.date).length === 0 && (
            <Typography color="text.secondary" align="center">
              Không có công việc nào.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Component2;
