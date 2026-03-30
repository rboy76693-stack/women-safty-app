const express = require('express');
const router  = express.Router();

// POST /api/test/email
router.post('/email', async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ message: '`to` email is required' });

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user) return res.status(503).json({ message: 'Gmail not configured' });

  try {
    const nodemailer = require('nodemailer');
    const transport  = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    await transport.sendMail({
      from: `"SafeGuard Test" <${user}>`,
      to,
      subject: 'SafeGuard Email Test',
      html: `<div style="font-family:sans-serif;padding:24px;background:#0f0f13;color:#f0f0f5;border-radius:12px"><h2 style="color:#22c55e">Email alerts are working!</h2><p>Test from SafeGuard. Sent at ${new Date().toLocaleString()}</p></div>`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
