"use client";

import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  onClose: () => void;
}

function ZoomIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 13.5c0 .414-.336.75-.75.75h-7.5A.75.75 0 017.5 15.5v-5a.75.75 0 01.75-.75h5a.75.75 0 01.75.75v1.19l2.146-1.43A.5.5 0 0117 10.75v2.5a.5.5 0 01-.854.354L14 12.19V15.5z" />
    </svg>
  );
}

const EVENT_TYPES: Record<string, string> = {
  "30-min-chat": "30 min chat",
  "one-hour-chat": "1 hour chat",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function ZoomBooking({ onClose }: Props) {
  const [step, setStep] = useState<"type" | "datetime" | "form" | "success">("type");
  const [eventType, setEventType] = useState<string>("");
  const [calViewDate, setCalViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<{ start: string }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (!selectedDate || !eventType) return;
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot(null);

    fetch(`/api/cal-slots?date=${selectedDate}&eventType=${eventType}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots || []);
        setSlotsLoading(false);
      })
      .catch(() => setSlotsLoading(false));
  }, [selectedDate, eventType]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.topic || !selectedSlot) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/cal-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          startTime: selectedSlot.start,
          name: form.name,
          email: form.email,
          topic: form.topic,
          message: form.message,
        }),
      });
      if (res.ok) {
        setStep("success");
      } else {
        const d = await res.json();
        setError(d.error || "Something went wrong — please try again.");
      }
    } catch {
      setError("Something went wrong — please try again.");
    }
    setSubmitting(false);
  }

  const year = calViewDate.getFullYear();
  const month = calViewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthLabel = calViewDate.toLocaleString("en-US", { month: "long", year: "numeric" });

  function prevMonth() {
    setCalViewDate(new Date(year, month - 1, 1));
    setSelectedDate("");
    setSlots([]);
  }
  function nextMonth() {
    setCalViewDate(new Date(year, month + 1, 1));
    setSelectedDate("");
    setSlots([]);
  }

  return (
    <>
      <style>{`
        .zm-overlay {
          position: fixed;
          inset: 0;
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(6px);
          animation: zmFadeIn 0.2s ease;
        }
        @keyframes zmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .zm-modal {
          position: relative;
          width: 100%;
          max-width: 520px;
          background: #0f0f0f;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 36px 36px 32px;
          animation: zmSlideUp 0.25s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 32px 80px rgba(0,0,0,0.6);
          max-height: 90vh;
          overflow-y: auto;
        }
        @keyframes zmSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .zm-close {
          position: absolute;
          top: 16px; right: 16px;
          background: rgba(255,255,255,0.06);
          border: none; border-radius: 8px;
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .zm-close:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }
        .zm-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .zm-header-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(37,99,235,0.15);
          border: 1px solid rgba(37,99,235,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #60a5fa; flex-shrink: 0;
        }
        .zm-title { font-size: 17px; font-weight: 600; color: rgba(255,255,255,0.92); margin: 0; letter-spacing: -0.2px; }
        .zm-desc { font-size: 13px; color: rgba(255,255,255,0.36); margin: 0 0 24px; line-height: 1.5; }
        .zm-divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 0 0 20px; }

        /* Step indicator */
        .zm-steps { display: flex; gap: 6px; margin-bottom: 20px; }
        .zm-step-dot {
          height: 3px; flex: 1; border-radius: 2px;
          background: rgba(255,255,255,0.1);
          transition: background 0.2s;
        }
        .zm-step-dot.active { background: #2563eb; }
        .zm-step-dot.done { background: rgba(37,99,235,0.4); }

        /* Type selection */
        .zm-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
        .zm-type-card {
          padding: 16px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          cursor: pointer; text-align: left;
          transition: border-color 0.15s, background 0.15s;
          color: inherit;
        }
        .zm-type-card:hover { border-color: rgba(96,165,250,0.3); background: rgba(255,255,255,0.05); }
        .zm-type-card.selected { border-color: #2563eb; background: rgba(37,99,235,0.1); }
        .zm-type-duration { font-size: 20px; font-weight: 700; color: rgba(255,255,255,0.9); margin-bottom: 4px; }
        .zm-type-label { font-size: 12px; color: rgba(255,255,255,0.4); }

        /* Calendar */
        .zm-cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .zm-cal-month { font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.85); }
        .zm-cal-nav {
          background: rgba(255,255,255,0.05); border: none; border-radius: 8px;
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.5); cursor: pointer; transition: background 0.15s;
        }
        .zm-cal-nav:hover { background: rgba(255,255,255,0.1); }
        .zm-cal-nav:disabled { opacity: 0.3; cursor: not-allowed; }
        .zm-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
        .zm-cal-dow { text-align: center; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.25); padding: 4px 0 8px; letter-spacing: 0.05em; }
        .zm-cal-day {
          aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
          font-size: 13px; border-radius: 8px; cursor: pointer;
          color: rgba(255,255,255,0.6);
          transition: background 0.12s, color 0.12s;
          border: 1px solid transparent;
        }
        .zm-cal-day:hover:not(.disabled):not(.empty) { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.9); }
        .zm-cal-day.selected { background: #2563eb; color: white; border-color: #2563eb; }
        .zm-cal-day.disabled { color: rgba(255,255,255,0.15); cursor: not-allowed; }
        .zm-cal-day.empty { cursor: default; }
        .zm-cal-day.today { border-color: rgba(96,165,250,0.4); color: #60a5fa; }
        .zm-cal-day.today.selected { color: white; }

        /* Time slots */
        .zm-slots-title { font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin: 20px 0 10px; }
        .zm-slots-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .zm-slot {
          padding: 9px 4px; border-radius: 8px; text-align: center;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          font-size: 13px; color: rgba(255,255,255,0.65);
          cursor: pointer; transition: border-color 0.12s, background 0.12s, color 0.12s;
        }
        .zm-slot:hover { border-color: rgba(96,165,250,0.3); color: rgba(255,255,255,0.9); }
        .zm-slot.selected { border-color: #2563eb; background: rgba(37,99,235,0.15); color: white; }
        .zm-slots-empty { font-size: 13px; color: rgba(255,255,255,0.25); padding: 12px 0; }
        .zm-slots-loading { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,0.3); padding: 12px 0; }

        /* Form */
        .zm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .zm-field { display: flex; flex-direction: column; gap: 6px; }
        .zm-field.full { grid-column: 1 / -1; }
        .zm-label { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.35); }
        .zm-req { color: rgba(96,165,250,0.7); margin-left: 2px; }
        .zm-input, .zm-textarea {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 10px 13px;
          font-size: 14px; color: rgba(255,255,255,0.82);
          outline: none; transition: border-color 0.15s, background 0.15s;
          font-family: inherit; width: 100%; box-sizing: border-box;
        }
        .zm-input::placeholder, .zm-textarea::placeholder { color: rgba(255,255,255,0.18); }
        .zm-input:focus, .zm-textarea:focus { border-color: rgba(96,165,250,0.4); background: rgba(255,255,255,0.06); }
        .zm-textarea { resize: none; line-height: 1.5; }

        /* Selected slot summary */
        .zm-selected-summary {
          background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.2);
          border-radius: 10px; padding: 10px 14px;
          font-size: 13px; color: rgba(255,255,255,0.7);
          margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
        }
        .zm-selected-summary strong { color: rgba(255,255,255,0.9); }

        /* Footer / buttons */
        .zm-footer { margin-top: 24px; display: flex; flex-direction: column; gap: 10px; }
        .zm-btn-row { display: flex; gap: 10px; }
        .zm-back {
          padding: 12px 20px; border-radius: 11px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent; color: rgba(255,255,255,0.5);
          font-size: 14px; font-weight: 500; cursor: pointer;
          transition: background 0.15s; font-family: inherit;
        }
        .zm-back:hover { background: rgba(255,255,255,0.05); }
        .zm-submit {
          flex: 1; padding: 12px; border-radius: 11px; border: none;
          background: #2563eb; color: white;
          font-size: 14px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s, opacity 0.15s, transform 0.1s;
          letter-spacing: -0.1px; font-family: inherit;
        }
        .zm-submit:hover:not(:disabled) { background: #1d4ed8; }
        .zm-submit:active:not(:disabled) { transform: scale(0.99); }
        .zm-submit:disabled { opacity: 0.4; cursor: not-allowed; }
        .zm-error { font-size: 12px; color: #f87171; text-align: center; }
        .zm-hint { font-size: 11px; color: rgba(255,255,255,0.2); text-align: center; line-height: 1.4; }
        @keyframes zmSpin { to { transform: rotate(360deg); } }
        .zm-spinner { animation: zmSpin 0.8s linear infinite; }

        /* Success */
        .zm-success { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 16px 0 8px; gap: 12px; }
        .zm-success-icon { color: #4ade80; }
        .zm-success h2 { font-size: 20px; font-weight: 600; color: rgba(255,255,255,0.9); margin: 0; }
        .zm-success p { font-size: 14px; color: rgba(255,255,255,0.4); margin: 0; line-height: 1.6; }
        .zm-success-close {
          margin-top: 12px; padding: 10px 32px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: rgba(255,255,255,0.7);
          font-size: 14px; font-weight: 500; cursor: pointer;
          transition: background 0.15s; font-family: inherit;
        }
        .zm-success-close:hover { background: rgba(255,255,255,0.11); }
      `}</style>

      <div className="zm-overlay" onClick={onClose}>
        <div className="zm-modal" onClick={(e) => e.stopPropagation()}>
          <button className="zm-close" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>

          {step === "success" ? (
            <div className="zm-success">
              <CheckCircle size={52} className="zm-success-icon" />
              <h2>You&apos;re booked!</h2>
              <p>
                A confirmation with the Zoom link<br />
                has been sent to your email.
              </p>
              <button className="zm-success-close" onClick={onClose}>Close</button>
            </div>
          ) : (
            <>
              <div className="zm-header">
                <div className="zm-header-icon">
                  <ZoomIcon size={20} />
                </div>
                <h2 className="zm-title">Schedule a Zoom meeting with Xiyao</h2>
              </div>
              <p className="zm-desc">Pick a time that works for you — confirmation sent instantly.</p>
              <hr className="zm-divider" />

              {/* Step dots */}
              <div className="zm-steps">
                {["type", "datetime", "form"].map((s, i) => (
                  <div
                    key={s}
                    className={`zm-step-dot ${
                      step === s ? "active" : ["type","datetime","form"].indexOf(step) > i ? "done" : ""
                    }`}
                  />
                ))}
              </div>

              {/* Step 1: choose event type */}
              {step === "type" && (
                <>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>
                    How long would you like to meet?
                  </div>
                  <div className="zm-type-grid">
                    {Object.entries(EVENT_TYPES).map(([slug, label]) => (
                      <button
                        key={slug}
                        className={`zm-type-card ${eventType === slug ? "selected" : ""}`}
                        onClick={() => setEventType(slug)}
                      >
                        <div className="zm-type-duration">{slug === "30-min-chat" ? "30 min" : "1 hour"}</div>
                        <div className="zm-type-label">{label}</div>
                      </button>
                    ))}
                  </div>
                  <div className="zm-footer">
                    <button
                      className="zm-submit"
                      disabled={!eventType}
                      onClick={() => setStep("datetime")}
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: pick date and time */}
              {step === "datetime" && (
                <>
                  <div className="zm-cal-header">
                    <button
                      className="zm-cal-nav"
                      onClick={prevMonth}
                      disabled={year === today.getFullYear() && month <= today.getMonth()}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="zm-cal-month">{monthLabel}</span>
                    <button className="zm-cal-nav" onClick={nextMonth}>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="zm-cal-grid">
                    {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                      <div key={d} className="zm-cal-dow">{d}</div>
                    ))}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`e${i}`} className="zm-cal-day empty" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const date = new Date(year, month, day);
                      const dateStr = formatDate(date);
                      const isPast = date < today;
                      const isToday = formatDate(date) === formatDate(today);
                      const isSelected = selectedDate === dateStr;
                      return (
                        <div
                          key={day}
                          className={`zm-cal-day ${isPast ? "disabled" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                          onClick={() => !isPast && setSelectedDate(dateStr)}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>

                  {selectedDate && (
                    <>
                      <div className="zm-slots-title">
                        Available times — {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      {slotsLoading ? (
                        <div className="zm-slots-loading">
                          <Loader2 size={14} className="zm-spinner" /> Loading available times…
                        </div>
                      ) : slots.length === 0 ? (
                        <div className="zm-slots-empty">No available times on this day.</div>
                      ) : (
                        <div className="zm-slots-grid">
                          {slots.map((slot) => (
                            <div
                              key={slot.start}
                              className={`zm-slot ${selectedSlot?.start === slot.start ? "selected" : ""}`}
                              onClick={() => setSelectedSlot(slot)}
                            >
                              {formatTime(slot.start)}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  <div className="zm-footer">
                    <div className="zm-btn-row">
                      <button className="zm-back" onClick={() => setStep("type")}>Back</button>
                      <button
                        className="zm-submit"
                        disabled={!selectedSlot}
                        onClick={() => setStep("form")}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: fill in details */}
              {step === "form" && (
                <>
                  {selectedSlot && (
                    <div className="zm-selected-summary">
                      <ZoomIcon size={16} />
                      <span>
                        <strong>{EVENT_TYPES[eventType]}</strong> ·{" "}
                        {new Date(selectedSlot.start).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}{" "}
                        at <strong>{formatTime(selectedSlot.start)}</strong>
                      </span>
                    </div>
                  )}

                  <div className="zm-grid">
                    <div className="zm-field">
                      <label className="zm-label">Name<span className="zm-req">*</span></label>
                      <input className="zm-input" name="name" value={form.name} onChange={handleChange} placeholder="Your name" autoComplete="name" />
                    </div>
                    <div className="zm-field">
                      <label className="zm-label">Email<span className="zm-req">*</span></label>
                      <input className="zm-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" autoComplete="email" />
                    </div>
                    <div className="zm-field full">
                      <label className="zm-label">Topic<span className="zm-req">*</span></label>
                      <input className="zm-input" name="topic" value={form.topic} onChange={handleChange} placeholder="e.g. Mathematics, Programming, or just a friendly chat…" />
                    </div>
                    <div className="zm-field full">
                      <label className="zm-label">Anything else? <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>(optional)</span></label>
                      <textarea className="zm-textarea" name="message" value={form.message} onChange={handleChange} placeholder="Background, questions, or anything you'd like me to know beforehand…" rows={3} />
                    </div>
                  </div>

                  <div className="zm-footer">
                    {error && <p className="zm-error">{error}</p>}
                    <div className="zm-btn-row">
                      <button className="zm-back" onClick={() => setStep("datetime")}>Back</button>
                      <button
                        className="zm-submit"
                        onClick={handleSubmit}
                        disabled={submitting || !form.name || !form.email || !form.topic}
                      >
                        {submitting ? <><Loader2 size={15} className="zm-spinner" /> Booking…</> : "Confirm booking"}
                      </button>
                    </div>
                    <p className="zm-hint">You&apos;ll receive a Zoom link confirmation by email.</p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}