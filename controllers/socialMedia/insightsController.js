import InstagramAccount from '../../models/Social Media/InstagramAccount.js';
import axios from 'axios';

export const getInstagramAccountInfo = async (req, res) => {
  try {
    const modelId = req.params.modelId;

    const account = await InstagramAccount.findOne({ modelId });

    if (!account || !account.igId || !account.accessToken) {
      return res.status(404).json({ message: 'Instagram account not connected' });
    }

    const { igId, accessToken } = account;

    const { data } = await axios.get(`https://graph.facebook.com/v23.0/${igId}`, {
      params: {
        fields: [
          'username',
          'profile_picture_url',
          'followers_count',
          'biography',
          'website',
          'name'
        ].join(','),
        access_token: accessToken,
      },
    });

    res.status(200).json({
      success: true,
      accountInfo: {
        username: data.username,
        name: data.name,
        profile_picture_url: data.profile_picture_url,
        followers_count: data.followers_count,
        biography: data.biography,
        website: data.website,
      },
    });
  } catch (err) {
    console.error('❌ Failed to fetch IG account info:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching Instagram account info',
    });
  }
};

export const getInstagramInsights = async (req, res) => {
  try {
    const modelId = req.params.modelId;
    const account = await InstagramAccount.findOne({ modelId });

    if (!account || !account.igId || !account.accessToken) {
      return res.status(404).json({ message: 'Instagram account not connected' });
    }

    const { igId, accessToken } = account;

    const metrics = [
      'reach',
      'profile_views',
      'website_clicks',
      'follows_and_unfollows',
      'accounts_engaged',
    ];

    const { data } = await axios.get(`https://graph.facebook.com/v23.0/${igId}/insights`, {
      params: {
        metric: metrics.join(','),
        period: 'day',
        metric_type: 'total_value', // ✅ Required for some metrics
        access_token: accessToken,
      },
    });

    const insights = {};
    data.data.forEach((item) => {
      insights[item.name] = item.values?.[0]?.value || 0;
    });

    res.status(200).json({ insights });
  } catch (err) {
    console.error('❌ Failed to fetch insights:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to fetch Instagram insights' });
  }
};
export const getInstagramDemographics = async (req, res) => {
  try {
    const modelId = req.params.modelId;
    const account = await InstagramAccount.findOne({ modelId });

    if (!account || !account.igId || !account.accessToken) {
      return res.status(404).json({ message: 'Instagram account not connected' });
    }

    const { igId, accessToken } = account;

    const metrics = [
      'follower_demographics',
      'engaged_audience_demographics',
      'reached_audience_demographics',
    ];

    const results = {};

    // loop through each metric
    for (const metric of metrics) {
      const { data } = await axios.get(
        `https://graph.facebook.com/v23.0/${igId}/insights`,
        {
          params: {
            metric,
            period: 'lifetime',
            metric_type: 'total_value',
            timeframe: 'this_month', // valid time window
            breakdown: 'country,gender,age', // ✅ breakdowns are now required
            access_token: accessToken,
          },
        }
      );

      if (data?.data?.[0]) {
        results[metric] = data.data[0].total_value || {};
      } else {
        results[metric] = {};
      }
    }

    res.status(200).json({ demographics: results });
  } catch (err) {
    console.error('❌ Failed to fetch IG demographics:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to fetch Instagram demographics' });
  }
};

export const getInstagramStoryInsights = async (req, res) => {
  try {
    const modelId = req.params.modelId;
    const account = await InstagramAccount.findOne({ modelId });

    if (!account || !account.igId || !account.accessToken) {
      return res.status(404).json({ message: 'Instagram account not connected' });
    }

    const { igId, accessToken } = account;

    // Fetch media with media_product_type
    const { data: mediaData } = await axios.get(`https://graph.facebook.com/v23.0/${igId}/media`, {
      params: {
        fields: 'id,media_type,media_product_type,timestamp',
        access_token: accessToken,
      },
    });

    // Filter only recent stories (within last 24h)
    const recentStories = mediaData.data.filter((media) => {
      const isStory = media.media_product_type === 'STORY';
      const postedAt = new Date(media.timestamp).getTime();
      const now = Date.now();
      const within24h = now - postedAt < 24 * 60 * 60 * 1000;
      return isStory && within24h;
    });

    if (recentStories.length === 0) {
      return res.status(404).json({ message: 'No recent stories found (must be within 24 hours)', mediaData });
    }

    const storyId = recentStories[0].id;

    // Fetch story insights
    const { data: insightData } = await axios.get(
      `https://graph.facebook.com/v23.0/${storyId}/insights`,
      {
        params: {
          metric: 'reach,taps_forward,taps_back,replies,exits', // remove impressions (deprecated in v22+)
          access_token: accessToken,
        },
      }
    );

    const formatted = {};
    insightData.data.forEach((item) => {
      formatted[item.name] = item.values?.[0]?.value ?? 0;
    });

    res.status(200).json({ storyInsights: formatted, storyId });
  } catch (err) {
    console.error('❌ Story Insights Error:', err.response?.data || err.message);
    res.status(500).json({
      message: 'Failed to fetch story insights. Ensure story is posted within 24 hours.',
    });
  }
};

export const disconnectInstagram = async (req, res) => {
  try {
    const modelId = req.params.modelId;

    const account = await InstagramAccount.findOne({ modelId });
    if (!account) {
      return res.status(404).json({ message: 'Instagram account not connected' });
    }

    account.igId = null;
    account.accessToken = null;
    await account.save();

    res.status(200).json({ message: 'Instagram account disconnected successfully' });
  } catch (err) {
    console.error('❌ Failed to disconnect Instagram:', err.message);
    res.status(500).json({ message: 'Failed to disconnect Instagram account' });
  }
};
