const formatDateTime = (value = new Date()) => {
  const dt = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value || '');
  return dt.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const sendInquiryEmailNotification = async (payload = {}) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return { success: false, skipped: true, reason: 'ADMIN_EMAIL not configured' };
  }

  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (error) {
    return { success: false, skipped: true, reason: 'nodemailer package not installed' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subjectLine = payload.subject || 'General Inquiry';
  const mailSubject = `New Inquiry Received - ${payload.name || 'Client'}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#0f172a;color:#fff;padding:18px 22px">
        <h2 style="margin:0;font-size:20px;">${mailSubject}</h2>
      </div>
      <div style="padding:20px 22px;background:#fff;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#475569;width:170px;">Client Name</td><td style="padding:8px 0;font-weight:600;color:#0f172a;">${payload.name || '-'}</td></tr>
          <tr><td style="padding:8px 0;color:#475569;">Email</td><td style="padding:8px 0;font-weight:600;color:#0f172a;">${payload.email || '-'}</td></tr>
          <tr><td style="padding:8px 0;color:#475569;">Mobile</td><td style="padding:8px 0;font-weight:600;color:#0f172a;">${payload.mobile || '-'}</td></tr>
          <tr><td style="padding:8px 0;color:#475569;">Subject</td><td style="padding:8px 0;font-weight:600;color:#0f172a;">${subjectLine}</td></tr>
          <tr><td style="padding:8px 0;color:#475569;vertical-align:top;">Message</td><td style="padding:8px 0;font-weight:600;color:#0f172a;white-space:pre-wrap;">${payload.message || '-'}</td></tr>
          <tr><td style="padding:8px 0;color:#475569;">Date & Time</td><td style="padding:8px 0;font-weight:600;color:#0f172a;">${formatDateTime(payload.createdAt || new Date())}</td></tr>
        </table>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_USER || 'noreply@toffanglass.local',
    to: adminEmail,
    subject: mailSubject,
    html,
  });

  return { success: true };
};

const sendInquiryWhatsAppNotification = async (payload = {}) => {
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  if (!webhookUrl) {
    return { success: false, skipped: true, reason: 'WHATSAPP_WEBHOOK_URL not configured' };
  }

  const body = {
    type: 'new_inquiry',
    message: `New Inquiry from ${payload.name || 'Client'} (${payload.mobile || '-'})`,
    data: payload,
  };

  if (typeof fetch !== 'function') {
    return { success: false, skipped: true, reason: 'fetch not available in current Node runtime' };
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp webhook failed with status ${response.status}`);
  }

  return { success: true };
};

module.exports = {
  sendInquiryEmailNotification,
  sendInquiryWhatsAppNotification,
};
