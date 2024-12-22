const express = require('express');
const router = express.Router();
const SyncController = require('../controllers/sync.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/user-to-group', authMiddleware.verifyToken, SyncController.syncUserTaskToGroupTask);

module.exports = router;