const express = require('express');
const router  = express.Router();

// POST /api/test/sms — Textbelt SMS test
router.post('/sms', async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ message: '`to` phone number is required' });

  const key = process.env.TEXTBELT_KEY;
  if (!key) return res.status(503).json({ message: 'TEXTBELT_KEY not set in .env' });

  try {
    const resp = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: to,
        message: 'TEST: SafeGuard SOS system is working. You will receive alerts like this in an emergency.',
        key,
      }),
    });
    const data = await resp.json();
    if (data.success) {
      return res.status(200).json({ success: true, quotaRemaining: data.quotaRemaining });
    } else {
      return res.status(500).json({ success: false, error: data.error });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/test/email — Gmail test
router.post('/email', async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ message: '`to` email is required' });

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user) return res.status(503).json({ message: 'Gmail credentials not configured in .env' });

  try {
    const nodemailer = require('nodemailer');
    const transport  = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    const info = await transport.sendMail({
      from: `"SafeGuard Test" <${user}>`,
      to,
      subject: 'SafeGuard Email Test',
      html: `
        <div style="font-family:sans-serif;padding:24px;background:#0f0f13;color:#f0f0f5;border-radius:12px;max-width:480px">
          <h2 style="color:#22c55e">Email alerts are working!</h2>
          <p>This is a test from your <strong>SafeGuard Women's Safety App</strong>.</p>
          <p>In a real SOS, this contact will receive an alert with a live Google Maps location link.</p>
          <p style="color:#888;font-size:12px;margin-top:24px">Sent at ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
