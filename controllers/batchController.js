const Batch = require('../models/Batch');
const Group = require('../models/Group');
const { chunkIntoGroups, buildGroupDocuments } = require('../services/groupingService');

const createBatch = async (req, res) => {
  try {
    const { name, student_ids } = req.body;

    if (!name || !student_ids || student_ids.length === 0) {
      return res.status(400).json({ error: 'name and student_ids are required' });
    }

    const batch = new Batch({
      name,
      student_ids,
      created_by: req.user.user_id,
    });
    await batch.save();

    const chunks = chunkIntoGroups(student_ids);
    const groupDocs = buildGroupDocuments(chunks, batch._id, name);
    await Group.insertMany(groupDocs);

    return res.status(201).json({
      batch_id: batch._id,
      name: batch.name,
      total_students: student_ids.length,
      groups_created: groupDocs.length,
      created_at: batch.created_at,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find().sort({ created_at: -1 });
    return res.status(200).json(batches);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batch_id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });

    const groups = await Group.find({ batch_id: batch._id });

    return res.status(200).json({
      batch,
      groups,
      total_groups: groups.length,
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Batch not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const assignManager = async (req, res) => {
  try {
    const { manager_id } = req.body;

    if (!manager_id) {
      return res.status(400).json({ error: 'manager_id is required' });
    }

    const group = await Group.findByIdAndUpdate(
      req.params.group_id,
      { manager_id },
      { new: true }
    );

    if (!group) return res.status(404).json({ error: 'Group not found' });

    return res.status(200).json({
      group_id: group._id,
      manager_id: group.manager_id,
      message: 'Manager assigned successfully',
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Group not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createBatch, getAllBatches, getBatchById, assignManager };
