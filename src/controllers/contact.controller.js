const Contact = require('../models/Contact');
const Settings = require('../models/Settings');
const nodemailer = require('nodemailer');

/* ─── Build a verified transporter ──────────────────────────────
   Returns null if SMTP env vars are missing.
   Throws with a descriptive message if the connection fails.   */
const createTransporter = () => {
  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env;
  if (!MAIL_USER || !MAIL_PASS) return null;

  const port = parseInt(MAIL_PORT || '587', 10);

  return nodemailer.createTransport({
    host: MAIL_HOST || 'smtp.gmail.com',
    port,
    // port 465 → SSL; everything else → STARTTLS
    secure: port === 465,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
    tls: {
      // allow self-signed certs in dev; remove in production if desired
      rejectUnauthorized: false,
    },
    // generous timeouts so slow SMTP servers don't hang the request
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
};

/* ─── HTML email template ───────────────────────────────────────
   Uses a light-background, table-based layout that renders
   correctly in Gmail, Outlook, Apple Mail, and mobile clients.  */
const buildHtmlEmail = ({ name, email, subject, message, siteTitle }) => {
  const now = new Date().toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  // Escape HTML entities to prevent injection
  const esc = (str) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const escapedMessage = esc(message).replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header bar -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#06b6d4);padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:10px;padding:10px 14px;margin-bottom:16px;">
                      <span style="color:#ffffff;font-size:22px;">✉️</span>
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                      New Contact Message
                    </h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
                      Someone reached out via your portfolio
                    </p>
                  </td>
                  <td align="right" valign="top">
                    <span style="background:rgba(255,255,255,0.2);border-radius:20px;padding:5px 14px;color:white;font-size:12px;font-weight:600;white-space:nowrap;">
                      ${esc(siteTitle || 'Portfolio')}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <!-- Sender info block -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Sender</p>
                    <p style="margin:0;font-size:17px;font-weight:700;color:#1e293b;">${esc(name)}</p>
                    <a href="mailto:${esc(email)}" style="color:#6366f1;font-size:14px;text-decoration:none;">${esc(email)}</a>
                  </td>
                </tr>
              </table>

              <!-- Subject -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Subject</p>
                    <p style="margin:0;font-size:16px;font-weight:600;color:#1e293b;">${esc(subject)}</p>
                  </td>
                </tr>
              </table>

              <!-- Message body -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="border-radius:12px;border:1px solid #e2e8f0;margin-bottom:28px;overflow:hidden;">
                <tr>
                  <td style="background:#6366f1;padding:12px 24px;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:rgba(255,255,255,0.9);text-transform:uppercase;letter-spacing:0.08em;">Message</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#ffffff;padding:24px;border-top:none;">
                    <p style="margin:0;font-size:15px;color:#374151;line-height:1.85;">${escapedMessage}</p>
                  </td>
                </tr>
              </table>

              <!-- Reply CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${esc(email)}?subject=Re: ${esc(subject)}"
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1,#06b6d4);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:50px;letter-spacing:0.02em;">
                      ↩ Reply to ${esc(name)}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:12px;color:#94a3b8;">
                      📅 Received on ${now}
                    </p>
                  </td>
                  <td align="right">
                    <p style="margin:0;font-size:12px;color:#94a3b8;">
                      Sent via <strong style="color:#6366f1;">${esc(siteTitle || 'Portfolio')}</strong> contact form
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Card -->

        <!-- Outside-card note -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin-top:16px;">
          <tr>
            <td style="padding:0 8px;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                This email was automatically generated. Do not reply to this address —
                use the <strong>Reply to ${esc(name)}</strong> button above.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
};

/* ─── Plain-text fallback ────────────────────────────────────── */
const buildTextEmail = ({ name, email, subject, message }) =>
  `New Contact Message\n${'='.repeat(40)}\n\nFrom:    ${name} <${email}>\nSubject: ${subject}\n\n${'-'.repeat(40)}\n${message}\n${'-'.repeat(40)}\n\nReply directly to: ${email}`;

/* ════════════════════════════════════════════════════════════════
   POST /api/contact  (public)
════════════════════════════════════════════════════════════════ */
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // ── Check settings ──────────────────────────────────────────
    const settings = await Settings.findOne();
    if (settings?.allowContactForm === false) {
      return res.status(403).json({ success: false, message: 'Contact form is currently disabled.' });
    }

    // ── Persist message to DB ───────────────────────────────────
    const contact = await Contact.create({ name, email, subject, message });

    // ── Send email notification ─────────────────────────────────
    const transporter = createTransporter();

    if (transporter) {
      try {
        // Verify SMTP connection before attempting to send
        await transporter.verify();

        const recipientEmail =
          settings?.notificationEmail ||
          process.env.MAIL_TO ||
          process.env.MAIL_USER;

        const siteTitle = settings?.siteTitle || 'Portfolio';

        const info = await transporter.sendMail({
          from: `"${siteTitle} Contact Form" <${process.env.MAIL_USER}>`,
          to: recipientEmail,
          replyTo: `"${name}" <${email}>`,
          subject: `📬 New message from ${name} — ${subject}`,
          text: buildTextEmail({ name, email, subject, message }),
          html: buildHtmlEmail({ name, email, subject, message, siteTitle }),
        });

        console.log(`✅ Contact email sent → ${recipientEmail} (messageId: ${info.messageId})`);
      } catch (mailError) {
        // Log detail but don't fail the user's request — message is already saved
        console.error('❌ Mail send failed:', mailError.message);
        console.error('   Check MAIL_HOST / MAIL_USER / MAIL_PASS in .env');
      }
    } else {
      console.log('ℹ️  SMTP not configured — skipping email (MAIL_USER/MAIL_PASS missing)');
    }

    // ── Auto-reply to the sender ────────────────────────────────
    if (transporter && settings?.autoReply?.enabled) {
      try {
        await transporter.verify();
        const siteTitle = settings?.siteTitle || 'Portfolio';
        const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const DEFAULT_BODY = `<p>Hi <strong>{{name}}</strong>,</p>
<p>Thank you for reaching out! I've received your message about "<strong>{{subject}}</strong>" and will get back to you as soon as possible.</p>
<p>In the meantime, feel free to check out my portfolio or connect with me on social media.</p>
<p>Best regards,<br><strong>${esc(siteTitle)}</strong></p>`;

        const rawBody = settings.autoReply.body?.trim() || DEFAULT_BODY;
        const htmlBody = rawBody
          .replace(/\{\{name\}\}/g, esc(name))
          .replace(/\{\{subject\}\}/g, esc(subject))
          .replace(/\{\{message\}\}/g, esc(message).replace(/\n/g, '<br>'));

        const rawSubject = settings.autoReply.subject?.trim() || 'Thanks for reaching out, {{name}}!';
        const emailSubject = rawSubject
          .replace(/\{\{name\}\}/g, name)
          .replace(/\{\{subject\}\}/g, subject);

        const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:40px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0"
           style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:linear-gradient(135deg,#6366f1,#06b6d4);padding:32px 40px;">
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">${esc(siteTitle)}</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Message received</p>
      </td></tr>
      <tr><td style="padding:36px 40px;font-size:15px;color:#374151;line-height:1.85;">
        ${htmlBody}
      </td></tr>
      <tr><td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
        <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
          This is an automated reply from <strong style="color:#6366f1;">${esc(siteTitle)}</strong>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

        await transporter.sendMail({
          from: `"${siteTitle}" <${process.env.MAIL_USER}>`,
          to: `"${name}" <${email}>`,
          subject: emailSubject,
          text: rawBody.replace(/<[^>]+>/g, '').replace(/\{\{name\}\}/g, name).replace(/\{\{subject\}\}/g, subject).replace(/\{\{message\}\}/g, message),
          html,
        });
        console.log(`✅ Auto-reply sent → ${email}`);
      } catch (arErr) {
        console.error('❌ Auto-reply failed:', arErr.message);
      }
    }

    res.status(201).json({ success: true, message: 'Message sent successfully', data: contact });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ════════════════════════════════════════════════════════════════
   Admin endpoints
════════════════════════════════════════════════════════════════ */

// GET /api/contact  (admin)
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/contact/:id  (admin)
const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/contact/:id/read  (admin)
const markRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/contact/:id  (admin)
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/contact/unread-count  (admin)
const getUnreadCount = async (req, res) => {
  try {
    const count = await Contact.countDocuments({ read: false });
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/contact/:id/reply  (admin)
const replyToContact = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage?.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message is required' });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });

    const transporter = createTransporter();
    if (!transporter) {
      return res.status(503).json({ success: false, message: 'SMTP not configured. Add MAIL_USER and MAIL_PASS to .env' });
    }

    const settings = await Settings.findOne();
    const siteTitle = settings?.siteTitle || 'Portfolio';

    const now = new Date().toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const esc = (str) =>
      String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const escapedReply = esc(replyMessage).replace(/\n/g, '<br>');
    const escapedOriginal = esc(contact.message).replace(/\n/g, '<br>');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Reply from ${esc(siteTitle)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0"
             style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#06b6d4);padding:32px 40px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">Reply from ${esc(siteTitle)}</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
              In response to your message: <em>${esc(contact.subject)}</em>
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 8px;font-size:14px;color:#64748b;">Hi <strong>${esc(contact.name)}</strong>,</p>

            <!-- Reply message -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border-radius:12px;border:1px solid #e2e8f0;margin-bottom:28px;overflow:hidden;">
              <tr>
                <td style="background:#6366f1;padding:12px 24px;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:rgba(255,255,255,0.9);text-transform:uppercase;letter-spacing:0.08em;">Reply</p>
                </td>
              </tr>
              <tr>
                <td style="background:#ffffff;padding:24px;">
                  <p style="margin:0;font-size:15px;color:#374151;line-height:1.85;">${escapedReply}</p>
                </td>
              </tr>
            </table>

            <!-- Original message thread -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:8px;">
              <tr>
                <td style="padding:16px 24px;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Your original message</p>
                  <p style="margin:0;font-size:13px;color:#64748b;line-height:1.7;">${escapedOriginal}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
              Replied on ${now} · <strong style="color:#6366f1;">${esc(siteTitle)}</strong>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const text = `Hi ${contact.name},\n\n${replyMessage}\n\n---\nYour original message:\n${contact.message}\n\n— ${siteTitle}`;

    await transporter.verify();
    await transporter.sendMail({
      from: `"${siteTitle}" <${process.env.MAIL_USER}>`,
      to: `"${contact.name}" <${contact.email}>`,
      subject: `Re: ${contact.subject}`,
      text,
      html,
    });

    // Save reply to history and mark as read
    await Contact.findByIdAndUpdate(req.params.id, {
      read: true,
      $push: { replies: { message: replyMessage, sentAt: new Date() } },
    });

    res.json({ success: true, message: `Reply sent to ${contact.email}` });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitContact, getContacts, getContact, markRead, deleteContact, getUnreadCount, replyToContact };
