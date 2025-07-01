import axios from 'axios';
import InstagramAccount from '../../models/Social Media/InstagramAccount.js';
import jwt from 'jsonwebtoken';

export const handleInstagramCallback = async (req, res) => {
  try {
    const { code, state: stateToken } = req.query;
    const redirectUri = 'http://localhost:5000/api/v1/instagram/callback';
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!code) return res.status(400).json({ message: 'Missing authorization code.' });
    if (!stateToken) return res.status(401).json({ message: 'Token missing in state param' });

    // ✅ Verify the state token (JWT from frontend)
    let decoded;
    try {
      decoded = jwt.verify(stateToken, process.env.JWT_SECRET);
      console.log("✅ Decoded token payload:", decoded);
    } catch (err) {
      console.error("❌ Failed to decode state token:", err.message);
      return res.status(401).json({ message: "Invalid or expired token in state param" });
    }

    const modelId = decoded?.id;
    console.log("💡 Model ID from token:", modelId);

    // Step 1: Exchange code → short-lived access token
    const { data: tokenData } = await axios.get(`https://graph.facebook.com/v23.0/oauth/access_token`, {
      params: {
        client_id: appId,
        redirect_uri: redirectUri,
        client_secret: appSecret,
        code,
      },
    });

    // Step 2: Short → long-lived access token
    const { data: longTokenData } = await axios.get(`https://graph.facebook.com/v23.0/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: tokenData.access_token,
      },
    });

    const longToken = longTokenData.access_token;
    console.log("🔐 Long-lived access token:", longToken);
    let expiresIn = longTokenData.expires_in;

if (!expiresIn || isNaN(expiresIn)) {
  console.warn("⚠️ 'expires_in' missing from token response. Defaulting to 60 days.");
  expiresIn = 60 * 24 * 60 * 60; // 60 days in seconds
}

const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // Step 3: Get connected Facebook Pages
    const { data: pageData } = await axios.get(`https://graph.facebook.com/v23.0/me/accounts`, {
      params: { access_token: longToken },
    });

    console.log("📄 Connected Pages:", pageData.data);
    if (!pageData.data || pageData.data.length === 0) {
      return res.status(400).json({ message: "No Facebook Pages found. Please link an Instagram Business account to a Facebook Page." });
    }

    const page = pageData.data[0];
    const pageId = page?.id;
    console.log("📘 Selected Page:", page, pageId);

    // Step 4: Get Instagram Business Account ID from the Page
    const { data: igData } = await axios.get(`https://graph.facebook.com/v23.0/${pageId}`, {
      params: {
        fields: 'instagram_business_account',
        access_token: longToken,
      },
    });

    const igId = igData.instagram_business_account?.id;
    if (!igId) return res.status(400).send("No Instagram Business account connected to the page.");

    console.log("📷 Instagram Business ID:", igId);

    // Step 5: Save to database
    const savedInfo = await InstagramAccount.findOneAndUpdate(
      { modelId },
      {
        igId,
        fbPageId: pageId,
        accessToken: longToken,
        tokenExpiresAt
      },
      { upsert: true, new: true }
    );

    // Final response
    res.redirect(`http://localhost:4000/instagram/success?modelId=${modelId}`);
    // res.send(`<h2>Instagram Connected ✅</h2><p>You’re all set! Connection saved for model ID: ${modelId}</p>`);
  } catch (err) {
    console.error("❌ Error during Instagram callback:", err.response?.data || err.message);
    res.status(500).json({ message: err.message || 'Something went wrong while connecting Instagram' });
  }
};
