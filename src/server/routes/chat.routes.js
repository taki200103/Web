const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/group/:groupId', ChatController.getGroupMessages);
router.post('/group/:groupId', ChatController.sendMessage);

module.exports = router; 