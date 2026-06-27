const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

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
const client = new Client({
  authStrategy: new LocalAuth(),
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

// Events
client.on('qr', async (qr) => {
  console.log('WhatsApp QR Code received. Rendering...');
  clientStatus = 'qr';
  try {
    latestQrDataUrl = await qrcode.toDataURL(qr);
  } catch (err) {
    console.error('Error converting QR code to base64 URL:', err);
  }
});

client.on('ready', () => {
  console.log('WhatsApp Client is connected and READY!');
  clientStatus = 'ready';
  latestQrDataUrl = null;
});

client.on('authenticated', () => {
  console.log('WhatsApp Client authenticated successfully.');
});

client.on('auth_failure', (msg) => {
  console.error('WhatsApp Authentication failed:', msg);
  clientStatus = 'disconnected';
});

client.on('disconnected', (reason) => {
  console.log('WhatsApp Client was disconnected:', reason);
  clientStatus = 'disconnected';
  latestQrDataUrl = null;
});

// Initialize WhatsApp Web Client
client.initialize().catch(err => {
  console.error('Error during client.initialize():', err);
  clientStatus = 'disconnected';
});

// --- REST API Endpoints ---

app.get('/api/status', (req, res) => {
  res.json({ status: clientStatus });
});

app.get('/api/qr', (req, res) => {
  if (clientStatus === 'qr' && latestQrDataUrl) {
    res.json({ qrCode: latestQrDataUrl });
  } else {
    res.json({ qrCode: null, message: 'QR Code not available. Client is either ready or loading.' });
  }
});

app.post('/api/send-order', async (req, res) => {
  if (clientStatus !== 'ready') {
    return res.status(400).json({ 
      success: false, 
      message: 'WhatsApp client is not linked. Please scan the QR code first.' 
    });
  }

  const { phone, notes, photoData, orderId } = req.body;

  if (!phone || !photoData) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing phone number or photo data in request body.' 
    });
  }

  try {
    // Format the phone number into international jid format: e.g. "919876543210@c.us"
    // Remove plus signs, spaces, and brackets
    const cleanPhone = phone.replace(/\D/g, '');
    const chatId = `${cleanPhone}@c.us`;

    // Extract mime type and base64 string from data URL
    const matches = photoData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid base64 image data URI format.' 
      });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const media = new MessageMedia(mimeType, base64Data, `order_${orderId || Date.now()}`);

    // Create delivery text caption
    const caption = `*📦 Order Placement - Receipt*\n\n` +
                    `*Order ID:* ${orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`}\n` +
                    `*Date:* ${new Date().toLocaleString()}\n` +
                    `${notes ? `*Extra Note:* ${notes}` : ''}\n\n` +
                    `_Sent automatically from Antigravity OrderHub_`;

    console.log(`Sending WhatsApp message to ${chatId}...`);
    await client.sendMessage(chatId, media, { caption });

    res.json({ 
      success: true, 
      message: `Order photo successfully sent to ${phone} via WhatsApp!` 
    });
  } catch (err) {
    console.error('Error sending WhatsApp message:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send WhatsApp message.', 
      error: err.message 
    });
  }
});

// Run Backend Express App
app.listen(PORT, () => {
  console.log(`WhatsApp Automation API listening on http://localhost:${PORT}`);
});
