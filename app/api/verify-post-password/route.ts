import { NextResponse } from "next/server";
import { getPostBySlug } from "../../../lib/notion";

export async function POST(request: Request) {
  const body = await request.json();
  const { slug, password } = body;

  if (!slug || !password) {
    return NextResponse.json(
      { success: false, message: "Missing slug or password." },
      { status: 400 }
    );
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    return NextResponse.json(
      { success: false, message: "Post not found." },
      { status: 404 }
    );
  }

  if (!post.protected) {
    return NextResponse.json({ success: true });
  }

  if (post.password === password) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { success: false, message: "Wrong password." },
    { status: 401 }
  );
}