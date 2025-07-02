import axios from 'axios';
import jwt from 'jsonwebtoken';
import InstagramAccount from '../../models/Social Media/InstagramAccount.js';

export const handleInstagramCallback = async (req, res) => {
  try {
    const { code, state: stateToken } = req.query;
    const redirectUri = `${process.env.SERVER_HOSTING_BASEURL}/instagram/callback`;
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!code) return res.status(400).json({ message: 'Missing authorization code.' });
    if (!stateToken) return res.status(401).json({ message: 'Token missing in state param' });

    // 🔐 Verify JWT from state
    let decoded;
    try {
      decoded = jwt.verify(stateToken, process.env.JWT_SECRET);
    } catch (err) {
      console.error("❌ Failed to decode state token:", err.message);
      return res.status(401).json({ message: "Invalid or expired token in state param" });
    }

    const modelId = decoded?.id;
    console.log("✅ Verified token for model ID:", modelId);

    // Step 1: Get short-lived access token
    const { data: tokenData } = await axios.get(`https://graph.facebook.com/v23.0/oauth/access_token`, {
      params: {
        client_id: appId,
        redirect_uri: redirectUri,
        client_secret: appSecret,
        code,
      },
    });

    // Step 2: Convert to long-lived token
    const { data: longTokenData } = await axios.get(`https://graph.facebook.com/v23.0/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: tokenData.access_token,
      },
    });

    const longToken = longTokenData.access_token;
    const expiresIn = longTokenData.expires_in || 60 * 24 * 60 * 60;
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // Step 3: Get list of pages
    const { data: pageData } = await axios.get(`https://graph.facebook.com/v23.0/me/accounts`, {
      params: { access_token: longToken },
    });

    if (!pageData.data || pageData.data.length === 0) {
      return res.status(400).json({ message: 'No Facebook Pages found for this user.' });
    }

    let selectedPage = null;
    for (const page of pageData.data) {
      try {
        const igResp = await axios.get(`https://graph.facebook.com/v23.0/${page.id}`, {
          params: {
            fields: 'instagram_business_account',
            access_token: page.access_token,
          },
        });

        if (igResp.data.instagram_business_account) {
          selectedPage = {
            fbPageId: page.id,
            pageAccessToken: page.access_token,
            igId: igResp.data.instagram_business_account.id,
          };
          break;
        }
      } catch (err) {
        console.warn(`⚠️ Skipping page ${page.id}:`, err.response?.data?.error?.message || err.message);
      }
    }

    if (!selectedPage) {
      return res.status(400).json({ message: 'No page with Instagram Business account found.' });
    }

    // Step 4: Save to DB
    await InstagramAccount.findOneAndUpdate(
      { modelId },
      {
        igId: selectedPage.igId,
        fbPageId: selectedPage.fbPageId,
        accessToken: longToken,
        pageAccessToken: selectedPage.pageAccessToken,
        tokenExpiresAt,
      },
      { upsert: true, new: true }
    );

    console.log("✅ Instagram + Facebook Page connected and saved.");

    // Final response (redirect to frontend success screen)
    res.redirect(`http://localhost:4000/instagram/success?modelId=${modelId}`);
  } catch (err) {
    console.error("❌ Error during Instagram callback:", err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to connect Instagram Business account' });
  }
};
