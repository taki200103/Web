const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const verifyToken = require('../middleware/auth.middleware');

// Route đổi tên người dùng (yêu cầu xác thực)
router.put('/change-name', verifyToken, UserController.changeName);

// Route đổi mật khẩu (yêu cầu xác thực)
router.put('/change-password', verifyToken, UserController.changePassword);

module.exports = router; 