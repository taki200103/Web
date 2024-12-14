const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/create', verifyToken, TaskController.createTask);
router.get('/by-type/:taskTypeId', verifyToken, TaskController.getTasksByType);

module.exports = router; 