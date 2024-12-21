const express = require('express');
const router = express.Router();
const GroupController = require('../controllers/group.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/create', verifyToken, GroupController.createGroup);
router.get('/user-groups', verifyToken, GroupController.getUserGroups);
router.get('/:groupId/details', verifyToken, GroupController.getGroupDetails);
router.get('/:groupId/members', verifyToken, GroupController.getGroupMembers);
router.post('/:groupId/members', verifyToken, GroupController.addGroupMember);
router.delete('/:groupId/members/:memberId', verifyToken, GroupController.deleteGroupMember);
router.get('/:groupId/tasks', verifyToken, GroupController.getGroupTasks);
router.post('/:groupId/tasks', verifyToken, GroupController.createGroupTask);
router.delete('/:groupId/tasks', verifyToken, GroupController.deleteGroupTasks);
router.get('/:groupId/requests', verifyToken, GroupController.getGroupRequests);
router.post('/:groupId/join', verifyToken, GroupController.requestJoinGroup);
router.put('/:groupId/requests/:userId', verifyToken, GroupController.handleJoinRequest);
router.put('/:groupId/tasks/:taskId', verifyToken, GroupController.updateGroupTask);
router.delete('/:groupId', verifyToken, GroupController.deleteGroup);

module.exports = router; 