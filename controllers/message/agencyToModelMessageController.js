import AgencyToModelMessage from '../../models/AgencytoModelMessage.js';

export const getAgencyToModelMessages = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.query;

    const messages = await AgencyToModelMessage.find({
      $or: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
    }).sort({ createdAt: 1 }); // oldest to newest

    res.status(200).json(messages);
  } catch (err) {
    console.error('❌ Error fetching agency-to-model messages:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
