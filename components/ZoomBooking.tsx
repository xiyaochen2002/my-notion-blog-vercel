"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";

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

export default function ZoomBooking({ onClose }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    date: "",
    topic: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.date || !form.topic) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/zoom-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const isValid = form.name && form.email && form.date && form.topic;

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
        @keyframes zmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .zm-modal {
          position: relative;
          width: 100%;
          max-width: 480px;
          background: #0f0f0f;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 36px 36px 32px;
          animation: zmSlideUp 0.25s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 32px 80px rgba(0,0,0,0.6);
        }
        @keyframes zmSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .zm-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255,255,255,0.06);
          border: none;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .zm-close:hover {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.8);
        }
        .zm-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }
        .zm-header-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(37, 99, 235, 0.15);
          border: 1px solid rgba(37,99,235,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #60a5fa;
          flex-shrink: 0;
        }
        .zm-title {
          font-size: 17px;
          font-weight: 600;
          color: rgba(255,255,255,0.92);
          margin: 0;
          letter-spacing: -0.2px;
        }
        .zm-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.36);
          margin: 0 0 28px;
          line-height: 1.5;
        }
        .zm-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin: 0 0 24px;
        }
        .zm-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .zm-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .zm-field.full {
          grid-column: 1 / -1;
        }
        .zm-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }
        .zm-req {
          color: rgba(96,165,250,0.7);
          margin-left: 2px;
        }
        .zm-input,
        .zm-textarea {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 10px 13px;
          font-size: 14px;
          color: rgba(255,255,255,0.82);
          outline: none;
          transition: border-color 0.15s, background 0.15s;
          font-family: inherit;
          width: 100%;
          box-sizing: border-box;
        }
        .zm-input::placeholder,
        .zm-textarea::placeholder {
          color: rgba(255,255,255,0.18);
        }
        .zm-input:focus,
        .zm-textarea:focus {
          border-color: rgba(96,165,250,0.4);
          background: rgba(255,255,255,0.06);
        }
        .zm-textarea {
          resize: none;
          line-height: 1.5;
        }
        .zm-footer {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .zm-error {
          font-size: 12px;
          color: #f87171;
          text-align: center;
        }
        .zm-submit {
          width: 100%;
          padding: 12px;
          border-radius: 11px;
          border: none;
          background: #2563eb;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s, opacity 0.15s, transform 0.1s;
          letter-spacing: -0.1px;
          font-family: inherit;
        }
        .zm-submit:hover:not(:disabled) {
          background: #1d4ed8;
        }
        .zm-submit:active:not(:disabled) {
          transform: scale(0.99);
        }
        .zm-submit:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .zm-hint {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          text-align: center;
          line-height: 1.4;
        }
        @keyframes zmSpin {
          to { transform: rotate(360deg); }
        }
        .zm-spinner {
          animation: zmSpin 0.8s linear infinite;
        }
        .zm-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 16px 0 8px;
          gap: 12px;
        }
        .zm-success-icon {
          color: #4ade80;
        }
        .zm-success h2 {
          font-size: 20px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          margin: 0;
        }
        .zm-success p {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          margin: 0;
          line-height: 1.6;
        }
        .zm-success-close {
          margin-top: 12px;
          padding: 10px 32px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: rgba(255,255,255,0.7);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
          font-family: inherit;
        }
        .zm-success-close:hover {
          background: rgba(255,255,255,0.11);
        }
      `}</style>

      <div className="zm-overlay" onClick={onClose}>
        <div className="zm-modal" onClick={(e) => e.stopPropagation()}>
          <button className="zm-close" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>

          {status === "success" ? (
            <div className="zm-success">
              <CheckCircle size={52} className="zm-success-icon" />
              <h2>Request sent!</h2>
              <p>
                I'll review your request and send the<br />
                Zoom link directly to your inbox.
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
              <p className="zm-desc">
                Fill in the details below — I'll confirm and send you the link by email.
              </p>
              <hr className="zm-divider" />

              <div className="zm-grid">
                <div className="zm-field">
                  <label className="zm-label">Name<span className="zm-req">*</span></label>
                  <input
                    className="zm-input"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>

                <div className="zm-field">
                  <label className="zm-label">Email<span className="zm-req">*</span></label>
                  <input
                    className="zm-input"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@email.com"
                    autoComplete="email"
                  />
                </div>

                <div className="zm-field full">
                  <label className="zm-label">Preferred time<span className="zm-req">*</span></label>
                  <input
                    className="zm-input"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    placeholder="e.g. Wednesday, April 15, 2026, 1:00-3:00 PM, China (GMT+8)"
                  />
                </div>

                <div className="zm-field full">
                  <label className="zm-label">Topic<span className="zm-req">*</span></label>
                  <input
                    className="zm-input"
                    name="topic"
                    value={form.topic}
                    onChange={handleChange}
                    placeholder="e.g. Mathematics, Programming, or just a friendly chat…"
                  />
                </div>

                <div className="zm-field full">
                  <label className="zm-label">Anything else? <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>(optional)</span></label>
                  <textarea
                    className="zm-textarea"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Background, questions, or anything you'd like me to know beforehand…"
                    rows={3}
                  />
                </div>
              </div>

              <div className="zm-footer">
                {status === "error" && (
                  <p className="zm-error">Something went wrong — please try again.</p>
                )}
                <button
                  className="zm-submit"
                  onClick={handleSubmit}
                  disabled={status === "loading" || !isValid}
                >
                  {status === "loading" ? (
                    <><Loader2 size={15} className="zm-spinner" /> Sending…</>
                  ) : (
                    "Send request"
                  )}
                </button>
                <p className="zm-hint">I'll get back to you within one week.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}