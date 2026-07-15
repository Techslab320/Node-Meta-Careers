"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const floatTags = [
  {
    className: "ft-1",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9.5 2a3.5 3.5 0 0 0-3.5 3.5V6a3 3 0 0 0-2 2.83V10a3 3 0 0 0 1 2.24V14a3 3 0 0 0 2 2.83V18a3.5 3.5 0 0 0 3.5 3.5" />
        <path d="M14.5 2A3.5 3.5 0 0 1 18 5.5V6a3 3 0 0 1 2 2.83V10a3 3 0 0 1-1 2.24V14a3 3 0 0 1-2 2.83V18a3.5 3.5 0 0 1-3.5 3.5" />
        <line x1="12" y1="2" x2="12" y2="22" />
      </svg>
    ),
    label: (
      <>
        AI
        <br />
        TOOLS HUB
      </>
    ),
  },
  {
    className: "ft-2",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20.6 12.6 12.4 20.8a2 2 0 0 1-2.8 0L2.5 13.8a2 2 0 0 1 0-2.8L10.7 3a2 2 0 0 1 1.4-.6H19a2 2 0 0 1 2 2v6.8a2 2 0 0 1-.4 1.4z" />
        <circle cx="15" cy="7" r="1.3" fill="currentColor" stroke="none" />
      </svg>
    ),
    label: (
      <>
        UTILITY
        <br />& DISCOUNTS
      </>
    ),
  },
  {
    className: "ft-3",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points="3 17 9 11 13 15 21 6" />
        <polyline points="14 6 21 6 21 13" />
      </svg>
    ),
    label: (
      <>
        STAKE
        <br />& EARN
      </>
    ),
  },
  {
    className: "ft-4",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
    label: (
      <>
        LAUNCHPAD
        <br />
        ACCESS
      </>
    ),
  },
  {
    className: "ft-5",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 12v9H4v-9" />
        <path d="M2 7h20v5H2z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
    label: (
      <>
        COMMUNITY
        <br />
        REWARDS
      </>
    ),
  },
] as const;

export function CareersHeroVisual() {
  const [globeSvg, setGlobeSvg] = useState("");
  const [transform, setTransform] = useState("rotateX(0deg) rotateY(0deg)");

  useEffect(() => {
    fetch("/images/hero-globe.svg")
      .then((response) => response.text())
      .then(setGlobeSvg)
      .catch(() => setGlobeSvg(""));
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 20;
      const y = (event.clientY / window.innerHeight - 0.5) * -20;
      setTransform(`rotateX(${y}deg) rotateY(${x}deg)`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="hero-visual">
      <div className="hero-glow-field" aria-hidden />
      <div className="hero-orbit-ring r2" aria-hidden />
      <div className="hero-orbit-ring r1" aria-hidden />

      <div
        className="hero-globe-wrap"
        style={{
          transform,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="hero-globe"
          {...(globeSvg
            ? { dangerouslySetInnerHTML: { __html: globeSvg } }
            : {})}
        />
      </div>

      <div className="hero-medallion-wrap">
        <Image
          src="/images/hero-medallion.webp"
          alt=""
          width={400}
          height={597}
          priority
          aria-hidden
        />
      </div>

      {floatTags.map((tag) => (
        <div key={tag.className} className={`hero-float-tag ${tag.className}`}>
          <div className="ft-icon">{tag.icon}</div>
          <div className="ft-label">{tag.label}</div>
        </div>
      ))}
    </div>
  );
}
