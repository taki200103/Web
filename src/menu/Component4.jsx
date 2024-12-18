import React, { useState } from 'react';
import {
  Box,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ClickAwayListener,
  Snackbar,
  Alert,
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
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await api.searchTasks(value);
      setSearchResults(response);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Fetch suggestions error:', error);
    }
  };

  const handleSearch = async (value) => {
    if (!value.trim()) {
      setError('Vui lòng nhập từ khóa tìm kiếm.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.searchTasks(value);
      if (response.length > 0) {
        setSelectedTask(response[0]);
        setOpenDialog(true);
      } else {
        setError('Không tìm thấy công việc nào.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Có lỗi xảy ra khi tìm kiếm.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setOpenDialog(true);
    setShowSuggestions(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  const handleCloseError = () => {
    setError('');
  };

  const handleClickAway = () => {
    setShowSuggestions(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ 
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}>
        <TextField
          variant="outlined"
          placeholder="Tìm kiếm công việc hoặc ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          onKeyPress={handleKeyPress}
          sx={{
            width: '65%',
            '& .MuiOutlinedInput-root': {
              borderRadius: '30px',
              backgroundColor: '#fff'
            },
          }}
          InputProps={{
            endAdornment: loading && <CircularProgress size={20} />,
          }}
          onFocus={() => setShowSuggestions(true)}
        />

        {/* Danh sách gợi ý */}
        {showSuggestions && searchResults.length > 0 && (
          <List sx={{ 
            width: '65%', 
            mt: 1, 
            maxHeight: '300px', 
            overflowY: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 3,
            position: 'absolute',
            top: '100%',
            zIndex: 1000
          }}>
            {searchResults.map((task) => (
              <ListItem 
                key={task.id}
                button
                onClick={() => handleTaskClick(task)}
              >
                <ListItemText 
                  primary={`${task.task} (ID: ${task.id})`} 
                  secondary={`${task.taskType} - ${task.timeStart}`} 
                />
              </ListItem>
            ))}
          </List>
        )}

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
                  <strong>Th���i gian kết thúc:</strong> {selectedTask.timeEnd}
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

        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 13, mr: 10 }}
        >
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </ClickAwayListener>
  );
};

export default Component4;
