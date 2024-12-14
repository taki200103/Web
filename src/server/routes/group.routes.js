const express = require('express');
const router = express.Router();
const GroupController = require('../controllers/group.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/create', verifyToken, GroupController.createGroup);
router.get('/user-groups', verifyToken, GroupController.getUserGroups);

module.exports = router; 