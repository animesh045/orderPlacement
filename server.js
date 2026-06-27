const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow CORS from our frontend (development or deployed Vercel URL)
const corsOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
  credentials: true
}));

// Set body size limit to accommodate large Base64 images
app.use(express.json({ limit: '50mb' }));

// Meta API Credentials
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const isMetaConfigured = !!(WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_NUMBER_ID);

console.log('WhatsApp Gateway initialized.');
if (isMetaConfigured) {
  console.log('Running in MODE: Official WhatsApp Business API Gateway');
  console.log(`Phone Number ID: ${WHATSAPP_PHONE_NUMBER_ID}`);
} else {
  console.warn('Running in MODE: Developer Simulation Mode (No Meta Credentials)');
  console.warn('Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in env variables for real delivery.');
}

// --- REST API Endpoints ---

// Returns gateway status (always ready for WABA, unlike QR scanning clients)
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ready',
    mode: isMetaConfigured ? 'official' : 'simulation'
  });
});

// Backwards-compatible endpoint for QR codes (returns null since official API has no QR linking)
app.get('/api/qr', (req, res) => {
  res.json({ qrCode: null, message: 'Official API gateway does not require QR authentication.' });
});

// Helper: Upload binary image blob to Meta Media API
const uploadImageToMeta = async (base64Data, mimeType, filename) => {
  // Convert base64 string to a binary buffer
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Convert buffer to a Blob (supported in Node 20+)
  const blob = new Blob([buffer], { type: mimeType });

  const formData = new FormData();
  formData.append('file', blob, filename);
  formData.append('type', mimeType);
  formData.append('messaging_product', 'whatsapp');

  const response = await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/media`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
      // Note: Do NOT set Content-Type header manually here. 
      // Fetch will automatically generate the multipart boundary.
    },
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Meta Media API error: ${response.statusText} (${response.status}) - ${errText}`);
  }

  const result = await response.json();
  return result.id; // Returns media ID string
};

// Helper: Send image message to a client using Meta Message API
const sendMetaImageMessage = async (phone, mediaId, caption) => {
  const cleanPhone = phone.replace(/\D/g, ''); // Ensure pure digits: e.g. 919876543210
  
  const response = await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'image',
      image: {
        id: mediaId,
        caption: caption
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Meta Message API error: ${response.statusText} (${response.status}) - ${errText}`);
  }

  return await response.json();
};

app.post('/api/send-order', async (req, res) => {
  const { phone, notes, photoData, orderId } = req.body;

  if (!phone || !photoData) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing phone number or photo data in request body.' 
    });
  }

  // Generate order caption
  const caption = `*📦 New Photo Order Placed*\n\n` +
                  `*Order ID:* ${orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`}\n` +
                  `*Date:* ${new Date().toLocaleString()}\n` +
                  `${notes ? `*Notes:* ${notes}` : ''}\n\n` +
                  `_Sent via Antigravity OrderHub (Official API)_`;

  // --- MODE A: Simulation Mode ---
  if (!isMetaConfigured) {
    console.log(`[SIMULATION] Processing order ${orderId} to phone ${phone}...`);
    console.log(`[SIMULATION] Note: "${notes || 'none'}"`);
    console.log(`[SIMULATION] Image byte size: ${photoData.length} characters`);
    
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    return res.json({ 
      success: true, 
      message: `Order simulated successfully. (Meta WABA not configured, sent locally to ${phone})`,
      mode: 'simulation'
    });
  }

  // --- MODE B: Real Meta Cloud API Mode ---
  try {
    // 1. Process base64 photo data URL: e.g. "data:image/jpeg;base64,..."
    const matches = photoData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid base64 image data URI format.' 
      });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const filename = `order_${orderId || Date.now()}.jpg`;

    console.log(`Uploading order sheet image to Meta Media API...`);
    const mediaId = await uploadImageToMeta(base64Data, mimeType, filename);
    console.log(`Meta Media uploaded successfully. Media ID: ${mediaId}`);

    console.log(`Sending image message to WhatsApp number ${phone}...`);
    const metaResponse = await sendMetaImageMessage(phone, mediaId, caption);
    console.log(`Meta WABA message sent successfully. JID: ${metaResponse.messages[0].id}`);

    res.json({ 
      success: true, 
      message: `Order photo successfully sent to ${phone} via WhatsApp Business API!`,
      mode: 'official',
      messageId: metaResponse.messages[0].id
    });
  } catch (err) {
    console.error('WhatsApp API Failure:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send WhatsApp message via Meta Cloud API.', 
      error: err.message 
    });
  }
});

// Run Backend Express App
app.listen(PORT, () => {
  console.log(`WhatsApp Business Cloud Gateway listening on port ${PORT}`);
});
