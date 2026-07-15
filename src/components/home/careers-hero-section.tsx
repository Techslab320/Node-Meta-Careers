import Link from "next/link";
import { CareersHeroVisual } from "@/components/home/careers-hero-visual";

const heroFeatures = [
  {
    title: "AI-Powered",
    description: "Smart Tools for Web3",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9.5 2a3.5 3.5 0 0 0-3.5 3.5V6a3 3 0 0 0-2 2.83V10a3 3 0 0 0 1 2.24V14a3 3 0 0 0 2 2.83V18a3.5 3.5 0 0 0 3.5 3.5" />
        <path d="M14.5 2A3.5 3.5 0 0 1 18 5.5V6a3 3 0 0 1 2 2.83V10a3 3 0 0 1-1 2.24V14a3 3 0 0 1-2 2.83V18a3.5 3.5 0 0 1-3.5 3.5" />
        <line x1="12" y1="2" x2="12" y2="22" />
      </svg>
    ),
  },
  {
    title: "Security-First",
    description: "Audited, Protected & Transparent",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Web3 Utility",
    description: "Real Utility, Real Value",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="12" cy="18" r="3" />
        <line x1="8.4" y1="7.8" x2="10.4" y2="16" />
        <line x1="15.6" y1="7.8" x2="13.6" y2="16" />
        <line x1="9" y1="6" x2="15" y2="6" />
      </svg>
    ),
  },
  {
    title: "Community Driven",
    description: "Built for the Community",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
] as const;

const heroStats = [
  { value: "3M+", label: "GLOBAL COMMUNITY" },
  { value: "50K+", label: "DIGITAL ASSETS" },
  { value: "$10M+", label: "ECOSYSTEM VOLUME" },
] as const;

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CareersHeroSection() {
  return (
    <header
      id="home"
      className="nm-hero-header"
      style={{
        position: "relative",
        paddingBottom: "110px",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      <div className="nm-container nm-hero-grid">
        <div>
          <div className="eyebrow">AI-Powered · Security-First · Community Driven</div>

          <h1
            className="font-display font-bold text-white"
            style={{
              fontSize: "55px",
              lineHeight: 1.06,
              letterSpacing: "-0.02em",
              marginBottom: "22px",
            }}
          >
            The Future of
            <br />
            <span
              style={{
                background: "var(--grad-primary)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI-Powered
            </span>
            <br />
            Web3 Utility
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "var(--text-dim)",
              maxWidth: "480px",
              marginBottom: "32px",
              lineHeight: 1.65,
            }}
          >
            NodeMeta is evolving into a security-first decentralized ecosystem where AI tools,
            Web3 services, digital rewards, and community-driven opportunities come together to
            create long-term value.
          </p>

          <div className="hero-feature-row">
            {heroFeatures.map((feature) => (
              <div key={feature.title}>
                <div className="hf-icon">{feature.icon}</div>
                <div className="hf-title">{feature.title}</div>
                <div className="hf-desc">{feature.description}</div>
              </div>
            ))}
          </div>

          <div className="hero-stats">
            {heroStats.map((stat) => (
              <div key={stat.label} className="stat">
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <Link href="/jobs" className="btn-primary">
              View Open Positions
              <ArrowIcon />
            </Link>
            <a href="#hiring-process" className="btn-secondary">
              View Hiring Process
            </a>
          </div>
        </div>

        <CareersHeroVisual />
      </div>
    </header>
  );
}
