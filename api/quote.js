const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value, max = 2000) => String(value ?? '').trim().slice(0, max);
const esc = (value) => clean(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[char]));

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const body = req.body || {};
  if (clean(body.website, 120)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, 120);
  const phone = clean(body.phone, 80);
  const email = clean(body.email, 180);
  const area = clean(body.area, 180);
  const workType = clean(body.workType, 180);
  const preferredContact = clean(body.preferredContact, 80);
  const description = clean(body.description, 4000);

  if (!name || !phone || !email || !area || !workType || !preferredContact || !description) {
    return res.status(400).json({ error: 'Please complete all required fields.' });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Dowling Projects <onboarding@resend.dev>';

  if (!apiKey || !toEmail) {
    return res.status(503).json({ error: 'The email form is not configured yet. Please WhatsApp Anro on +27 62 411 4413.' });
  }

  const subject = `New Dowling Projects enquiry: ${workType} | ${name}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#151515">
      <h2 style="margin:0 0 24px">New project enquiry</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#666;width:180px">Name</td><td style="padding:8px 0"><strong>${esc(name)}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0">${esc(phone)}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0">${esc(email)}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Area</td><td style="padding:8px 0">${esc(area)}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Type of work</td><td style="padding:8px 0">${esc(workType)}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Preferred contact</td><td style="padding:8px 0">${esc(preferredContact)}</td></tr>
      </table>
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid #ddd">
        <div style="color:#666;margin-bottom:8px">Project description</div>
        <div style="white-space:pre-wrap;line-height:1.6">${esc(description)}</div>
      </div>
    </div>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Resend error:', response.status, detail.slice(0, 500));
      return res.status(502).json({ error: 'Your request could not be sent. Please WhatsApp Anro on +27 62 411 4413.' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Quote email error:', error);
    return res.status(500).json({ error: 'Your request could not be sent. Please WhatsApp Anro on +27 62 411 4413.' });
  }
};
