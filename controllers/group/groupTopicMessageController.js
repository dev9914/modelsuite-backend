import GroupTopicMessage from '../../models/Group/groupTopicMessageModel.js';
import Group from '../../models/Group/Group.js'
import Topic from '../../models/Group/Topic.js';

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId, topicId, text } = req.body;
    const senderId = req.user._id;
    const senderModel = req.user.role;

    // Validation
    if (!groupId || !topicId || !text) {
      return res.status(400).json({ message: 'groupId, topicId, and text are required' });
    }

    // Save the message
    const newMessage = await GroupTopicMessage.create({
      groupId,
      topicId,
      senderId,
      senderModel,
      text,
    });

    // Emit via Socket.IO (room = topicId only)
    const io = req.app.get('io');
    io.to(topicId.toString()).emit('new_group_message', {
      ...newMessage.toObject(),
    });

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error sending group message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { title, modelId } = req.body;
    const agencyId = req.user.id;

    // Create the group
    const newGroup = await Group.create({
      agencyId,
      title,
      modelId,
    });

    // Auto-create #general topic inside the new group
    const generalTopic = await Topic.create({
      groupId: newGroup._id,
      title: '#general',
      createdBy: agencyId,
      creatorModel: 'Agency', // ✅ required field
    });

    res.status(201).json({
      success: true,
      group: newGroup,
      generalTopic,
    });

  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGroupsByAgencyOrModel = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { modelId } = req.query;

    let groups;

    if (role === 'agency') {
      const query = { agencyId: userId };
      if (modelId) {
        query.modelId = modelId; // filter by specific model
      }

      groups = await Group.find(query)
        .populate('modelId', 'fullName profilePhoto')
        .lean();
    } else if (role === 'model') {
      groups = await Group.find({ modelId: userId })
        .populate('agencyId', 'fullName profilePhoto')
        .lean();
    } else {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    // Attach topics for each group
    for (let group of groups) {
      const topics = await Topic.find({ groupId: group._id }).select('_id title');
      group.topics = topics;
    }

    res.json(groups);
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId, topicId } = req.params;

    if (!groupId || !topicId) {
      return res.status(400).json({ error: 'groupId and topicId are required' });
    }

    const messages = await GroupTopicMessage.find({ groupId, topicId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'fullName profilePhoto');

    res.json(messages);
  } catch (err) {
    console.error('Error fetching group messages:', err.message);
    res.status(500).json({ error: 'Failed to fetch group messages' });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;
    console.log(userId, role)

    if (role !== 'agency') {
      return res.status(403).json({ error: 'Only agencies can delete groups' });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    // Check if current user is the owner
    if (group.agencyId.toString() !== userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this group' });
    }

    // Delete messages, topics, and group
    await GroupTopicMessage.deleteMany({ groupId });
    await Topic.deleteMany({ groupId });
    await Group.findByIdAndDelete(groupId);

    res.json({ success: true, message: 'Group and all associated data deleted' });
  } catch (err) {
    console.error('❌ Error deleting group:', err.message);
    res.status(500).json({ error: 'Failed to delete group' });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== 'agency') {
      return res.status(403).json({ error: 'Only agencies can delete topics' });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    const group = await Group.findById(topic.groupId);
    if (!group) return res.status(404).json({ error: 'Related group not found' });

    if (group.agencyId.toString() !== userId) {
      return res.status(403).json({ error: 'You are not authorized to delete topics in this group' });
    }

    // Delete messages in topic and the topic itself
    await GroupTopicMessage.deleteMany({ topicId });
    await Topic.findByIdAndDelete(topicId);

    // Check if only #general is left
    const remaining = await Topic.find({ groupId: group._id });
    const hasOnlyGeneral = remaining.length === 1 && remaining[0].title === '#general';

    if (hasOnlyGeneral) {
      await Group.findByIdAndUpdate(group._id, { hasTopics: false });
    }

    res.json({ success: true, message: 'Topic and its messages deleted' });
  } catch (err) {
    console.error('❌ Error deleting topic:', err.message);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
};