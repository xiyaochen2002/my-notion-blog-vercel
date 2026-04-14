import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) return new NextResponse("Missing token", { status: 400 });

    const { name, email, date, topic } = JSON.parse(
      Buffer.from(token, "base64url").toString("utf-8")
    );

    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Confirm Booking - ${name}</title>
        <style>
          body { font-family: -apple-system, sans-serif; background: #000; color: #fff; display: flex; justify-content: center; padding: 40px 20px; }
          .card { background: #111; border: 1px solid #333; border-radius: 20px; padding: 30px; width: 100%; max-width: 500px; }
          .info { color: #888; margin-bottom: 24px; font-size: 0.9rem; line-height: 1.6; border-left: 2px solid #333; padding-left: 15px; }
          label { font-size: 12px; color: #555; text-transform: uppercase; font-weight: bold; margin-bottom: 8px; display: block; }
          input, textarea { width: 100%; background: #1a1a1a; border: 1px solid #333; border-radius: 10px; padding: 12px; color: #fff; margin-bottom: 20px; font-family: inherit; }
          .btn { width: 100%; background: #fff; color: #000; border: none; padding: 14px; border-radius: 10px; font-weight: bold; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="margin-top:0">Finalize Meeting</h2>
          <div class="info"><strong>From:</strong> ${name}<br/><strong>Topic:</strong> ${topic}<br/><strong>Proposed:</strong> ${date}</div>
          <form action="/api/zoom-confirm" method="POST">
            <input type="hidden" name="name" value="${name}" />
            <input type="hidden" name="email" value="${email}" />
            <input type="hidden" name="topic" value="${topic}" />
            <label>Confirm Final Time</label>
            <input type="text" name="finalTime" value="${date}" required />
            <label>Your Message to ${name}</label>
            <textarea name="personalNote" rows="4" placeholder="Add a personal note..."></textarea>
            <button type="submit" class="btn">Confirm & Send Email</button>
          </form>
        </div>
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    return new NextResponse("Invalid Token", { status: 400 });
  }
}

// 2. 处理 POST 请求：执行发送邮件
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const topic = formData.get("topic") as string;
    const finalTime = formData.get("finalTime") as string;
    const personalNote = formData.get("personalNote") as string;

    await resend.emails.send({
      from: "Xiyao Chen <meeting@xiyaochen.cn>",
      to: email,
      subject: `Confirmed: Meeting with Xiyao Chen`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; line-height: 1.6; color: #333;">
          <h2>Meeting Confirmed</h2>
          <p>Hi ${name},</p>
          <p>${personalNote || "I've confirmed our meeting. Looking forward to our discussion!"}</p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #eee;">
            <p style="margin:0"><strong>Topic:</strong> ${topic}</p>
            <p style="margin:8px 0"><strong>Time:</strong> ${finalTime}</p>
            <p style="margin:0"><strong>Zoom:</strong> <a href="${process.env.MY_ZOOM_PERSONAL_LINK}">${process.env.MY_ZOOM_PERSONAL_LINK}</a></p>
          </div>
          <p>Best regards,<br/><strong>Xiyao Chen</strong></p>
        </div>
      `,
    });

    return new NextResponse(
      `<html><body style="background:#000;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
        <div style="text-align:center;"><h1 style="color:#22c55e;">Done!</h1><p>Confirmation sent to ${name}.</p><a href="/" style="color:#666;text-decoration:none;">Back to Home</a></div>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    return new NextResponse("Error sending email", { status: 500 });
  }
}