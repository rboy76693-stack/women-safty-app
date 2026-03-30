/**
 * Notifier — sends email via Brevo HTTP API (works on all cloud servers)
 * Free tier: 300 emails/day, no SMTP blocking issues
 * Set BREVO_API_KEY in environment variables
 * Fallback: nodemailer Gmail if BREVO_API_KEY not set
 */

const sendEmailBrevo = async (to, subject, html, fromName = 'SafeGuard Alert') => {
  const key = process.env.BREVO_API_KEY;
  if (!key) return false;

  const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: fromName, email: process.env.BREVO_SENDER_EMAIL || process.env.GMAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Brevo error: ${err}`);
  }
  return true;
};

const sendEmailGmail = async (to, subject, html) => {
  const nodemailer = require('nodemailer');
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 60000,
    socketTimeout: 60000,
  });
  await transport.sendMail({ from: `"SafeGuard Alert" <${process.env.GMAIL_USER}>`, to, subject, html });
};

const sendEmail = async (contact, userName, lat, lng, incidentType) => {
  if (!contact.email) return;
  const locationUrl = lat !== 0 ? `https://maps.google.com/?q=${lat},${lng}` : null;
  const subject = `EMERGENCY: ${userName} needs help!`;
  const html = `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#0f0f13;color:#f0f0f5;border-radius:12px">
      <h2 style="color:#e8315a">SOS Alert</h2>
      <p><strong>${userName}</strong> triggered an emergency SOS.</p>
      <p>Type: <strong>${incidentType}</strong> &nbsp;|&nbsp; Time: <strong>${new Date().toLocaleString()}</strong></p>
      ${locationUrl ? `<a href="${locationUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#e8315a;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">View Location on Map</a>` : '<p style="color:#f59e0b">Location unavailable</p>'}
      <p style="margin-top:24px;font-size:12px;color:#666">Sent by SafeGuard Women\'s Safety App</p>
    </div>`;

  if (process.env.BREVO_API_KEY) {
    await sendEmailBrevo(contact.email, subject, html);
    console.log(`[Notifier] Email sent via Brevo to ${contact.email}`);
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    await sendEmailGmail(contact.email, subject, html);
    console.log(`[Notifier] Email sent via Gmail to ${contact.email}`);
  } else {
    console.log('[Notifier] No email provider configured');
  }
};

const sendResolutionEmail = async (contact, userName) => {
  if (!contact.email) return;
  const subject = `${userName} is safe now`;
  const html = `<div style="font-family:sans-serif;padding:24px;background:#0f0f13;color:#f0f0f5;border-radius:12px"><h2 style="color:#22c55e">All Clear</h2><p><strong>${userName}</strong> has marked themselves as safe.</p></div>`;
  if (process.env.BREVO_API_KEY) {
    await sendEmailBrevo(contact.email, subject, html);
  } else if (process.env.GMAIL_USER) {
    await sendEmailGmail(contact.email, subject, html);
  }
};

const notifyContacts = async (contacts, userName, lat, lng, incidentType) => {
  const emailContacts = contacts.filter(c => c.email);
  console.log(`[Notifier] Sending to ${emailContacts.length} contacts`);
  const results = await Promise.allSettled(
    emailContacts.map(c => sendEmail(c, userName, lat, lng, incidentType))
  );
  results.filter(r => r.status === 'rejected').forEach(f => console.error('[Notifier] Failed:', f.reason?.message));
  console.log(`[Notifier] ${results.filter(r => r.status === 'fulfilled').length}/${results.length} dispatched`);
};

const notifyResolution = async (contacts, userName) => {
  await Promise.allSettled(contacts.filter(c => c.email).map(c => sendResolutionEmail(c, userName)));
};

const notifyLocationUpdate = async (contacts, userName, lat, lng, pingNum) => {
  if (lat === 0 && lng === 0) return;
  const locationUrl = `https://maps.google.com/?q=${lat},${lng}`;
  const html = `<div style="font-family:sans-serif;padding:24px;background:#0f0f13;color:#f0f0f5;border-radius:12px"><h2 style="color:#f59e0b">Location Update #${pingNum}</h2><p>Updated location for <strong>${userName}</strong></p><a href="${locationUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#f59e0b;color:#000;border-radius:8px;text-decoration:none;font-weight:700">View Updated Location</a></div>`;
  await Promise.allSettled(
    contacts.filter(c => c.email).map(c =>
      process.env.BREVO_API_KEY
        ? sendEmailBrevo(c.email, `Location Update #${pingNum} — ${userName}`, html)
        : sendEmailGmail(c.email, `Location Update #${pingNum} — ${userName}`, html)
    )
  );
};

module.exports = { notifyContacts, notifyResolution, notifyLocationUpdate };
