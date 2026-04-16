import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'LankaFix <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3006'

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  Open: { label: 'Open', bg: '#fef9c3', color: '#854d0e' },
  InProgress: { label: 'In Progress', bg: '#dbeafe', color: '#1e40af' },
  Resolved: { label: 'Resolved', bg: '#dcfce7', color: '#166534' },
  Urgent: { label: 'Urgent', bg: '#fee2e2', color: '#991b1b' },
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function baseWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <div style="max-width:560px;margin:40px auto;padding:0 16px">
    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
      <div style="background:#16a34a;padding:22px 32px">
        <p style="margin:0;font-size:20px;font-weight:700;color:white;letter-spacing:-0.3px">LankaFix</p>
        <p style="margin:3px 0 0;font-size:12px;color:rgba(255,255,255,0.7)">Civic Issue Reporting — Sri Lanka</p>
      </div>
      ${content}
      <div style="padding:16px 32px;border-top:1px solid #f3f4f6;text-align:center">
        <p style="margin:0;font-size:11px;color:#d1d5db">You received this because you are registered on LankaFix.</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

function confirmationHtml(data: {
  referenceNumber: string
  title: string
  category: string
  district: string
}): string {
  const trackUrl = `${APP_URL}/track?ref=${data.referenceNumber}`
  return baseWrapper(`
  <div style="padding:32px">
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827">Report Received</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6">
      Your complaint has been logged and will be reviewed by the relevant department.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:0.08em">Reference Number</p>
      <p style="margin:0;font-size:26px;font-weight:700;color:#15803d;font-family:monospace;letter-spacing:0.06em">${esc(data.referenceNumber)}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
      <tr>
        <td style="padding:9px 0;font-size:13px;color:#9ca3af;vertical-align:top;width:100px">Title</td>
        <td style="padding:9px 0;font-size:13px;color:#111827;font-weight:500">${esc(data.title)}</td>
      </tr>
      <tr style="border-top:1px solid #f3f4f6">
        <td style="padding:9px 0;font-size:13px;color:#9ca3af">Category</td>
        <td style="padding:9px 0;font-size:13px;color:#374151">${esc(data.category)}</td>
      </tr>
      <tr style="border-top:1px solid #f3f4f6">
        <td style="padding:9px 0;font-size:13px;color:#9ca3af">District</td>
        <td style="padding:9px 0;font-size:13px;color:#374151">${esc(data.district)}</td>
      </tr>
      <tr style="border-top:1px solid #f3f4f6">
        <td style="padding:9px 0;font-size:13px;color:#9ca3af">Status</td>
        <td style="padding:9px 0">
          <span style="background:#fef9c3;color:#854d0e;font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px">Open</span>
        </td>
      </tr>
    </table>
    <a href="${trackUrl}" style="display:block;background:#16a34a;color:white;text-align:center;padding:14px 24px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600">
      Track Your Report →
    </a>
  </div>`)
}

function statusUpdateHtml(data: {
  referenceNumber: string
  title: string
  status: string
  notes?: string
}): string {
  const trackUrl = `${APP_URL}/track?ref=${data.referenceNumber}`
  const cfg = STATUS_CONFIG[data.status] ?? STATUS_CONFIG.Open
  return baseWrapper(`
  <div style="padding:32px">
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827">Status Update</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6">
      Your complaint <strong style="color:#374151;font-family:monospace">${esc(data.referenceNumber)}</strong> has been updated.
    </p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 10px;font-size:13px;color:#6b7280">${esc(data.title)}</p>
      <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em">New Status</p>
      <span style="background:${cfg.bg};color:${cfg.color};font-size:13px;font-weight:700;padding:4px 14px;border-radius:20px">${cfg.label}</span>
    </div>
    ${
      data.notes
        ? `<div style="background:#f0fdf4;border-left:3px solid #16a34a;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:24px">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#166534;text-transform:uppercase;letter-spacing:0.06em">Note from the team</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">${esc(data.notes)}</p>
      </div>`
        : ''
    }
    <a href="${trackUrl}" style="display:block;background:#16a34a;color:white;text-align:center;padding:14px 24px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600">
      View Full History →
    </a>
  </div>`)
}

export async function sendConfirmationEmail(
  to: string,
  data: { referenceNumber: string; title: string; category: string; district: string }
): Promise<boolean> {
  const resend = getResend()
  if (!resend) return false
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Your report ${data.referenceNumber} has been received — LankaFix`,
      html: confirmationHtml(data),
    })
    return true
  } catch {
    return false
  }
}

export async function sendStatusUpdateEmail(
  to: string,
  data: { referenceNumber: string; title: string; status: string; notes?: string }
): Promise<boolean> {
  const resend = getResend()
  if (!resend) return false
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Update on your report ${data.referenceNumber} — LankaFix`,
      html: statusUpdateHtml(data),
    })
    return true
  } catch {
    return false
  }
}
