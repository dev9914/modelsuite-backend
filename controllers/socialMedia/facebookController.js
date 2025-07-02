import axios from "axios";
import InstagramAccount from "../../models/Social Media/InstagramAccount.js";

export const getFacebookPageInsights = async (req, res) => {
  try {
    const { modelId } = req.params;

    const account = await InstagramAccount.findOne({ modelId });
    if (
      !account ||
      !account.fbPageId ||
      !account.pageAccessToken
    ) {
      return res
        .status(404)
        .json({ message: "No Facebook page connected for this model" });
    }

    const { fbPageId, pageAccessToken } = account;

    // ✅ Most relevant metrics for your platform
    const metrics = [
      "page_impressions",
      "page_impressions_unique",
      "page_views_total",
      "page_engaged_users",
      "page_post_engagements",
      "page_consumptions",
      "page_fans",
      "page_fan_adds",
      "page_video_views",
      "page_video_view_time"
    ];

    const validInsights = {};
    for (const metric of metrics) {
      try {
        const { data } = await axios.get(
          `https://graph.facebook.com/v23.0/${fbPageId}/insights`,
          {
            params: {
              metric,
              period: "day",
              access_token: pageAccessToken,
            },
          }
        );

        if (data?.data?.length) {
          validInsights[metric] = data.data[0]?.values?.[0]?.value ?? null;
        }
      } catch (err) {
        console.warn(`⚠️ Skipped metric ${metric}:`, err.response?.data?.error?.message || err.message);
      }
    }

    res.status(200).json({ pageInsights: validInsights });
  } catch (err) {
    console.error(
      "❌ Facebook Page Insights Error:",
      err.response?.data || err.message
    );
    res.status(500).json({ message: "Failed to fetch Facebook Page Insights" });
  }
};

export const getFacebookPageInfo = async (req, res) => {
  try {
    const modelId = req.params.modelId;
    const account = await InstagramAccount.findOne({ modelId });

    if (!account || !account.fbPageId || !account.accessToken) {
      return res.status(404).json({ message: "Facebook page not connected" });
    }

    const { fbPageId, accessToken } = account;

    const { data } = await axios.get(
      `https://graph.facebook.com/v23.0/${fbPageId}`,
      {
        params: {
          fields: "name,about,fan_count,picture,category,link,location,website,username",
          access_token: accessToken,
        },
      }
    );

    res.status(200).json({ pageInfo: data });
  } catch (err) {
    console.error(
      "❌ Failed to fetch FB Page Info:",
      err.response?.data || err.message
    );
    res.status(500).json({ message: "Failed to fetch Facebook page info" });
  }
};

export const getFacebookPagePosts = async (req, res) => {
  try {
    const modelId = req.params.modelId;
    const account = await InstagramAccount.findOne({ modelId });

    if (!account || !account.fbPageId || !account.pageAccessToken) {
      return res.status(404).json({ message: "Facebook page not connected" });
    }

    const { fbPageId, pageAccessToken } = account;

    // Step 1: Get recent posts
    const postsResponse = await axios.get(
      `https://graph.facebook.com/v23.0/${fbPageId}/posts`,
      {
        params: {
          fields: "id,message,created_time",
          access_token: pageAccessToken,
        },
      }
    );

    const posts = postsResponse.data.data;

    // Step 2: For each post, fetch insights
    const safeMetrics = [
      "post_impressions",
      "post_engaged_users"
    ];

    const postsWithInsights = await Promise.all(
      posts.map(async (post) => {
        try {
          const insightsRes = await axios.get(
            `https://graph.facebook.com/v23.0/${post.id}/insights`,
            {
              params: {
                metric: safeMetrics.join(","),
                access_token: pageAccessToken,
              },
            }
          );

          const insightsFormatted = {};
          insightsRes.data.data.forEach((metric) => {
            insightsFormatted[metric.name] =
              metric.values?.[0]?.value ?? null;
          });

          return {
            ...post,
            insights: insightsFormatted,
          };
        } catch (insightErr) {
          console.error(`❌ Failed insights for post ${post.id}:`, insightErr.response?.data || insightErr.message);
          return {
            ...post,
            insights: null,
          };
        }
      })
    );

    res.status(200).json({ posts: postsWithInsights });
  } catch (err) {
    console.error("❌ Failed to fetch FB Posts:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch Facebook posts" });
  }
};

export const getFacebookPostInsights = async (req, res) => {
  try {
    const { postId } = req.params;
    const modelId = req.user.id;
    const account = await InstagramAccount.findOne({ modelId });

    if (!account || !account.pageAccessToken) {
      return res.status(404).json({ message: "Facebook page not connected" });
    }

    const { pageAccessToken } = account;

    const { data } = await axios.get(
      `https://graph.facebook.com/v23.0/${postId}/insights`,
      {
        params: {
          metric: "post_impressions,post_engaged_users",
          access_token: pageAccessToken,
        },
      }
    );

    const formatted = {};
    data.data.forEach((item) => {
      formatted[item.name] = item.values?.[0]?.value || 0;
    });

    res.status(200).json({ insights: formatted });
  } catch (err) {
    console.error(
      "❌ Failed to fetch post insights:",
      err.response?.data || err.message
    );
    res.status(500).json({ message: "Failed to fetch post insights" });
  }
};
