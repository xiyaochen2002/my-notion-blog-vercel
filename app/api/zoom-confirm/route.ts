import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const secret = searchParams.get("secret");
    const zoomType = searchParams.get("zoomType");
    const customZoomLink = searchParams.get("zoomLink");

    if (secret !== process.env.CONFIRM_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!token) {
      return new NextResponse("Missing token", { status: 400 });
    }

    const { name, email, date, topic } = JSON.parse(
      Buffer.from(token, "base64url").toString("utf-8")
    );

    const zoomLink = zoomType === "personal" 
      ? process.env.MY_ZOOM_PERSONAL_LINK! 
      : customZoomLink || process.env.MY_ZOOM_PERSONAL_LINK!;

    // Send confirmation email to the VISITOR
    await resend.emails.send({
      from: "Xiyao Chen <meeting@xiyaochen.cn>",
      to: email,
      subject: `Confirmed: Zoom Meeting with Xiyao Chen`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Meeting Confirmed</h2>
          <p>Hi ${name},</p>
          <p>Our Zoom meeting has been scheduled. Here are the details:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Topic:</strong> ${topic}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${date}</p>
            <p style="margin: 8px 0 0;"><strong>Zoom Link:</strong> <a href="${zoomLink}">${zoomLink}</a></p>
          </div>

          <p>Looking forward to meeting you!</p>
          <p style="color: #333;">Best regards,<br/><strong>Xiyao Chen</strong></p>
        </div>
      `,
    });

    // Return success page to YOU
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Booking Confirmed</title>
        <style>
          body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #000; color: #fff; }
          .card { background: #111; border: 1px solid #333; border-radius: 20px; padding: 48px; text-align: center; max-width: 400px; }
          h1 { color: #22c55e; margin: 0 0 16px; font-size: 24px; }
          p { color: #888; line-height: 1.5; }
          .btn { display: inline-block; margin-top: 32px; padding: 12px 24px; background: #fff; color: #000; border-radius: 10px; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Confirmed!</h1>
          <p>The confirmation email with the Zoom link has been sent to <strong>${name}</strong> (${email}).</p>
          <a href="/" class="btn">Back to Home</a>
        </div>
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}