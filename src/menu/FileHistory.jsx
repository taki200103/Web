import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Typography,
    Box,
    Paper,
    Button,
    Snackbar,
    Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import CodeIcon from '@mui/icons-material/Code';
import AssessmentIcon from '@mui/icons-material/Assessment';

const FileHistory = () => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [resultDialogOpen, setResultDialogOpen] = useState(false);

    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await fetch('http://localhost:5000/files', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setFiles(data.files || []);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const fetchFileContent = async (filename) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5000/files/${filename}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setFileContent(data.content);
            setSelectedFile(filename);
        } catch (error) {
            console.error('Error fetching file content:', error);
        }
    };

    const handleApplyCode = async () => {
        if (!selectedFile || !fileContent) {
            return;
        }
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:5000/apply-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ filename: selectedFile })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResult(JSON.stringify(data.result, null, 2)); // Format result for display
            setSnackbarMessage('Code applied successfully!');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error applying code:', error);
            setSnackbarMessage('Failed to apply code.');
            setSnackbarOpen(true);
        }
    };

    const handleViewResult = () => {
        if (result) {
            setResultDialogOpen(true);
        }
    };

    useEffect(() => {
        if (open) {
            fetchFiles();
        }
    }, [open]);

    return (
        <>
            <IconButton onClick={() => setOpen(true)} color="primary">
                <HistoryIcon />
            </IconButton>

            <Dialog 
                open={open} 
                onClose={() => setOpen(false)}
                maxWidth="xl"
                fullWidth
                PaperProps={{
                    sx: {
                        height: '80vh',
                        maxHeight: 'none',
                        width: '65vw',
                        margin: '20px'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    m: 0, 
                    p: 3,
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #eee'
                }}>
                    <Typography variant="h5">Lịch sử Code</Typography>
                    <IconButton onClick={() => setOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ 
                    display: 'flex', 
                    gap: 3,
                    p: 3,
                    height: 'calc(90vh - 70px)'
                }}>
                    {/* Danh sách file */}
                    <Box sx={{ 
                        width: '30%', 
                        borderRight: '1px solid #eee',
                        overflow: 'auto'
                    }}>
                        <List>
                            {files.map((file) => (
                                <ListItem 
                                    key={file}
                                    button
                                    selected={selectedFile === file}
                                    onClick={() => fetchFileContent(file)}
                                    sx={{
                                        borderRadius: '8px',
                                        mb: 1,
                                        '&.Mui-selected': {
                                            backgroundColor: '#e3f2fd'
                                        }
                                    }}
                                >
                                    <ListItemText 
                                        primary={file}
                                        sx={{
                                            '& .MuiListItemText-primary': {
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontSize: '1rem'
                                            }
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    {/* Nội dung file và nút Apply */}
                    <Box sx={{ 
                        width: '70%',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 3,
                                flex: 1,
                                overflow: 'auto',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px'
                            }}
                        >
                            <pre style={{ 
                                margin: 0, 
                                whiteSpace: 'pre-wrap',
                                fontSize: '1rem',
                                fontFamily: 'Consolas, monospace'
                            }}>
                                {fileContent || 'Chọn một file để xem nội dung'}
                            </pre>
                        </Paper>

                        {/* Nút Apply Code */}
                        {fileContent && (
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 2, 
                                justifyContent: 'flex-end'
                            }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<AssessmentIcon />}
                                    onClick={handleViewResult}
                                    sx={{
                                        borderColor: '#1976d2',
                                        color: '#1976d2',
                                        '&:hover': {
                                            borderColor: '#115293',
                                            backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                        }
                                    }}
                                >
                                    Result
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<CodeIcon />}
                                    onClick={handleApplyCode}
                                    sx={{
                                        backgroundColor: '#1976d2',
                                        '&:hover': {
                                            backgroundColor: '#115293'
                                        }
                                    }}
                                >
                                    Apply Code
                                </Button>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Snackbar for feedback */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Dialog to show result */}
            <Dialog
                open={resultDialogOpen}
                onClose={() => setResultDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Result</DialogTitle>
                <DialogContent>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {result}
                    </pre>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default FileHistory; 