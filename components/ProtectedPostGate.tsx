"use client";

import { useState } from "react";

type ProtectedPostGateProps = {
  slug: string;
  children: React.ReactNode;
};

export default function ProtectedPostGate({
  slug,
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
        <h2>Enter Password</h2>
        <p className="postPasswordHint">
          This post is protected. Enter the password to continue.
        </p>

        <form onSubmit={handleSubmit} className="postPasswordForm">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
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