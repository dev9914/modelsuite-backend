import axios from "axios";


const API = process.env.PANDADOC_API_URL || "https://api.pandadoc.com/public/v1";
const TOKEN = process.env.PANDADOC_API_KEY;

export const getTemplates = async (req, res) => {
  try {
    const response = await axios.get(`${API}/templates`, {
      headers: { Authorization: `API-Key ${TOKEN}` },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createDocument = async (req, res) => {
  const { recipientName, recipientEmail, templateId } = req.body;

  if (!recipientName || !recipientEmail || !templateId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const nameParts = recipientName.trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts[1] || "";

  try {
    const createRes = await axios.post(
      `${API}/documents`,
      {
        name: `Proposal for ${recipientName}`,
        template_uuid: templateId,
        recipients: [
          {
            email: recipientEmail,
            first_name: firstName,
            last_name: lastName,
            role: "Client",
          },
        ],
        send_email: false,
        metadata: {
      modelId: req.params.modelId, // You must send this from frontend
    },
      },
      {
        headers: {
          Authorization: `API-Key ${TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const docId = createRes.data.id;
    console.log("📄 Document created:", docId);

    res.json({
      message: "📄 Document created. Email will be sent shortly.",
      documentId: docId,
    });

    // Background Polling
    (async function pollAndSend() {
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        try {
          const statusRes = await axios.get(`${API}/documents/${docId}`, {
            headers: { Authorization: `API-Key ${TOKEN}` },
          });

          const docStatus = statusRes.data.status;
          console.log(`📡 Polling [${attempts + 1}]: ${docStatus}`);

          if (docStatus === "document.draft") {
            await axios.post(
              `${API}/documents/${docId}/send`,
              {
                silent: false,
                subject: "Please review your proposal",
                message: "Prince bhai, sign kar do jaldi se ✅",
              },
              {
                headers: {
                  Authorization: `API-Key ${TOKEN}`,
                  "Content-Type": "application/json",
                },
              }
            );
            console.log("✅ Email sent to", recipientEmail);
            break;
          }
        } catch (err) {
          console.error("Polling error:", err.response?.data || err.message);
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
        attempts++;
      }
    })();
  } catch (err) {
    console.error("❌ PandaDoc error:", err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data || err.message,
    });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const response = await axios.get(`${API}/documents/${req.params.id}`, {
      headers: { Authorization: `API-Key ${TOKEN}` },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllDocuments = async (req, res) => {
  try {
    const response = await axios.get(`${API}/documents`, {
      headers: { Authorization: `API-Key ${TOKEN}` },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDocumentsByModel = async (req, res) => {
  const { modelId } = req.params;

  try {
    const response = await axios.get(`${API}/documents?metadata[modelId]=${modelId}`, {
      headers: { Authorization: `API-Key ${TOKEN}` },
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


