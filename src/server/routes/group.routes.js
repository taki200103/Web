const express = require('express');
const router = express.Router();
const GroupController = require('../controllers/group.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/create', verifyToken, GroupController.createGroup);

module.exports = router; 