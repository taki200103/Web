import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Chip,
    Box,
    Alert
} from '@mui/material';
import axios from 'axios';

const CreateGroupDialog = ({ open, onClose, onSuccess }) => {
    const [groupData, setGroupData] = useState({
        groupName: '',
        description: '',
        members: [] // Mảng chứa user_id của các thành viên
    });
    const [memberId, setMemberId] = useState('');
    const [error, setError] = useState('');

    const handleAddMember = () => {
        if (memberId.trim()) {
            if (!groupData.members.includes(memberId)) {
                setGroupData(prev => ({
                    ...prev,
                    members: [...prev.members, memberId.trim()]
                }));
            }
            setMemberId('');
        }
    };

    const handleRemoveMember = (memberToRemove) => {
        setGroupData(prev => ({
            ...prev,
            members: prev.members.filter(member => member !== memberToRemove)
        }));
    };

    const handleSubmit = async () => {
        try {
            if (!groupData.groupName.trim()) {
                setError('Vui lòng nhập tên nhóm!');
                return;
            }

            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                'http://localhost:3000/api/groups/create',
                groupData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            onSuccess(response.data.group);
            onClose();
        } catch (error) {
            console.error('Error creating group:', error);
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo nhóm!');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Tạo Nhóm Mới</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <TextField
                    fullWidth
                    label="Tên nhóm"
                    margin="normal"
                    value={groupData.groupName}
                    onChange={(e) => setGroupData(prev => ({
                        ...prev,
                        groupName: e.target.value
                    }))}
                />
                <TextField
                    fullWidth
                    label="Mô tả"
                    margin="normal"
                    multiline
                    rows={3}
                    value={groupData.description}
                    onChange={(e) => setGroupData(prev => ({
                        ...prev,
                        description: e.target.value
                    }))}
                />
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Thêm thành viên:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                            size="small"
                            label="User ID"
                            value={memberId}
                            onChange={(e) => setMemberId(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddMember();
                                }
                            }}
                        />
                        <Button 
                            variant="contained" 
                            onClick={handleAddMember}
                        >
                            Thêm
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {groupData.members.map((member) => (
                            <Chip
                                key={member}
                                label={member}
                                onDelete={() => handleRemoveMember(member)}
                            />
                        ))}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Hủy
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">
                    Tạo nhóm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateGroupDialog; 