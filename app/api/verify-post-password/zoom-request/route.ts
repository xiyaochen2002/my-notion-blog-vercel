import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, date, topic, message } = await req.json();

    if (!name || !email || !date || !topic) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate confirmation token (base64url encoded)
    const payload = Buffer.from(
      JSON.stringify({ name, email, date, topic, message })
    ).toString("base64url");

    const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/zoom-confirm?token=${payload}&secret=${process.env.CONFIRM_SECRET}`;
    const personalZoomLink = process.env.MY_ZOOM_PERSONAL_LINK;

    // Send notification email to YOU
    await resend.emails.send({
      from: "Zoom Booking <meeting@xiyaochen.cn>",
      to: process.env.MY_EMAIL!,
      subject: `📅 New Zoom Request: ${topic}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Meeting Request</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; color: #666; width: 120px;">Name</td><td style="padding: 8px;"><strong>${name}</strong></td></tr>
            <tr style="background:#f9f9f9"><td style="padding: 8px; color: #666;">Email</td><td style="padding: 8px;">${email}</td></tr>
            <tr><td style="padding: 8px; color: #666;">Time</td><td style="padding: 8px;"><strong>${date}</strong></td></tr>
            <tr style="background:#f9f9f9"><td style="padding: 8px; color: #666;">Topic</td><td style="padding: 8px;">${topic}</td></tr>
            <tr><td style="padding: 8px; color: #666;">Message</td><td style="padding: 8px;">${message || "(None)"}</td></tr>
          </table>

          <p style="margin: 24px 0 12px; color: #333; font-weight: bold;">Choose Confirmation Method:</p>

          <div style="margin-bottom: 20px;">
            <a href="${confirmUrl}&zoomType=personal"
               style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">
              ✅ Confirm with Personal Meeting ID<br/>
              <small style="font-weight:normal; opacity:0.85;">${personalZoomLink}</small>
            </a>
          </div>

          <div style="padding: 16px; background: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0 0 8px; color: #333; font-weight: bold;">📎 Or use a custom Zoom link:</p>
            <p style="margin: 0 0 12px; color: #666; font-size: 14px;">Copy the link below and append your specific Zoom URL at the end:</p>
            <code style="display: block; padding: 10px; background: white; border-radius: 4px; font-size: 11px; word-break: break-all; border: 1px solid #e5e7eb;">
              ${confirmUrl}&zoomType=custom&zoomLink=[PASTE_YOUR_ZOOM_LINK_HERE]
            </code>
          </div>

          <p style="color: #999; font-size: 12px; margin-top: 24px;">This link does not expire and can be clicked anytime.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}