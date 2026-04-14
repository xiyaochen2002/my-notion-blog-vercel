import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const secret = searchParams.get("secret");
    const zoomType = searchParams.get("zoomType"); // "personal" | "custom"
    const customZoomLink = searchParams.get("zoomLink");

    // 验证 secret
    if (secret !== process.env.CONFIRM_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!token) {
      return new NextResponse("Missing token", { status: 400 });
    }

    // 解码请求信息
    const { name, email, date, topic, message } = JSON.parse(
      Buffer.from(token, "base64url").toString("utf-8")
    );

    // 确定 Zoom 链接
    const zoomLink =
      zoomType === "personal"
        ? process.env.MY_ZOOM_PERSONAL_LINK!
        : customZoomLink || process.env.MY_ZOOM_PERSONAL_LINK!;

    if (!zoomLink) {
      return new NextResponse("No Zoom link provided", { status: 400 });
    }

    // 发邮件给访客
    await resend.emails.send({
      from: "Xiyao Chen <onboarding@resend.dev>",
      to: email,
      subject: `✅ 你的 Zoom 会议已确认：${topic}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">你的 Zoom 会议已确认！</h2>
          
          <p style="color: #333;">Hi ${name}，</p>
          <p style="color: #333;">我已确认了你的预约，以下是会议详情：</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; color: #666; width: 100px;">时间</td><td style="padding: 8px;"><strong>${date}</strong></td></tr>
            <tr style="background:#f9f9f9"><td style="padding: 8px; color: #666;">主题</td><td style="padding: 8px;">${topic}</td></tr>
            ${message ? `<tr><td style="padding: 8px; color: #666;">备注</td><td style="padding: 8px;">${message}</td></tr>` : ""}
          </table>

          <div style="margin: 24px 0; padding: 20px; background: #eff6ff; border-radius: 12px; text-align: center;">
            <p style="margin: 0 0 12px; color: #1d4ed8; font-weight: bold; font-size: 16px;">🎥 Zoom 会议链接</p>
            <a href="${zoomLink}"
               style="display: inline-block; padding: 14px 32px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              点击加入会议
            </a>
            <p style="margin: 12px 0 0; color: #6b7280; font-size: 13px; word-break: break-all;">${zoomLink}</p>
          </div>

          <p style="color: #666; font-size: 14px;">如有任何问题，可以直接回复此邮件联系我。</p>
          <p style="color: #333;">期待和你见面！<br/><strong>Xiyao Chen</strong></p>
        </div>
      `,
    });

    // 返回成功页面
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="zh">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>预约已确认</title>
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; }
          .card { background: white; border-radius: 16px; padding: 48px; text-align: center; max-width: 400px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          h1 { color: #16a34a; margin: 0 0 12px; }
          p { color: #666; margin: 8px 0; }
          .link { display: inline-block; margin-top: 24px; padding: 10px 24px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="font-size: 48px;">✅</div>
          <h1>确认成功！</h1>
          <p>已向 <strong>${email}</strong> 发送了 Zoom 会议信息。</p>
          <p style="font-size: 13px; color: #999;">会议时间：${date}</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" class="link">返回主页</a>
        </div>
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (err) {
    console.error(err);
    return new NextResponse("Server error", { status: 500 });
  }
}