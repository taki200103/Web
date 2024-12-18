import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography 
} from '@mui/material';
import api from '../utils/api';

const Component4 = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  const handleSearch = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.searchTasks(value);
      setSearchResults(response || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };

  // Xử lý khi click vào task
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setOpenDialog(true);
  };

  // Đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      mt: '35px' 
    }}>
      <TextField
        variant="outlined"
        placeholder="Tìm kiếm công việc..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{
          width: '65%',
          '& .MuiOutlinedInput-root': {
            borderRadius: '30px',
          },
        }}
        InputProps={{
          endAdornment: loading && <CircularProgress size={20} />,
        }}
      />

      {/* Kết quả tìm kiếm */}
      {searchResults.length > 0 && (
        <Box sx={{ 
          width: '65%', 
          mt: 2, 
          maxHeight: '300px', 
          overflowY: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 3,
          p: 2
        }}>
          {searchResults.map((task) => (
            <Box 
              key={task.id}
              onClick={() => handleTaskClick(task)}
              sx={{
                p: 1,
                mb: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                cursor: 'pointer'
              }}
            >
              <Box sx={{ fontWeight: 'bold' }}>{task.task}</Box>
              <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                {task.taskType} - {task.timeStart}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Dialog hiển thị chi tiết task */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Chi tiết công việc</DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box sx={{ minWidth: 400 }}>
              <Typography variant="h6" gutterBottom>
                {selectedTask.task}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Loại công việc:</strong> {selectedTask.taskType}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Trạng thái:</strong> {selectedTask.status}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Mô tả:</strong> {selectedTask.description}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Thời gian bắt đầu:</strong> {selectedTask.timeStart}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Thời gian kết thúc:</strong> {selectedTask.timeEnd}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Người tạo:</strong> {selectedTask.createdBy}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Ngày tạo:</strong> {selectedTask.createdAt}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Component4;
