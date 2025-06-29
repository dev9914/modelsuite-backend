import axios from "axios";

// 1️⃣ Connect Meta (Start OAuth flow)
export const connectMeta = (req, res) => {
  const FACEBOOK_APP_ID = process.env.META_APP_ID;
  const REDIRECT_URI = "http://localhost:5000/api/v1/meta/oauth/callback";

  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=pages_show_list,instagram_basic,instagram_manage_insights&response_type=code`;

  res.redirect(url);
};

// 2️⃣ Handle callback and fetch Instagram Insights
export const handleMetaCallback = async (req, res) => {
  const code = req.query.code;

  try {
    // 🔁 Step 1: Exchange code for user access token
    const tokenResponse = await axios.get("https://graph.facebook.com/v19.0/oauth/access_token", {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: "http://localhost:5000/api/v1/meta/oauth/callback",
        code,
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // 🔁 Step 2: Get Pages connected to user
    const pagesResponse = await axios.get("https://graph.facebook.com/v19.0/me/accounts", {
      params: {
        access_token: accessToken,
      },
    });

    const pages = pagesResponse.data.data;
    if (!pages.length) {
      return res.status(400).json({ message: "No pages connected to this user." });
    }

    const pageId = pages[0].id;
    const pageAccessToken = pages[0].access_token;

    // 🔁 Step 3: Get connected Instagram Business account
    const igAccountResponse = await axios.get(`https://graph.facebook.com/v19.0/${pageId}`, {
      params: {
        fields: "connected_instagram_account",
        access_token: pageAccessToken,
      },
    });

    const igUserId = igAccountResponse.data.connected_instagram_account?.id;
    if (!igUserId) {
      return res.status(400).json({ message: "No Instagram Business account linked to this page." });
    }

    // 🔁 Step 4: Get Instagram account details
    const igDataResponse = await axios.get(`https://graph.facebook.com/v19.0/${igUserId}`, {
      params: {
        fields: "username,profile_picture_url,biography,followers_count,follows_count,media_count",
        access_token: pageAccessToken,
      },
    });

    const insights = igDataResponse.data;

    // ✅ Final Response
    res.json({
      accessToken,
      pageId,
      igUserId,
      insights,
    });
  } catch (err) {
    console.error("Meta callback error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch Instagram insights", error: err.message });
  }
};
