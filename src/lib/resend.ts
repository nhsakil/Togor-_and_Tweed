import { Resend } from 'resend'

// Guard against missing env var — same pattern as redis.ts.
// Constructing Resend(undefined) throws at module load time and crashes any
// server action that imports this file, even if emails are never actually sent.
function createResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  try { return new Resend(key) } catch { return null }
}

export const resend: Resend | null = createResend()

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'no-reply@torgorandtweed.com'

export async function sendOrderConfirmation({
  to,
  orderNumber,
  total,
  items,
}: {
  to: string
  orderNumber: string
  total: string
  items: { name: string; quantity: number; price: string }[]
}) {
  if (!resend) {
    console.warn('[resend] RESEND_API_KEY not set — skipping order confirmation email')
    return
  }

  const itemsHtml = items
    .map((i) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${i.price}</td></tr>`)
    .join('')

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Order Confirmed — ${orderNumber} | Togor & Tweed`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Order Number: <strong>${orderNumber}</strong></p>
      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p>Total: <strong>${total}</strong></p>
      <p>We'll notify you when your order is shipped.</p>
      <p>— Togor &amp; Tweed</p>
    `,
  })
}

export async function sendPasswordReset({
  to,
  resetUrl,
}: {
  to: string
  resetUrl: string
}) {
  if (!resend) {
    console.warn('[resend] RESEND_API_KEY not set — skipping password reset email')
    return
  }

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Reset your password — Togor & Tweed',
    html: `
      <h1>Reset your password</h1>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display:inline-block;background:#c8a96e;color:#fff;padding:12px 24px;text-decoration:none;">
        Reset Password
      </a>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  })
}

export async function sendPathaoStatusUpdate({
  to,
  orderNumber,
  status,
  statusLabel,
  statusDescription,
  consignmentId,
}: {
  to: string
  orderNumber: string
  status: string
  statusLabel: string
  statusDescription: string
  consignmentId: string
}) {
  if (!resend) {
    console.warn('[resend] RESEND_API_KEY not set — skipping Pathao status email')
    return
  }

  const iconMap: Record<string, string> = {
    Pickup_Requested: '📦',
    Picked_Up:        '🚚',
    In_Transit:       '🛵',
    Delivered:        '✅',
    Returned:         '↩️',
    Cancelled:        '❌',
  }
  const icon = iconMap[status] ?? '📋'

  const trackingUrl = `https://pathao.com/parcel-tracking/?consignment_id=${consignmentId}`

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${icon} Shipment Update: ${statusLabel} — ${orderNumber} | Togor & Tweed`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#f9f7f4;font-family:'Inter',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e3df;max-width:560px;width:100%;">
              <!-- Header -->
              <tr>
                <td style="background:#111;padding:24px 32px;">
                  <p style="margin:0;font-family:Georgia,serif;font-size:18px;color:#c8a96e;letter-spacing:0.05em;">
                    Togor &amp; Tweed
                  </p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 8px;font-size:28px;">${icon}</p>
                  <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111;">${statusLabel}</h1>
                  <p style="margin:0 0 24px;font-size:14px;color:#666;">${statusDescription}</p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4;border:1px solid #e5e3df;margin-bottom:24px;">
                    <tr>
                      <td style="padding:16px 20px;">
                        <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.15em;color:#aaa;text-transform:uppercase;">Order Number</p>
                        <p style="margin:0;font-size:14px;font-weight:700;color:#111;font-family:monospace;">${orderNumber}</p>
                      </td>
                      <td style="padding:16px 20px;border-left:1px solid #e5e3df;">
                        <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.15em;color:#aaa;text-transform:uppercase;">Consignment ID</p>
                        <p style="margin:0;font-size:14px;font-weight:700;color:#111;font-family:monospace;">${consignmentId}</p>
                      </td>
                    </tr>
                  </table>

                  <a href="${trackingUrl}"
                    style="display:inline-block;background:#111;color:#fff;padding:12px 28px;
                           font-size:11px;font-weight:600;letter-spacing:0.12em;text-decoration:none;
                           text-transform:uppercase;">
                    Track Shipment
                  </a>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:20px 32px;border-top:1px solid #e5e3df;">
                  <p style="margin:0;font-size:11px;color:#aaa;">
                    You received this email because you placed an order with Togor &amp; Tweed.
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  })
}

