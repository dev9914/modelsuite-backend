import Topic from '../../models/Group/Topic.js';
import Group from '../../models/Group/Group.js';

export const createTopic = async (req, res) => {
  try {
    const { groupId, title } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Create new topic
    const newTopic = await Topic.create({
      groupId,
      title,
      createdBy: userId,
      creatorModel: userRole === 'agency' ? 'Agency' : 'Employee',
    });

    // Mark group as having topics now
    group.hasTopics = true;
    await group.save();

    res.status(201).json({ success: true, topic: newTopic });
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTopicsByGroupId = async (req, res) => {
  try {
    const { groupId } = req.params;

    const topics = await Topic.find({ groupId }).sort({ createdAt: 1 });

    res.status(200).json(topics);
  } catch (error) {
    console.error("Error fetching topics by groupId:", error);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
};
