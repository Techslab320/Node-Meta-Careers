import { getPublicSiteUrl } from "@/config/env";

export const siteConfig = {
  name: "Node Meta Careers",
  description:
    "Join Node Meta and help build secure blockchain infrastructure, decentralized applications, and next-generation Web3 experiences.",
  companyName: "Node Meta",
  brandName: "NODEMETA",
  companyDescription:
    "Revolutionizing blockchain technology with innovative node solutions and decentralized network infrastructure.",
  mainWebsiteUrl:
    process.env.NEXT_PUBLIC_MAIN_WEBSITE_URL || "https://www.node-meta.com",
  siteUrl: getPublicSiteUrl(),
  recruitmentContactEmail: process.env.RECRUITMENT_CONTACT_EMAIL || "",
} as const;

export const departments = [
  "Engineering",
  "Product",
  "Design",
  "Operations",
  "Marketing",
  "Legal",
  "Finance",
  "Other",
] as const;

export const employmentTypes = [
  "full-time",
  "part-time",
  "contract",
  "support",
] as const;

export const experienceLevels = [
  "mid-level",
  "senior",
] as const;

export const remoteTypes = ["remote", "hybrid", "onsite"] as const;

export const jobStatuses = ["draft", "published", "closed"] as const;

export const applicationStatuses = [
  "new",
  "reviewing",
  "shortlisted",
  "interview",
  "assessment",
  "offer",
  "hired",
  "rejected",
] as const;

export const hiringStages = [
  {
    step: 1,
    title: "Application review",
    description: "Our recruitment team reviews your application and resume.",
  },
  {
    step: 2,
    title: "Introductory interview",
    description: "A conversation to learn about your background and interests.",
  },
  {
    step: 3,
    title: "Technical assessment",
    description: "Role-specific evaluation of your skills and experience.",
  },
  {
    step: 4,
    title: "Technical or leadership interview",
    description: "In-depth discussion with team members relevant to the role.",
  },
  {
    step: 5,
    title: "Final decision",
    description: "We share an outcome and next steps when the process concludes.",
  },
] as const;

export const whyJoinCards = [
  {
    title: "Build real Web3 products",
    description:
      "Ship practical decentralized applications, marketplaces, and digital-asset infrastructure used on-chain.",
    icon: "blocks",
  },
  {
    title: "Work with blockchain infrastructure",
    description:
      "Design and operate secure, scalable systems across BNB Smart Chain and cross-chain integrations.",
    icon: "network",
  },
  {
    title: "Remote-friendly collaboration",
    description:
      "Collaborate with distributed teams using modern engineering practices and async communication.",
    icon: "globe",
  },
  {
    title: "Ownership and technical impact",
    description:
      "Take meaningful ownership of architecture, product decisions, and the systems you build.",
    icon: "zap",
  },
] as const;

export const careersHeroFeatures = [
  {
    title: "AI-Powered",
    description: "Smart tools for Web3 product teams.",
    icon: "sparkles",
  },
  {
    title: "Security-First",
    description: "Audited, protected, and transparent hiring.",
    icon: "shield",
  },
  {
    title: "Web3 Utility",
    description: "Build products with real on-chain value.",
    icon: "layers",
  },
  {
    title: "Community Driven",
    description: "Join a global team building together.",
    icon: "users",
  },
] as const;

export const careersHeroStats = [
  { value: "3M+", label: "Global community" },
  { value: "50K+", label: "Digital assets supported" },
  { value: "$10M+", label: "Ecosystem volume" },
] as const;

export const careersHeroNodes = [
  { label: "Engineering roles", position: "top-[8%] left-[12%]" },
  { label: "Interview chat", position: "top-[18%] right-[4%]" },
  { label: "Remote-friendly", position: "bottom-[28%] left-[0%]" },
  { label: "Web3 products", position: "bottom-[12%] right-[8%]" },
  { label: "Career growth", position: "top-[42%] right-[0%]" },
] as const;

export const careersAnnouncement = {
  badge: "Careers",
  message:
    "Node Meta is hiring across engineering, product, and operations. Explore open roles and apply securely through this portal.",
  href: "/jobs",
  linkLabel: "View open roles",
  date: "2026",
} as const;
