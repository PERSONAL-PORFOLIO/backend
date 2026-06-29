const Contact = require('../models/Contact');
const Settings = require('../models/Settings');
const Profile = require('../models/Profile');
const nodemailer = require('nodemailer');

/* ─────────────────────────────────────────────────────────────────
   SMTP transporter  (MAIL_USER + MAIL_PASS are the only required
   env vars — everything else is optional / has a sensible default)
───────────────────────────────────────────────────────────────── */
const createTransporter = () => {
  const { MAIL_USER, MAIL_PASS } = process.env;
  if (!MAIL_USER || !MAIL_PASS) return null;

  const port = parseInt(process.env.MAIL_PORT || '587', 10);
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user: MAIL_USER, pass: MAIL_PASS },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
};

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────── */
const esc = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const now = () =>
  new Date().toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

/* ─────────────────────────────────────────────────────────────────
   Shared email wrapper  (header + body slot + footer)
───────────────────────────────────────────────────────────────── */
const emailShell = ({ preheader, headerTitle, headerSub, accentColor = '#6366f1', body, footerNote }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <title>${headerTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>

  <!-- Outer table -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"
               style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">

          <!-- Accent top bar -->
          <tr>
            <td style="background:${accentColor};height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f0f0f0;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">${headerSub}</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;line-height:1.3;">${headerTitle}</h1>
            </td>
          </tr>

          <!-- Body slot -->
          <tr>
            <td style="padding:28px 40px 32px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.6;">${footerNote}</p>
            </td>
          </tr>

        </table>

        <!-- Sub-footer -->
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin-top:16px;">
          <tr>
            <td>
              <p style="margin:0;font-size:11px;color:#c4c9d4;text-align:center;">
                Sent via portfolio contact form &mdash; do not reply to this address directly.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

/* ─────────────────────────────────────────────────────────────────
   Template 1 — Notification to portfolio owner
───────────────────────────────────────────────────────────────── */
const buildNotificationEmail = ({ name, email, subject, message, siteTitle }) => {
  const body = `
    <!-- Sender card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;">
          <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">From</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#111827;">${esc(name)}</p>
          <a href="mailto:${esc(email)}" style="font-size:13px;color:#6366f1;text-decoration:none;">${esc(email)}</a>
        </td>
      </tr>
    </table>

    <!-- Subject -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;">
          <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">Subject</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${esc(subject)}</p>
        </td>
      </tr>
    </table>

    <!-- Message -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">Message</p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.8;white-space:pre-line;">${esc(message)}</p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <a href="mailto:${esc(email)}?subject=Re%3A%20${encodeURIComponent(subject)}"
             style="display:inline-block;background:#6366f1;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;letter-spacing:0.01em;">
            Reply to ${esc(name)} &rarr;
          </a>
        </td>
      </tr>
    </table>`;

  return emailShell({
    preheader: `New message from ${name}: ${subject}`,
    headerSub: siteTitle,
    headerTitle: 'You have a new message',
    body,
    footerNote: `Received ${now()}`,
  });
};

/* ─────────────────────────────────────────────────────────────────
   Template 2 — Auto-reply to the sender
───────────────────────────────────────────────────────────────── */
const buildAutoReplyEmail = ({ name, message, ownerName, siteTitle }) => {
  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
      Hi <strong style="color:#111827;">${esc(name)}</strong>,
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
      Thank you for reaching out! This is an automated confirmation that I've received your message.
      I'll review it and respond as soon as I'm able.
    </p>

    <!-- Their message recap -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
      <tr>
        <td style="border-left:3px solid #6366f1;padding:12px 16px;background:#f9fafb;border-radius:0 6px 6px 0;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">Your message</p>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;white-space:pre-line;">${esc(message)}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
      In the meantime, feel free to explore my portfolio or connect with me on LinkedIn.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
      Best regards,<br>
      <strong style="color:#111827;">${esc(ownerName || siteTitle)}</strong>
    </p>`;

  return emailShell({
    preheader: 'Thanks for reaching out — I\'ll be in touch soon.',
    headerSub: 'Message received',
    headerTitle: `Thanks for getting in touch, ${esc(name)}!`,
    body,
    footerNote: `This is an automated confirmation from <strong style="color:#6366f1;">${esc(siteTitle)}</strong>. Please do not reply to this email.`,
  });
};

/* ─────────────────────────────────────────────────────────────────
   Template 3 — Manual reply from admin
───────────────────────────────────────────────────────────────── */
const buildReplyEmail = ({ contactName, contactSubject, contactMessage, replyMessage, ownerName, siteTitle }) => {
  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
      Hi <strong style="color:#111827;">${esc(contactName)}</strong>,
    </p>

    <!-- Reply content -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.8;white-space:pre-line;">${esc(replyMessage)}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
      Best regards,<br>
      <strong style="color:#111827;">${esc(ownerName || siteTitle)}</strong>
    </p>

    <!-- Original message thread -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="border-top:1px solid #e5e7eb;padding-top:20px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">Your original message</p>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;">${esc(contactSubject)}</p>
          <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;white-space:pre-line;">${esc(contactMessage)}</p>
        </td>
      </tr>
    </table>`;

  return emailShell({
    preheader: `${ownerName || siteTitle} replied to your message: ${contactSubject}`,
    headerSub: siteTitle,
    headerTitle: `Re: ${esc(contactSubject)}`,
    body,
    footerNote: `Replied ${now()}`,
  });
};

/* ─────────────────────────────────────────────────────────────────
   Plain-text fallbacks
───────────────────────────────────────────────────────────────── */
const textNotification = ({ name, email, subject, message }) =>
  `New message from ${name} <${email}>\nSubject: ${subject}\n\n${message}`;

const textAutoReply = ({ name, message, ownerName, siteTitle }) =>
  `Hi ${name},\n\nThank you for reaching out! This is an automated confirmation that I've received your message. I'll review it and respond as soon as I'm able.\n\nYour message:\n${message}\n\nIn the meantime, feel free to explore my portfolio or connect with me on LinkedIn.\n\nBest regards,\n${ownerName || siteTitle}\n\n---\nPlease do not reply to this email — it is automatically generated and this inbox is not monitored for replies.`;

const textReply = ({ contactName, replyMessage, contactMessage, ownerName, siteTitle }) =>
  `Hi ${contactName},\n\n${replyMessage}\n\nBest regards,\n${ownerName || siteTitle}\n\n---\nYour original message:\n${contactMessage}`;

/* ═══════════════════════════════════════════════════════════════
   POST /api/contact  (public)
═══════════════════════════════════════════════════════════════ */
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const [settings, profile] = await Promise.all([Settings.findOne(), Profile.findOne()]);

    if (settings?.allowContactForm === false) {
      return res.status(403).json({ success: false, message: 'Contact form is currently disabled.' });
    }

    // Save to DB
    const contact = await Contact.create({ name, email, subject, message });

    // Respond immediately — don't block on email
    res.status(201).json({ success: true, message: 'Message sent successfully', data: contact });

    // Send emails in background
    const transporter = createTransporter();
    if (!transporter) {
      console.log('ℹ️  SMTP not configured — skipping email');
      return;
    }

    const siteTitle = settings?.siteTitle || 'Portfolio';
    const ownerName = profile?.fullName || siteTitle;
    // Destination = profile email → env MAIL_TO → MAIL_USER (last resort)
    const ownerEmail = profile?.email || process.env.MAIL_TO || process.env.MAIL_USER;
    const senderAddr = process.env.MAIL_FROM || process.env.MAIL_USER;

    transporter.verify().then(async () => {

      // 1 — Notification to owner
      try {
        await transporter.sendMail({
          from: `"${siteTitle}" <${senderAddr}>`,
          to: ownerEmail,
          replyTo: `"${name}" <${email}>`,
          subject: `New message from ${name} — ${subject}`,
          text: textNotification({ name, email, subject, message }),
          html: buildNotificationEmail({ name, email, subject, message, siteTitle }),
        });
        console.log(`✅ Notification sent → ${ownerEmail}`);
      } catch (e) {
        console.error('❌ Notification failed:', e.message);
      }

      // 2 — Auto-reply to sender (always on)
      try {
        await transporter.sendMail({
          from: `"${ownerName}" <${senderAddr}>`,
          to: `"${name}" <${email}>`,
          subject: `Thanks for reaching out, ${name}!`,
          text: textAutoReply({ name, message, ownerName, siteTitle }),
          html: buildAutoReplyEmail({ name, subject, message, ownerName, siteTitle }),
        });
        console.log(`✅ Auto-reply sent → ${email}`);
      } catch (e) {
        console.error('❌ Auto-reply failed:', e.message);
      }

    }).catch(e => console.error('❌ SMTP verify failed:', e.message));

  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════
   Admin endpoints
═══════════════════════════════════════════════════════════════ */

const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Contact.countDocuments({ read: false });
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   POST /api/contact/:id/reply  (admin)
───────────────────────────────────────────────────────────────── */
const replyToContact = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage?.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message is required' });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });

    // Save reply + mark read immediately
    await Contact.findByIdAndUpdate(req.params.id, {
      read: true,
      $push: { replies: { message: replyMessage, sentAt: new Date() } },
    });

    // Respond right away — never block on SMTP
    res.json({ success: true, message: `Reply sent to ${contact.email}` });

    // Send email in background
    const transporter = createTransporter();
    if (!transporter) {
      console.log('ℹ️  SMTP not configured — reply saved to DB only');
      return;
    }

    const [settings, profile] = await Promise.all([Settings.findOne(), Profile.findOne()]);
    const siteTitle = settings?.siteTitle || 'Portfolio';
    const ownerName = profile?.fullName || siteTitle;
    const senderAddr = process.env.MAIL_FROM || process.env.MAIL_USER;

    transporter.verify().then(async () => {
      try {
        await transporter.sendMail({
          from: `"${ownerName}" <${senderAddr}>`,
          to: `"${contact.name}" <${contact.email}>`,
          subject: `Re: ${contact.subject}`,
          text: textReply({ contactName: contact.name, replyMessage, contactMessage: contact.message, ownerName, siteTitle }),
          html: buildReplyEmail({
            contactName: contact.name,
            contactSubject: contact.subject,
            contactMessage: contact.message,
            replyMessage,
            ownerName,
            siteTitle,
          }),
        });
        console.log(`✅ Reply sent → ${contact.email}`);
      } catch (e) {
        console.error('❌ Reply email failed:', e.message);
      }
    }).catch(e => console.error('❌ SMTP verify failed:', e.message));

  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitContact, getContacts, getContact, markRead, deleteContact, getUnreadCount, replyToContact };
