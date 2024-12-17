import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import api from '../utils/api';

const taskTypeNames = {
  1: 'Học Tập',
  2: 'Công Việc',
  3: 'Gia Đình',
  4: 'Hàng Ngày',
  5: 'Hàng Tháng',
  6: 'Hàng Năm'
};

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [allTasks, setAllTasks] = useState([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const tasks = [];
        for (let type = 1; type <= 6; type++) {
          const data = await api.getTasksByType(type);
          if (data) {
            tasks.push(...data);
          }
        }
        console.log('Fetched all tasks:', tasks);
        setAllTasks(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchAllTasks();

    const intervalId = setInterval(() => {
      setRefresh(prev => prev + 1);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [refresh, currentMonth, currentYear]);

  const checkDateHasTask = (day) => {
    if (!allTasks.length) return false;
    const checkDate = new Date(currentYear, currentMonth, day);
    return allTasks.some(task => {
      const [startDateStr] = task.timeStart.split(' ');
      const [startDay, startMonth, startYear] = startDateStr.split('/').map(Number);
      const startDate = new Date(startYear, startMonth - 1, startDay);
      const [endDateStr] = task.timeEnd.split(' ');
      const [endDay, endMonth, endYear] = endDateStr.split('/').map(Number);
      const endDate = new Date(endYear, endMonth - 1, endDay);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const getTasksForDate = (day) => {
    if (!allTasks.length) return [];
    const selectedDate = new Date(currentYear, currentMonth, day);
    return allTasks.filter(task => {
      const [startDateStr] = task.timeStart.split(' ');
      const [startDay, startMonth, startYear] = startDateStr.split('/').map(Number);
      const startDate = new Date(startYear, startMonth - 1, startDay);
      const [endDateStr] = task.timeEnd.split(' ');
      const [endDay, endMonth, endYear] = endDateStr.split('/').map(Number);
      const endDate = new Date(endYear, endMonth - 1, endDay);
      return selectedDate >= startDate && selectedDate <= endDate;
    });
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleMonthChange = (direction) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(null);
  };

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto',
      padding: 2 
    }}>
      {/* Month Navigation */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2
      }}>
        <IconButton onClick={() => handleMonthChange(-1)}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" align="center">
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
        </Typography>
        <IconButton onClick={() => handleMonthChange(1)}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Weekday Headers */}
      <Grid container spacing={1}>
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
          <Grid item xs={1.7} key={day}>
            <Box sx={{ textAlign: 'center', fontWeight: 'bold', mb: 1 }}>
              {day}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Calendar Grid */}
      <Grid container spacing={1}>
        {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, index) => {
          const day = index + 1;
          const hasTask = checkDateHasTask(day);

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
                    day === selectedDate ? '#d32f2f' :
                    hasTask ? '#29b6f6' : '#f5f5f5',
                  color: day === selectedDate ? '#fff' : '#000',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }
                }}
              >
                {day}
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
            Công việc ngày {selectedDate}/{currentMonth + 1}/{currentYear}
          </Typography>
          
          {getTasksForDate(selectedDate).map((task, index) => (
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
                {task.task_uname}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {task.timeStart.split(' ')[1]} - {task.timeEnd.split(' ')[1]}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {task.task_description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {taskTypeNames[task.task_type_id]} - {task.status}
              </Typography>
            </Paper>
          ))}
          
          {getTasksForDate(selectedDate).length === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
              Không có công việc nào.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Calendar;
