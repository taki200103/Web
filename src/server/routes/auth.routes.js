const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Thêm route kiểm tra token
router.get('/verify', verifyToken, (req, res) => {
    res.json({ 
        isAuthenticated: true,
        user: req.user 
    });
});

module.exports = router; 