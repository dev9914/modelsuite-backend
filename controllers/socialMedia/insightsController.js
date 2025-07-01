import InstagramAccount from '../../models/Social Media/InstagramAccount.js';
import axios from 'axios';

export const getInstagramAccountInfo = async (req, res) => {
  try {
    const modelId = req.user.id;
    const account = await InstagramAccount.findOne({ modelId });

    if (!account || !account.igId || !account.accessToken) {
      return res.status(404).json({ message: 'Instagram account not connected' });
    }

    const { igId, accessToken } = account;

    const { data } = await axios.get(`https://graph.facebook.com/v23.0/${igId}`, {
      params: {
        fields: 'name,username,profile_picture_url,followers_count,biography',
        access_token: accessToken,
      },
    });

    res.status(200).json({ accountInfo: data });
  } catch (err) {
    console.error('❌ Failed to fetch IG account info:', err.response?.data || err.message);
    res.status(500).json({ message: 'Something went wrong while fetching Instagram account info' });
  }
};
