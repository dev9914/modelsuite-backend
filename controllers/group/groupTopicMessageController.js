import GroupTopicMessage from '../../models/Group/groupTopicMessageModel.js';
import Group from '../../models/Group/Group.js'

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId, topicId, text } = req.body;
    const senderId = req.user._id;
    const senderModel = req.user.role;

    const newMessage = await GroupTopicMessage.create({
      groupId,
      topicId: topicId || null,
      senderId,
      senderModel,
      text,
    });

    // Emit via Socket.IO
    const io = req.app.get('io');
    const room = topicId || groupId.toString(); // topicId room or default group room
    io.to(room).emit('new_group_message', {
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
    console.log(agencyId)

    const newGroup = await Group.create({
      agencyId,
      title,
      modelId
    });

    res.status(201).json({ success: true, group: newGroup });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const getGroupsByAgencyOrModel = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let groups;

    if (role === 'agency') {
      groups = await Group.find({ agencyId: userId }).populate('modelId', 'fullName profilePhoto');
    } else if (role === 'model') {
      groups = await Group.find({ modelId: userId }).populate('agencyId', 'fullName profilePhoto');
    } else {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    res.json(groups);
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const messages = await GroupTopicMessage.find({ groupId }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Error fetching group messages:', err.message);
    res.status(500).json({ error: 'Failed to fetch group messages' });
  }
};

