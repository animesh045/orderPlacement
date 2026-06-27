const express = require('express');
const cors = require('cors');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
const PORT = 3001;

// Allow CORS from our Vite dev server
app.use(cors({
  origin: 'http://localhost:5173'
}));

// Set body size limit to accommodate large Base64 images
app.use(express.json({ limit: '50mb' }));

let clientStatus = 'loading'; // 'loading' | 'qr' | 'ready' | 'disconnected'
let latestQrDataUrl = null;

console.log('Initializing WhatsApp Web client (headless Puppeteer)...');

// Configure Client with LocalAuth to persist session tokens
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: '.wwebjs_auth' // Stores session keys in local folder
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

// Event: QR Code generated
client.on('qr', async (qr) => {
  console.log('WhatsApp QR Code generated. Fetching Base64 image...');
  clientStatus = 'qr';
  try {
    latestQrDataUrl = await qrcode.toDataURL(qr);
  } catch (err) {
    console.error('Error generating QR Data URL:', err);
  }
});

// Event: Authentication successful
client.on('authenticated', () => {
  console.log('WhatsApp authenticated successfully.');
});

// Event: Client is ready and connected
client.on('ready', () => {
  console.log('WhatsApp Client is connected and READY!');
  clientStatus = 'ready';
  latestQrDataUrl = null;
});

// Event: Disconnected or session logged out
client.on('disconnected', (reason) => {
  console.warn('WhatsApp Client was disconnected:', reason);
  clientStatus = 'disconnected';
  latestQrDataUrl = null;
  // Attempt to re-initialize
  client.initialize().catch(e => console.error('Re-init failure:', e));
});

// Event: Authentication failure
client.on('auth_failure', (msg) => {
  console.error('WhatsApp Authentication failure:', msg);
  clientStatus = 'disconnected';
});

// Start initialization
client.initialize().catch(err => {
  console.error('Failed to initialize WhatsApp Web client:', err);
});

// --- REST API Endpoints ---

// Get current gateway status
app.get('/api/status', (req, res) => {
  res.json({ status: clientStatus });
});

// Get the latest QR code image
app.get('/api/qr', (req, res) => {
  if (clientStatus === 'qr' && latestQrDataUrl) {
    res.json({ qrCode: latestQrDataUrl });
  } else {
    res.json({ qrCode: null, message: 'QR Code not available. Gateway status: ' + clientStatus });
  }
});

// Send captured photo order and notes
app.post('/api/send-order', async (req, res) => {
  const { phone, notes, photoData, orderId, caption } = req.body;

  if (clientStatus !== 'ready') {
    return res.status(503).json({ 
      success: false, 
      message: 'WhatsApp client is not ready. Current status: ' + clientStatus 
    });
  }

  if (!phone || !photoData) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing phone number or photo data in request body.' 
    });
  }

  try {
    // 1. Process phone number: clean formatting to match WhatsApp standards
    // Needs to end with @c.us and have only digits
    const cleanPhone = phone.replace(/\D/g, ''); // Remove +, spaces, brackets
    const formattedRecipient = `${cleanPhone}@c.us`;

    // 2. Process base64 photo data URL: e.g. "data:image/jpeg;base64,..."
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

    // Create MessageMedia instance
    const media = new MessageMedia(mimeType, base64Data, filename);

    // 3. Format message caption
    const defaultCaption = `*📦 New Photo Order Placed*\n\n` +
                           `*Order ID:* ${orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`}\n` +
                           `*Date:* ${new Date().toLocaleString()}\n` +
                           `${notes ? `*Notes:* ${notes}` : ''}\n\n` +
                           `_Sent via Antigravity OrderHub_`;

    const finalCaption = caption || defaultCaption;

    console.log(`Sending order photo to ${formattedRecipient}...`);
    
    // 4. Send media via whatsapp-web.js
    const msg = await client.sendMessage(formattedRecipient, media, { caption: finalCaption });
    
    console.log(`Order sent successfully! Message ID: ${msg.id.id}`);
    res.json({ 
      success: true, 
      message: `Order photo successfully sent to ${phone} via WhatsApp!`,
      messageId: msg.id.id
    });
  } catch (err) {
    console.error('Failed to send WhatsApp message:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send WhatsApp message.', 
      error: err.message 
    });
  }
});

// Run Backend Express App
app.listen(PORT, () => {
  console.log(`WhatsApp Web Automation Gateway listening on port ${PORT}`);
});
