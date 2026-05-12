import { NextRequest, NextResponse } from "next/server";

const EVENT_TYPE_IDS: Record<string, number> = {
  "30-min-chat": 5670858,
  "one-hour-chat": 5670987,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const eventType = searchParams.get("eventType");

  if (!date || !eventType) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const eventTypeId = EVENT_TYPE_IDS[eventType];
  if (!eventTypeId) {
    return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
  }

  // Get next day for end param
  const nextDate = new Date(date + "T00:00:00+08:00");
  nextDate.setDate(nextDate.getDate() + 1);
  const endDate = nextDate.toISOString().split("T")[0];

  const slotsRes = await fetch(
    `https://api.cal.com/v2/slots?eventTypeId=${eventTypeId}&start=${date}&end=${endDate}&timeZone=Asia/Singapore`,
    {
      headers: {
        "cal-api-version": "2024-09-04",
      },
      cache: "no-store",
    }
  );
  const slotsData = await slotsRes.json();

  // Response: { data: { "2026-05-14": [{ start: "..." }, ...] } }
  const daySlots = slotsData.data?.[date] || [];

  return NextResponse.json({ slots: daySlots });
}