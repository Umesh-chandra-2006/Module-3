const Group = require('../models/Group');

const getAllGroups = async (req, res) => {
  try {
    const { batch_id } = req.query;
    const filter = batch_id ? { batch_id } : {};
    const groups = await Group.find(filter).sort({ created_at: -1 });

    return res.status(200).json({
      total: groups.length,
      groups,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.group_id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (req.user.role === 'MANAGER' && group.manager_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Forbidden: not your group' });
    }

    return res.status(200).json(group);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Group not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getGroupMembers = async (req, res) => {
  try {
    const group = await Group.findById(req.params.group_id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const { role, user_id } = req.user;

    if (role === 'MANAGER' && group.manager_id !== user_id) {
      return res.status(403).json({ error: 'Forbidden: not your group' });
    }

    if (role === 'STUDENT' && !group.members.includes(user_id)) {
      return res.status(403).json({ error: 'Forbidden: not a member of this group' });
    }

    return res.status(200).json({
      group_id: group._id,
      batch_id: group.batch_id,
      name: group.name,
      manager_id: group.manager_id,
      members: group.members,
      total_members: group.members.length,
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Group not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const validateMembership = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id query param required' });

    const group = await Group.findById(req.params.group_id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const isMember = group.members.includes(user_id);
    const isManager = group.manager_id === user_id;

    return res.status(200).json({
      group_id: group._id,
      user_id,
      is_member: isMember,
      is_manager: isManager,
      belongs_to_group: isMember || isManager,
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Group not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAllGroups, getGroupById, getGroupMembers, validateMembership };
