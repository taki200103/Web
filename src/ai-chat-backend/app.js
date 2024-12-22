const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { Client } = require('pg'); // Import PostgreSQL client
const pool = require('./config/db.config'); // Import the pool

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Key từ Hugging Face
const HF_API_KEY = process.env.HF_API_KEY;

// Kiểm tra API Key
if (!HF_API_KEY) {
    console.error("Hugging Face API key is missing. Please set HF_API_KEY in your .env file.");
    process.exit(1);
}

// Khởi tạo client Hugging Face
const client = new HfInference(HF_API_KEY);

// Middleware kiểm tra token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ 
            message: "Không có token được cung cấp!",
            isAuthenticated: false 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ 
            message: "Token không hợp lệ hoặc đã hết hạn!",
            isAuthenticated: false 
        });
    }
};

// Định nghĩa đường dẫn tuyệt đối đến thư mục AI-Chat
const dirPath = path.join(__dirname, 'AI-Chat');
// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath);
    console.log('Created AI-Chat directory');
}

// Route chính nhận yêu cầu từ người dùng
app.post('/chat', verifyToken, async (req, res) => {
    const { userInput } = req.body;

    // Kiểm tra input từ người dùng
    if (!userInput || typeof userInput !== 'string') {
        return res.status(400).json({ error: 'userInput is required and must be a string.' });
    }

    try {
        // Gửi yêu cầu đến Hugging Face API sử dụng chatCompletion
        const chatCompletion = await client.chatCompletion({
            model: "codellama/CodeLlama-34b-Instruct-hf",
            messages: [
                {
                    role: "user",
                    content: userInput
                }
            ],
            max_tokens: 500
        });

        // Trả về phản hồi từ AI
        const botResponse = chatCompletion.choices[0].message.content;
        
        // Kiểm tra và lưu code vào file trong thư mục AI-Chat
        const codeRegex = /```[\s\S]*?```/g;
        const matches = botResponse.match(codeRegex);
        
        if (matches) {
            // Đảm bảo thư mục tồn tại
            if (!fs.existsSync(dirPath)){
                fs.mkdirSync(dirPath);
            }
            
            // Kết hợp tất cả các code block vào một chuỗi
            const allCode = matches.map(codeBlock => {
                return codeBlock.replace(/```[\s\S]?|```/g, '') + '\n\n';
            }).join('');
            
            // Tạo tên file với định dạng hour_minute_second_dd-mm-yyyy.txt
            const now = new Date();
            const fileName = `hour_${now.getHours()}_minute_${now.getMinutes()}_second_${now.getSeconds()}___${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}.txt`;
            
            // Ghi vào file với tên định dạng mới
            const filePath = path.join(dirPath, fileName);
            fs.writeFileSync(filePath, allCode, 'utf8');
            console.log(`Đã lưu code vào file: ${filePath}`);
        }

        return res.json({ botResponse });
    } catch (error) {
        console.error('Error calling Hugging Face API:', error.message);
        return res.status(500).json({
            error: 'Failed to fetch response from AI.',
            details: error.response?.data || error.message,
        });
    }
});

// Route kiểm tra server
app.get('/', (req, res) => {
    res.send('AI Chat Server is running.');
});

// Thêm route để lấy danh sách file
app.get('/files', verifyToken, (req, res) => {
    try {
        // Đảm bảo thư mục tồn tại
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        
        const files = fs.readdirSync(dirPath);
        console.log('Files found:', files, 'in directory:', dirPath);
        res.json({ files });
    } catch (error) {
        console.error('Error reading directory:', error);
        res.status(500).json({ error: 'Failed to read files directory' });
    }
});

// Thêm route để đọc nội dung file
app.get('/files/:filename', verifyToken, (req, res) => {
    const filePath = path.join(dirPath, req.params.filename);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.json({ content });
    } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).json({ error: 'Failed to read file content' });
    }
});

// Route to apply code from file
app.post('/apply-code', verifyToken, async (req, res) => {
    const { filename } = req.body;
    const filePath = path.join(dirPath, filename);

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const queries = content.split('\n\n')[0]; // Get queries until the first empty line

        const client = await pool.connect(); // Use the pool to get a client
        try {
            const result = await client.query(queries);
            res.json({ result: result.rows });
        } finally {
            client.release(); // Release the client back to the pool
        }
    } catch (error) {
        console.error('Error applying code:', error);
        res.status(500).json({ error: 'Failed to apply code' });
    }
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
