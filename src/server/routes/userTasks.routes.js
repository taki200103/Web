const express = require('express');
const router = express.Router();
const userTasksController = require('../controllers/userTasks.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Routes
router.get('/user-tasks', authMiddleware, userTasksController.getUserTasks);
router.get('/type/:taskTypeId', authMiddleware, userTasksController.getTasksByType);

module.exports = router; 