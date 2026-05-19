module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { to, clientName, make, pdfBase64, filename, totalG, totalY, totalR } = req.body;

  if (!to || !pdfBase64) return res.status(400).json({ error: 'Missing required fields' });

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || 'Stracuzzi Automobili <inspections@stracuzzi-automobili.com>',
      to: [to],
      subject: `Vehicle Inspection Report — ${make || 'Your Vehicle'}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:32px;">
          <h1 style="font-family:Georgia,serif;color:#c9a84c;margin:0 0 4px;">Stracuzzi Automobili</h1>
          <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 28px;">Vehicle Inspection Report</p>
          <p style="color:#333;">Dear ${clientName || 'Valued Client'},</p>
          <p style="color:#333;">Please find your vehicle inspection report attached to this email.</p>
          <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:24px 0;">
            <p style="margin:0 0 12px;font-weight:bold;color:#333;font-size:14px;">Inspection Summary</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <div style="text-align:center;padding:12px 20px;background:#fff;border-radius:6px;border:1px solid #e0e0e0;">
                <div style="font-size:24px;font-weight:bold;color:#52b788;">${totalG || 0}</div>
                <div style="font-size:11px;color:#888;text-transform:uppercase;margin-top:2px;">Good</div>
              </div>
              <div style="text-align:center;padding:12px 20px;background:#fff;border-radius:6px;border:1px solid #e0e0e0;">
                <div style="font-size:24px;font-weight:bold;color:#e8a030;">${totalY || 0}</div>
                <div style="font-size:11px;color:#888;text-transform:uppercase;margin-top:2px;">Monitor</div>
              </div>
              <div style="text-align:center;padding:12px 20px;background:#fff;border-radius:6px;border:1px solid #e0e0e0;">
                <div style="font-size:24px;font-weight:bold;color:#e63946;">${totalR || 0}</div>
                <div style="font-size:11px;color:#888;text-transform:uppercase;margin-top:2px;">Fix ASAP</div>
              </div>
            </div>
          </div>
          <p style="color:#333;">Please review the attached report and don't hesitate to contact us with any questions.</p>
          <p style="color:#333;margin-top:24px;">Thank you for choosing Stracuzzi Automobili.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:28px 0;">
          <p style="color:#aaa;font-size:11px;margin:0;">Stracuzzi Automobili · Vehicle Inspection System</p>
        </div>
      `,
      attachments: [{ filename: filename || 'inspection-report.pdf', content: pdfBase64 }]
    })
  });

  const data = await resp.json();
  if (!resp.ok) return res.status(400).json({ error: data.message || 'Send failed' });
  res.status(200).json({ ok: true });
};
