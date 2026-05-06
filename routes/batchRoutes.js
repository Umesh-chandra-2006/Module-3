const express = require('express');
const router = express.Router();
const { createBatch, getAllBatches, getBatchById, assignManager } = require('../controllers/batchController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', authenticate, authorize('ADMIN'), createBatch);
router.get('/', authenticate, authorize('ADMIN'), getAllBatches);
router.get('/:batch_id', authenticate, authorize('ADMIN'), getBatchById);
router.patch('/groups/:group_id/manager', authenticate, authorize('ADMIN'), assignManager);

module.exports = router;
