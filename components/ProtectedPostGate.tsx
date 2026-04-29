"use client";

import { useState } from "react";

type ProtectedPostGateProps = {
  slug: string;
  question?: string;
  children: React.ReactNode;
};

export default function ProtectedPostGate({
  slug,
  question,
  children,
}: ProtectedPostGateProps) {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/verify-post-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug, password }),
    });

    const data = await res.json();

    if (data.success) {
      setUnlocked(true);
    } else {
      setError(data.message || "Wrong password.");
    }
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <section className="postPasswordGate">
      <div className="postPasswordCard">
        <p className="postEyebrow">Protected Post</p>
        <h2>A little question</h2>
        {question ? (
          <p className="postPasswordQuestion">{question}</p>
        ) : (
          <p className="postPasswordHint">Answer correctly to unlock this post.</p>
        )}

        <form onSubmit={handleSubmit} className="postPasswordForm">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your answer"
            className="postPasswordInput"
          />
          <button type="submit" className="postPasswordButton">
            Unlock
          </button>
        </form>

        {error ? <p className="postPasswordError">{error}</p> : null}
      </div>
    </section>
  );
}