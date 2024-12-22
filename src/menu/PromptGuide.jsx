import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Box,
    Paper,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from '@mui/icons-material/Close';

const promptExamples = [
    {
        title: "Lấy danh sách công việc cá nhân của người dùng",
        example: `

User ID: ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).user_id : '[user_id]'}

-- Bảng User_Task
CREATE TABLE "User_Task" (
    task_uid CHAR(8) PRIMARY KEY,
    task_uname VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    date_begin DATE,
    date_end DATE,
    date_created DATE DEFAULT CURRENT_DATE,
    start_time TIME(7),
    end_time TIME(7),
    time_created TIME(7) DEFAULT CURRENT_TIME,
    task_type_id INTEGER REFERENCES "Task_Type"(Task_type_id),
    user_id CHAR(8) REFERENCES "User"(user_id),
    status VARCHAR(15)
);

sample : SELECT * FROM public."User_Task" using postgres sql
! dưa cho tôi code SQL đưa vào trong chỉ đưa ra 1 câu truy vấn duy nhất , chỉ cần truy xuất theo user_id với thông tin như trên !`
,
        description: "Copy thông tin trên và thêm yêu cầu cụ thể của bạn"
    }
];

const PromptGuide = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton onClick={() => setOpen(true)} color="primary" title="Hướng dẫn Prompt">
                <HelpIcon />
            </IconButton>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="xl"
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
                    <Typography variant="h5">Hướng dẫn sử dụng Prompt</Typography>
                    <IconButton onClick={() => setOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Lời mở đầu:
                        </Typography>
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 3, 
                                backgroundColor: '#f8f9fa',
                                borderRadius: '12px',
                                border: '1px solid #e0e0e0'
                            }}
                        >
                            <Typography variant="h5" sx={{ 
                                mb: 3, 
                                color: '#1976d2',
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}>
                                Chào mừng bạn đến với To-Do App
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Paper elevation={0} sx={{ 
                                    p: 2, 
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e3f2fd'
                                }}>
                                    <Typography sx={{ color: '#1976d2', fontWeight: 'bold', mb: 1 }}>
                                        Lời cảm ơn
                                    </Typography>
                                    <Typography>
                                        Cảm ơn bạn đã sử dụng phiên bản thử nghiệm của chúng tôi
                                    </Typography>
                                </Paper>

                                <Paper elevation={0} sx={{ 
                                    p: 2, 
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e3f2fd'
                                }}>
                                    <Typography sx={{ color: '#1976d2', fontWeight: 'bold', mb: 1 }}>
                                        Về phiên bản thử nghiệm
                                    </Typography>
                                    <Typography>
                                        Vì là phiên bản thử nghiệm nên là việc thực hiện prompt và tạo truy vấn vẫn còn bất tiện khi bẳt 
                                        bạn copy các dòng lệnh cũng như cơ sở DL gây khó khăn và mất an toàn, trong tương lai tôi sẽ ẩn nó  
                                        đi và bạn chỉ cần nhập yêu cầu và thông tin về công việc hay thành viên mà bạn muốn truy xuất dữ liệu
                                    </Typography>
                                </Paper>

                                <Paper elevation={0} sx={{ 
                                    p: 2, 
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e3f2fd'
                                }}>
                                    <Typography sx={{ color: '#1976d2', fontWeight: 'bold', mb: 1 }}>
                                        Tính năng trong tương lai
                                    </Typography>
                                    <Typography>
                                        Các tính năng có thể mở rộng bằng AI trong tương lai: Thống kê công việc, tạo báo cáo, 
                                        quản lý công việc cho nhóm, hỏi đáp về thông tin của người dùng ....
                                    </Typography>
                                </Paper>

                                <Paper elevation={0} sx={{ 
                                    p: 2, 
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e3f2fd'
                                }}>
                                    <Typography sx={{ color: '#1976d2', fontWeight: 'bold', mb: 1 }}>
                                        Cải tiến kỹ thuật
                                    </Typography>
                                    <Typography>
                                        Trong tương lai các kỹ thuật như: Knowledge Distillation, Fine-tuning, Prompt Engineering, ... 
                                        sẽ được áp dụng để đưa ra câu trả lời chính xác trong thời gian ngắn hơn và giảm thiểu đi 
                                        dung lượng mô hình
                                    </Typography>
                                </Paper>
                            </Box>
                        </Paper>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                            Nội dung cần chú ý:
                        </Typography>
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 3, 
                                backgroundColor: '#f8f9fa',
                                borderRadius: '12px',
                                border: '1px solid #e0e0e0'
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Paper elevation={0} sx={{ 
                                    p: 2, 
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e3f2fd'
                                }}>
                                    <Typography sx={{ color: '#1976d2', fontWeight: 'bold', mb: 1 }}>
                                        Thông tin người dùng
                                    </Typography>
                                    <Box sx={{ 
                                        backgroundColor: '#f5f5f5',
                                        p: 2,
                                        borderRadius: '4px',
                                        fontFamily: 'Consolas, monospace',
                                        position: 'relative'
                                    }}>
                                        <Typography component="pre" sx={{ m: 0 }}>
                                            {`{
    "user_id": "${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).user_id : '[user_id]'}"
}`}
                                        </Typography>
                                    </Box>
                                </Paper>

                                <Paper elevation={0} sx={{ 
                                    p: 2, 
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e3f2fd'
                                }}>
                                    <Typography sx={{ color: '#1976d2', fontWeight: 'bold', mb: 1 }}>
                                        Danh mục công việc
                                    </Typography>
                                    <Box sx={{ 
                                        backgroundColor: '#f5f5f5',
                                        p: 2,
                                        borderRadius: '4px',
                                        fontFamily: 'Consolas, monospace',
                                        position: 'relative'
                                    }}>
                                        <Typography component="pre" sx={{ m: 0 }}>
                                            {`
(1, 'Học tập', 'Các công việc liên quan đến học tập', 1),
(2, 'Công việc', 'Các công việc trong môi trường làm việc', 2),
(3, 'Gia đình', 'Các công việc liên quan đến gia đình', 3),
(4, 'Hàng ngày', 'Các công việc thực hiện hàng ngày', 4),
(5, 'Hàng tháng', 'Các công việc thực hiện hàng tháng', 5),
(6, 'Hàng năm', 'Các công việc thực hiện hàng năm', 6);`
                                            }
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        </Paper>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Cách đặt câu hỏi:
                        </Typography>
                        <Typography paragraph>
                            1. Copy thông tin người dùng vào prompt
                        </Typography>
                        <Typography paragraph>
                            2. Đưa cơ sở phần cơ sở DL cần chỉnh sửa vào promt 
                        </Typography>
                        <Typography paragraph>
                            3. Nhập yêu cầu của bạn và gửi cho AI
                        </Typography>
                        <Typography paragraph>
                            4. Truy cập lịch sử để apply yêu cầu code của bạn
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Các mẫu Prompt:
                        </Typography>
                        <List>
                            {promptExamples.map((example, index) => (
                                <ListItem key={index} sx={{ mb: 2 }}>
                                    <Paper 
                                        elevation={0}
                                        sx={{ 
                                            p: 2, 
                                            width: '100%',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            {example.title}
                                        </Typography>
                                        <Typography 
                                            sx={{ 
                                                backgroundColor: '#e3f2fd', 
                                                p: 1, 
                                                borderRadius: '4px',
                                                fontFamily: 'Consolas, monospace',
                                                mb: 1
                                            }}
                                        >
                                            {example.example}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {example.description}
                                        </Typography>
                                    </Paper>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PromptGuide; 