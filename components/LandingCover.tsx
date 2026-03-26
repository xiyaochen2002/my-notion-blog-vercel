"use client";

import Link from "next/link";
import {
  Feather,
  Sparkles,
  Coffee,
  MapPinned,
  NotebookText,
} from "lucide-react";

export default function LandingCover() {
  return (
    <section className="landingCover">
      <div className="landingGrid" />
      <div className="landingGlow" />

      <div className="landingInner">
        <div className="landingAvatarWrap">
          <img
            src="/avatar.jpg"
            alt="Xiyao Chen avatar"
            className="landingAvatar"
          />
        </div>

        <h1 className="landingTitle">Xiyao Chen</h1>
        <p className="landingSubtitle">Mathmatics · Programming · Life </p>

        <nav className="landingNav">
          <Link href="/blog" className="landingNavItem">
            <span className="landingIcon">
              <Feather size={20} strokeWidth={1.8} />
            </span>
            <span>Blog</span>
          </Link>

          <Link href="/thoughts" className="landingNavItem">
            <span className="landingIcon">
              <Sparkles size={20} strokeWidth={1.8} />
            </span>
            <span>Thoughts</span>
          </Link>

          <Link href="/about" className="landingNavItem">
            <span className="landingIcon">
              <Coffee size={20} strokeWidth={1.8} />
            </span>
            <span>About</span>
          </Link>

          <Link href="/travel" className="landingNavItem">
            <span className="landingIcon">
              <MapPinned size={20} strokeWidth={1.8} />
            </span>
            <span>Travel</span>
          </Link>

          <Link href="/notes" className="landingNavItem">
            <span className="landingIcon">
              <NotebookText size={20} strokeWidth={1.8} />
            </span>
            <span>Notes</span>
          </Link>
        </nav>
      </div>
    </section>
  );
}