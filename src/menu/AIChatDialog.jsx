import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Box,
  Typography,
  Paper,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import Draggable from 'react-draggable';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';

// Component cho phần có thể kéo thả
function DraggablePaper(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

const AIChatDialog = ({ open, onClose }) => {
  const [messages, setMessages] = useState([
    { text: "Xin chào! Tôi là AI trợ lý của bạn. Tôi có thể giúp gì cho bạn?", isAI: true }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [mode, setMode] = useState('query');

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  const handleSend = async () => {
    if (inputMessage.trim()) {
      setMessages(prev => [...prev, { text: inputMessage, isAI: false }]);

      try {
        // Gửi yêu cầu đến backend ở cổng 5000
        const response = await fetch('http://localhost:5000/chat', { // Sửa URL ở đây
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userInput: inputMessage,
            mode: mode
          }),
        });

        const data = await response.json();
        
        if (data.botResponse) {
          setMessages(prev => [...prev, { 
            text: data.botResponse, 
            isAI: true 
          }]);
        } else {
          setMessages(prev => [...prev, { 
            text: "Không có phản hồi từ AI.", 
            isAI: true 
          }]);
        }
      } catch (error) {
        setMessages(prev => [...prev, { 
          text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.", 
          isAI: true 
        }]);
      }

      setInputMessage('');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperComponent={DraggablePaper}
      hideBackdrop={true}
      disableEnforceFocus
      PaperProps={{
        sx: {
          height: '70vh',
          maxHeight: '700px',
          borderRadius: '16px',
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          m: 0
        }
      }}
      sx={{
        '& .MuiDialog-paper': {
          pointerEvents: 'auto',
        },
        pointerEvents: 'none'
      }}
    >
      <DialogTitle 
        id="draggable-dialog-title"
        sx={{ 
          m: 0, 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #eee',
          cursor: 'move'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon />
          <Typography variant="h6">Chat với AI</Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        p: 2,
        gap: 2 
      }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            size="small"
          >
            <ToggleButton value="query">
              <SearchIcon sx={{ mr: 1 }} />
              Truy vấn
            </ToggleButton>
            <ToggleButton value="modify">
              <EditIcon sx={{ mr: 1 }} />
              Chỉnh sửa CSDL
            </ToggleButton>
            <ToggleButton value="chat">
              <ChatIcon sx={{ mr: 1 }} />
              Trò chuyện
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          mb: 2
        }}>
          {messages.map((message, index) => (
            <Paper
              key={index}
              sx={{
                p: 1.5,
                maxWidth: '80%',
                alignSelf: message.isAI ? 'flex-start' : 'flex-end',
                bgcolor: message.isAI ? '#f5f5f5' : '#1976d2',
                color: message.isAI ? 'text.primary' : 'white',
                borderRadius: '12px',
              }}
            >
              <Typography>{message.text}</Typography>
            </Paper>
          ))}
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Nhập tin nhắn..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSend}>
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AIChatDialog;
