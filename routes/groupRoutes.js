const express = require('express');
const router = express.Router();
const { getAllGroups, getGroupById, getGroupMembers, validateMembership } = require('../controllers/groupController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, authorize('ADMIN'), getAllGroups);
router.get('/:group_id', authenticate, authorize('ADMIN', 'MANAGER'), getGroupById);
router.get('/:group_id/members', authenticate, authorize('ADMIN', 'MANAGER', 'STUDENT'), getGroupMembers);
router.get('/:group_id/members/validate', authenticate, validateMembership);

module.exports = router;
