const express = require('express');
const router = express.Router();

router.get('/:group_id/members', (req, res) => {
  return res.status(200).json({
    group_id: req.params.group_id,
    batch_id: 'mock_batch_001',
    name: 'Mock Batch - Group 1',
    manager_id: 'mock_manager_001',
    members: [
      'mock_user_001', 'mock_user_002', 'mock_user_003',
      'mock_user_004', 'mock_user_005', 'mock_user_006', 'mock_user_007',
    ],
    total_members: 7,
  });
});

router.get('/:group_id/members/validate', (req, res) => {
  return res.status(200).json({
    group_id: req.params.group_id,
    user_id: req.query.user_id || 'mock_user_001',
    is_member: true,
    is_manager: false,
    belongs_to_group: true,
  });
});

router.get('/', (req, res) => {
  return res.status(200).json({
    total: 2,
    groups: [
      {
        group_id: 'mock_group_001',
        batch_id: 'mock_batch_001',
        name: 'Mock Batch - Group 1',
        manager_id: 'mock_manager_001',
        members: ['mock_user_001', 'mock_user_002'],
        total_members: 2,
      },
      {
        group_id: 'mock_group_002',
        batch_id: 'mock_batch_001',
        name: 'Mock Batch - Group 2',
        manager_id: 'mock_manager_002',
        members: ['mock_user_003', 'mock_user_004'],
        total_members: 2,
      },
    ],
  });
});

module.exports = router;
