const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

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

// Route chính nhận yêu cầu từ người dùng
app.post('/chat', async (req, res) => {
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

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
