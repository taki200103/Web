import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Typography,
  Avatar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatTab = ({ groupId }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello everyone!", sender: "John Doe", timestamp: "10:00 AM", isSelf: false },
    { id: 2, text: "Hi John! How are you?", sender: "You", timestamp: "10:01 AM", isSelf: true },
    { id: 3, text: "I'm doing great, thanks for asking!", sender: "John Doe", timestamp: "10:02 AM", isSelf: false },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        text: newMessage,
        sender: 'You',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: true
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: 'calc(100vh - 140px)',
        bgcolor: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Messages Container */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          gap: 1,
          pb: '100px',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '3px',
          },
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.isSelf ? 'flex-end' : 'flex-start',
              alignItems: 'flex-end',
              gap: 1,
            }}
          >
            {!message.isSelf && (
              <Avatar 
                sx={{ 
                  width: 28, 
                  height: 28,
                  bgcolor: 'secondary.main',
                  fontSize: '0.875rem'
                }}
              >
                {message.sender[0]}
              </Avatar>
            )}
            
            <Box sx={{ maxWidth: '60%' }}>
              {!message.isSelf && (
                <Typography 
                  variant="caption" 
                  sx={{ ml: 1, color: 'text.secondary', display: 'block', mb: 0.5 }}
                >
                  {message.sender}
                </Typography>
              )}
              <Box
                sx={{
                  bgcolor: message.isSelf ? '#0084ff' : '#e4e6eb',
                  color: message.isSelf ? 'white' : 'black',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  maxWidth: '100%',
                  wordBreak: 'break-word'
                }}
              >
                <Typography variant="body2">
                  {message.text}
                </Typography>
              </Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  mt: 0.5,
                  color: 'text.secondary',
                  textAlign: message.isSelf ? 'right' : 'left'
                }}
              >
                {message.timestamp}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Box - Fixed at bottom */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          p: 2,
          borderTop: '1px solid #e4e6eb',
          display: 'flex',
          gap: 1,
          bgcolor: 'white',
          zIndex: 1,
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: '#f0f2f5',
              '& fieldset': {
                border: 'none'
              }
            }
          }}
        />
        <IconButton 
          type="submit"
          disabled={!newMessage.trim()}
          sx={{ 
            color: '#0084ff',
            '&.Mui-disabled': {
              color: 'rgba(0, 0, 0, 0.26)'
            }
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatTab; 