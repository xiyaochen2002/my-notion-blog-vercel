import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, date, topic, message } = await req.json();

    if (!name || !email || !date || !topic) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 生成确认 token（简单用 base64 编码请求信息）
    const payload = Buffer.from(
      JSON.stringify({ name, email, date, topic, message })
    ).toString("base64url");

    const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/zoom-confirm?token=${payload}&secret=${process.env.CONFIRM_SECRET}`;
    const personalZoomLink = process.env.MY_ZOOM_PERSONAL_LINK;

    // 发邮件给你
    await resend.emails.send({
      from: "Zoom Booking <onboarding@resend.dev>",
      to: process.env.MY_EMAIL!,
      subject: `📅 新的 Zoom 预约请求：${topic}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">新的 Zoom 预约请求</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; color: #666; width: 100px;">姓名</td><td style="padding: 8px;"><strong>${name}</strong></td></tr>
            <tr style="background:#f9f9f9"><td style="padding: 8px; color: #666;">邮箱</td><td style="padding: 8px;">${email}</td></tr>
            <tr><td style="padding: 8px; color: #666;">时间</td><td style="padding: 8px;"><strong>${date}</strong></td></tr>
            <tr style="background:#f9f9f9"><td style="padding: 8px; color: #666;">主题</td><td style="padding: 8px;">${topic}</td></tr>
            <tr><td style="padding: 8px; color: #666;">内容</td><td style="padding: 8px;">${message || "（无）"}</td></tr>
          </table>

          <p style="margin: 24px 0 12px; color: #333; font-weight: bold;">请选择确认方式：</p>

          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <a href="${confirmUrl}&zoomType=personal"
               style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 12px;">
              ✅ 用个人会议号确认<br/>
              <small style="font-weight:normal; opacity:0.85;">${personalZoomLink}</small>
            </a>
          </div>

          <div style="margin-top: 16px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0 0 8px; color: #333; font-weight: bold;">📎 或者输入自定义 Zoom 链接确认：</p>
            <p style="margin: 0 0 12px; color: #666; font-size: 14px;">复制下方链接，在末尾加上你的 Zoom 链接后访问：</p>
            <code style="display: block; padding: 10px; background: white; border-radius: 4px; font-size: 12px; word-break: break-all; border: 1px solid #e5e7eb;">
              ${confirmUrl}&zoomType=custom&zoomLink=【在这里粘贴你的Zoom链接】
            </code>
          </div>

          <p style="color: #999; font-size: 12px; margin-top: 24px;">此链接可在收到后任何时间点击，不会过期。</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}