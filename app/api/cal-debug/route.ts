import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    `https://api.cal.com/v2/slots?eventTypeId=5670858&start=2026-05-14&end=2026-05-15&timeZone=Asia/Singapore`,
    {
      headers: {
        "cal-api-version": "2024-09-04",
      },
    }
  );
  const data = await res.json();
  return NextResponse.json(data);
}