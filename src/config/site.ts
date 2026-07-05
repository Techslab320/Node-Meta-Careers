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
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
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
