import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { eventType, startTime, name, email, topic, message } = await req.json();

  const apiKey = process.env.CAL_API_KEY;

  // v2: get event type ID
  const etRes = await fetch(
    `https://api.cal.com/v2/event-types?username=xiyaochen2002`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "cal-api-version": "2024-06-14",
      },
      next: { revalidate: 3600 },
    }
  );
  const etData = await etRes.json();
  const eventTypes = etData.data?.eventTypes || etData.data || [];
  const eventTypeObj = eventTypes.find((et: any) => et.slug === eventType);

  if (!eventTypeObj) {
    return NextResponse.json({ error: "Event type not found" }, { status: 404 });
  }

  // v2: create booking
  const bookRes = await fetch(`https://api.cal.com/v2/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "cal-api-version": "2024-08-13",
    },
    body: JSON.stringify({
      eventTypeId: eventTypeObj.id,
      start: startTime,
      attendee: {
        name,
        email,
        timeZone: "Asia/Singapore",
        language: "en",
      },
      bookingFieldsResponses: {
        notes: `Topic: ${topic}${message ? `\n\n${message}` : ""}`,
      },
      metadata: {},
    }),
  });

  if (!bookRes.ok) {
    const err = await bookRes.json();
    return NextResponse.json({ error: err.message || "Booking failed" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}