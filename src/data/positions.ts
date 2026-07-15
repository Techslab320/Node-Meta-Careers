import type { RemoteType } from "@/types";
import {
  buildCompensationBands,
  getCompensationBand,
  type CompensationBase,
} from "@/lib/jobs/compensation";

export interface PositionSeed {
  title: string;
  slug: string;
  department: string;
  location: string;
  remoteType: RemoteType;
  compensationBase: CompensationBase;
  summary: string;
  overview: string;
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  technologies: string[];
  benefits: string[];
  featured?: boolean;
}

export const jobsPageIntro = {
  title: "NodeMeta — Job Descriptions",
  subtitle: "Roles for NFT Marketplace & SmartCommerce initiatives",
  sourcingNote:
    "For blockchain-specific roles, weight verified GitHub contributions and deployed/verified contracts (viewable on BscScan) more heavily than resume claims — this space has a lot of resume inflation relative to demonstrable on-chain work.",
};

export const positionPublishedAt = "2026-06-12T00:00:00.000Z";

export const nodeMetaPositions: PositionSeed[] = [
  {
    title: "Blockchain / Smart Contract Developer",
    slug: "blockchain-smart-contract-developer",
    department: "Engineering",
    location: "Remote",
    remoteType: "remote",
    compensationBase: { midMin: 120000, midMax: 158000 },
    summary:
      "Design and implement smart contracts for NodeMeta's NFT marketplace — staking mechanics, real-world utility redemption, and secure minting/trading flows on BNB Smart Chain.",
    overview:
      "You'll design and implement the smart contracts powering NodeMeta's NFT marketplace — including staking mechanics, real-world utility redemption, and secure minting/trading flows on BNB Smart Chain.",
    responsibilities: [
      "Design, write, and test smart contracts for NFT minting, trading, and staking (BEP-721/BEP-1155, BEP-20 for the NTE token)",
      "Implement staking logic: reward accrual, lock-up periods, early-withdrawal penalties",
      "Collaborate with security auditors to prepare contracts for audit and remediate findings",
      "Optimize for gas efficiency on BSC",
      "Write comprehensive test suites (unit, integration, fuzz testing)",
    ],
    requiredQualifications: [
      "2+ years writing production Solidity, ideally with deployed/verified contracts (please share BscScan or Etherscan links)",
      "Strong understanding of common smart contract vulnerabilities (reentrancy, integer overflow, oracle manipulation, front-running)",
      "Experience with Hardhat or Foundry",
      "Familiarity with OpenZeppelin libraries and standards",
    ],
    preferredQualifications: [
      "Prior experience with staking protocols or NFT marketplaces",
      "Experience with a completed third-party audit (CertiK, PeckShield, etc.)",
    ],
    technologies: [
      "Solidity",
      "Hardhat",
      "Foundry",
      "OpenZeppelin",
      "BNB Smart Chain",
      "BEP-721",
      "BEP-1155",
    ],
    benefits: [
      "Build production smart contracts on BNB Smart Chain",
      "Work on NFT marketplace and staking infrastructure",
      "Remote-friendly engineering team",
      "Open to full-time, part-time, contract, or support at mid-level or senior",
    ],
    featured: true,
  },
  {
    title: "Smart Contract Security Reviewer",
    slug: "smart-contract-security-reviewer",
    department: "Engineering",
    location: "Remote",
    remoteType: "remote",
    compensationBase: { midMin: 116000, midMax: 163000 },
    summary:
      "Part-time, contract, or full-time role reviewing contract code before external audit and acting as the internal liaison for audit findings.",
    overview:
      "A part-time, contract, or full-time role reviewing contract code before it goes to external audit, and acting as the internal liaison for audit findings.",
    responsibilities: [
      "Perform internal code review of all smart contracts prior to external audit",
      "Coordinate with third-party auditing firms; triage and prioritize remediation of findings",
      "Maintain a security checklist/playbook for the team",
      "Monitor deployed contracts for anomalous activity post-launch",
    ],
    requiredQualifications: [
      "Demonstrated experience auditing or securing Solidity contracts (audit reports, CTF/wargame history, or bug bounty submissions are strong signals)",
      "Familiarity with tools like Slither, Mythril, Echidna",
      "Comfortable reading and reasoning about unfamiliar codebases quickly",
    ],
    preferredQualifications: [],
    technologies: ["Solidity", "Slither", "Mythril", "Echidna", "BNB Smart Chain"],
    benefits: [
      "Flexible engagement (full-time, part-time, contract, or support)",
      "Available at mid-level or senior",
      "Direct impact on protocol security",
      "Remote collaboration",
    ],
  },
  {
    title: "Backend Engineer — Blockchain Indexing & Marketplace Services",
    slug: "backend-engineer-blockchain-indexing-marketplace",
    department: "Engineering",
    location: "Remote",
    remoteType: "remote",
    compensationBase: { midMin: 112000, midMax: 148000 },
    summary:
      "Build off-chain infrastructure powering marketplace browsing, search, bids, and transfer history — translating on-chain events into a fast, reliable experience.",
    overview:
      "Build the off-chain infrastructure that powers marketplace browsing, search, bids, and transfer history — translating on-chain events into a fast, reliable experience.",
    responsibilities: [
      "Build and maintain indexers for on-chain NFT events (listings, bids, transfers, staking events)",
      "Design APIs to serve marketplace data to the frontend",
      "Manage metadata storage and retrieval (IPFS/Arweave)",
      "Ensure data consistency between on-chain state and off-chain databases, including handling chain reorgs",
    ],
    requiredQualifications: [
      "Strong backend experience in Node.js, Go, or Python",
      "Experience with blockchain event indexing (The Graph, custom indexers, or similar)",
      "Comfortable working with IPFS or similar decentralized storage",
      "Experience with PostgreSQL/Redis or similar",
    ],
    preferredQualifications: [],
    technologies: [
      "Node.js",
      "Go",
      "Python",
      "The Graph",
      "IPFS",
      "PostgreSQL",
      "Redis",
    ],
    benefits: [
      "Own core marketplace data infrastructure",
      "Remote-friendly team",
      "Work across on-chain and off-chain systems",
      "Open to full-time, part-time, contract, or support at mid-level or senior",
    ],
  },
  {
    title: "Frontend Engineer — Web3",
    slug: "frontend-engineer-web3",
    department: "Engineering",
    location: "Remote",
    remoteType: "remote",
    compensationBase: { midMin: 146000, midMax: 192000 },
    summary:
      "Build the user-facing NFT marketplace and staking dashboard with seamless wallet connectivity for a BSC-native audience.",
    overview:
      "Build the user-facing NFT marketplace and staking dashboard, with seamless wallet connectivity for a BSC-native audience.",
    responsibilities: [
      "Build responsive marketplace UI (browse, buy, sell, stake NFTs) in React/Next.js",
      "Integrate wallet connections (MetaMask, Trust Wallet, WalletConnect) via ethers.js or web3.js",
      "Build clear, trustworthy transaction flows (approvals, gas estimates, confirmations)",
      "Collaborate with design on making complex crypto interactions feel simple",
    ],
    requiredQualifications: [
      "Strong React/Next.js experience",
      "Hands-on experience integrating Web3 wallets into a production frontend",
      "Understanding of transaction lifecycle (pending/confirmed/failed states) and how to communicate it to non-technical users",
    ],
    preferredQualifications: [
      "Prior work on an NFT marketplace or DeFi frontend",
    ],
    technologies: [
      "React",
      "Next.js",
      "ethers.js",
      "WalletConnect",
      "MetaMask",
      "BNB Smart Chain",
    ],
    benefits: [
      "Ship user-facing Web3 products",
      "Remote-friendly collaboration",
      "Focus on trustworthy transaction UX",
      "Open to full-time, part-time, contract, or support at mid-level or senior",
    ],
    featured: true,
  },
  {
    title: "Payments / Commerce Backend Engineer (SmartCommerce)",
    slug: "payments-commerce-backend-engineer-smartcommerce",
    department: "Engineering",
    location: "Remote",
    remoteType: "remote",
    compensationBase: { midMin: 115000, midMax: 152000 },
    summary:
      "Build the bridge between crypto token payments and real-world commerce — enabling users to spend NTE tokens on physical and digital goods.",
    overview:
      "Build the bridge between crypto token payments and real-world commerce — enabling users to spend NTE tokens on physical and digital goods.",
    responsibilities: [
      "Design and build payment settlement flows connecting on-chain token payments to order fulfillment systems",
      "Integrate with logistics/fulfillment providers for physical goods",
      "Handle edge cases: failed transactions, refunds, chargebacks-equivalent for crypto payments, price volatility between order and settlement",
      "Build merchant-facing tools if third-party sellers are supported",
    ],
    requiredQualifications: [
      "Experience building e-commerce or payments backend systems",
      "Familiarity with crypto payment processing (BitPay, Coinbase Commerce, or custom on-chain payment integration)",
      "Experience with order management and fulfillment integrations (Shopify, ShipStation, or similar)",
      "Strong grasp of handling asynchronous, irreversible transactions safely",
    ],
    preferredQualifications: [],
    technologies: [
      "Node.js",
      "Payments APIs",
      "Shopify",
      "ShipStation",
      "BNB Smart Chain",
    ],
    benefits: [
      "Build SmartCommerce payment infrastructure",
      "Remote-friendly team",
      "Bridge Web3 tokens with real-world commerce",
      "Open to full-time, part-time, contract, or support at mid-level or senior",
    ],
  },
  {
    title: "DevOps / Infrastructure Engineer",
    slug: "devops-infrastructure-engineer",
    department: "Engineering",
    location: "Remote",
    remoteType: "remote",
    compensationBase: { midMin: 134000, midMax: 193000 },
    summary:
      "Keep chain-facing and application infrastructure reliable, monitored, and secure.",
    overview:
      "Keep the chain-facing and application infrastructure reliable, monitored, and secure.",
    responsibilities: [
      "Manage RPC provider relationships and failover for BSC connectivity",
      "Set up monitoring/alerting for failed transactions, indexer lag, and contract anomalies",
      "Manage CI/CD for smart contract deployment (testnet → mainnet promotion process)",
      "Own infrastructure security posture (key management, secrets, access control)",
    ],
    requiredQualifications: [
      "Experience running production infrastructure (AWS/GCP + Kubernetes or similar)",
      "Familiarity with blockchain node operations or RPC provider management (Alchemy, QuickNode, Ankr, etc.)",
      "Strong security fundamentals, especially around private key/secrets management",
    ],
    preferredQualifications: [],
    technologies: [
      "AWS",
      "GCP",
      "Kubernetes",
      "CI/CD",
      "QuickNode",
      "Ankr",
    ],
    benefits: [
      "Own production infrastructure for Web3 systems",
      "Remote-friendly team",
      "Security-first operations culture",
      "Open to full-time, part-time, contract, or support at mid-level or senior",
    ],
  },
  {
    title: "Web3 Platform Support Specialist",
    slug: "web3-platform-support-specialist",
    department: "Operations",
    location: "Remote",
    remoteType: "remote",
    compensationBase: {
      midMin: 52000,
      midMax: 72000,
      monthlyFactors: { "part-time": 0.65, contract: 0.78, support: 1 },
    },
    summary:
      "Help users navigate the NFT marketplace, staking flows, and SmartCommerce orders with clear, trustworthy technical support.",
    overview:
      "Provide frontline support for NodeMeta users across marketplace, wallet, staking, and commerce workflows while escalating technical issues to engineering.",
    responsibilities: [
      "Respond to user inquiries about marketplace listings, wallet connections, staking, and token payments",
      "Triage bugs and transaction issues with structured logs and reproduction steps for engineering",
      "Maintain support playbooks for common Web3 user issues",
      "Monitor support channels and identify recurring product friction points",
    ],
    requiredQualifications: [
      "1+ years in customer or technical support, ideally in crypto, fintech, or SaaS",
      "Clear written communication and patience explaining Web3 concepts to non-technical users",
      "Familiarity with MetaMask, Trust Wallet, or similar wallet workflows",
      "Comfortable working across time zones in a remote team",
    ],
    preferredQualifications: [
      "Experience supporting NFT marketplaces or DeFi products",
      "Basic understanding of BNB Smart Chain transactions and block explorers",
    ],
    technologies: [
      "Zendesk",
      "Intercom",
      "BNB Smart Chain",
      "MetaMask",
      "BscScan",
    ],
    benefits: [
      "Remote-friendly support role",
      "Exposure to live Web3 product operations",
      "Clear escalation path into product or operations",
      "Open to full-time, part-time, contract, or support at mid-level or senior",
    ],
  },
  {
    title: "Designer",
    slug: "designer",
    department: "Design",
    location: "Remote",
    remoteType: "remote",
    compensationBase: { midMin: 82000, midMax: 118000 },
    summary:
      "Shape NodeMeta's product and brand experience across the NFT marketplace, staking dashboard, and marketing touchpoints with clear, trustworthy Web3 UX.",
    overview:
      "You'll own visual design for NodeMeta's user-facing products and brand presence — from marketplace flows and staking interfaces to campaign assets and design systems that make complex crypto interactions feel approachable.",
    responsibilities: [
      "Design responsive UI for the NFT marketplace, staking dashboard, and SmartCommerce experiences",
      "Create and maintain a cohesive design system aligned with the NodeMeta brand",
      "Collaborate with frontend engineers to deliver polished, implementation-ready specs",
      "Produce marketing visuals, social assets, and landing page designs for product launches",
      "Run lightweight user research and usability reviews to improve conversion and clarity",
    ],
    requiredQualifications: [
      "3+ years designing digital products (web or mobile), with a strong portfolio",
      "Proficiency in Figma and modern design workflows",
      "Ability to simplify complex flows into clear, trustworthy user experiences",
      "Strong visual design fundamentals: typography, layout, color, and hierarchy",
    ],
    preferredQualifications: [
      "Experience designing for Web3, fintech, or crypto products",
      "Motion design or illustration skills for marketing and product moments",
    ],
    technologies: ["Figma", "Design Systems", "Prototyping", "Web UX", "Brand Design"],
    benefits: [
      "Shape the visual identity of a growing Web3 platform",
      "Remote-friendly design collaboration",
      "Work across product and marketing",
      "Open to full-time, part-time, contract, or support at mid-level or senior",
    ],
    featured: true,
  },
  {
    title: "Finance Manager",
    slug: "finance-manager",
    department: "Finance",
    location: "Remote",
    remoteType: "remote",
    compensationBase: { midMin: 98000, midMax: 138000 },
    summary:
      "Lead financial planning, reporting, and operational controls for NodeMeta's Web3 marketplace, token economy, and commerce initiatives.",
    overview:
      "You'll build and run the finance function for a fast-moving Web3 company — covering budgeting, reporting, treasury coordination, vendor payments, and the operational finance needed to support marketplace and SmartCommerce growth.",
    responsibilities: [
      "Own monthly reporting, forecasting, and budget tracking across product and operations teams",
      "Manage accounts payable/receivable, vendor contracts, and payment workflows",
      "Partner with leadership on runway planning, hiring plans, and cost discipline",
      "Support treasury and token-related finance workflows with clear documentation and controls",
      "Prepare materials for audits, tax advisors, and external stakeholders as needed",
    ],
    requiredQualifications: [
      "4+ years in finance, accounting, or FP&A roles",
      "Strong Excel/spreadsheet modeling and financial reporting skills",
      "Experience with accounting tools (QuickBooks, Xero, NetSuite, or similar)",
      "Comfort working in a remote, startup-style environment with evolving processes",
    ],
    preferredQualifications: [
      "Experience in crypto, fintech, or marketplace businesses",
      "CPA, ACCA, or equivalent finance qualification",
    ],
    technologies: ["QuickBooks", "Excel", "Financial Modeling", "FP&A", "Reporting"],
    benefits: [
      "Build finance operations for a Web3 product company",
      "Remote-friendly team",
      "Cross-functional partnership with leadership",
      "Open to full-time, part-time, contract, or support at mid-level or senior",
    ],
  },
  {
    title: "Web3 Marketing Manager",
    slug: "web3-marketing-manager",
    department: "Marketing",
    location: "Remote",
    remoteType: "remote",
    compensationBase: { midMin: 92000, midMax: 132000 },
    summary:
      "Drive community growth, campaign execution, and brand awareness for NodeMeta across Web3 channels, partnerships, and product launches.",
    overview:
      "You'll lead marketing for NodeMeta's ecosystem — planning campaigns, managing community-facing content, coordinating launches, and translating product milestones into compelling stories across social, email, and partner channels.",
    responsibilities: [
      "Plan and execute marketing campaigns for marketplace, staking, and SmartCommerce launches",
      "Manage social content calendars across Twitter/X, Telegram, Discord, and other Web3 channels",
      "Coordinate with design and product on landing pages, announcements, and launch assets",
      "Track campaign performance and refine messaging based on community feedback and metrics",
      "Support partnership outreach, AMAs, and community events that grow NodeMeta's audience",
    ],
    requiredQualifications: [
      "3+ years in marketing, growth, or community roles",
      "Strong writing skills for social, email, and campaign copy",
      "Hands-on experience with Web3 community platforms and crypto-native audiences",
      "Comfort working independently in a remote, fast-moving environment",
    ],
    preferredQualifications: [
      "Prior experience marketing NFT, DeFi, or blockchain products",
      "Familiarity with analytics tools and campaign attribution",
    ],
    technologies: [
      "Twitter/X",
      "Telegram",
      "Discord",
      "Email Marketing",
      "Campaign Analytics",
    ],
    benefits: [
      "Own growth and brand storytelling for a Web3 platform",
      "Remote-friendly marketing team",
      "Work closely with product launches and community",
      "Open to full-time, part-time, contract, or support at mid-level or senior",
    ],
    featured: true,
  },
];

export function positionToJobDocument(
  position: PositionSeed,
  id: string,
): import("@/types").JobDocument {
  const compensationBands = buildCompensationBands(position.compensationBase);
  const primaryBand = getCompensationBand(compensationBands);
  const now = new Date().toISOString();

  return {
    _id: id,
    title: position.title,
    slug: position.slug,
    department: position.department,
    location: position.location,
    remoteType: position.remoteType,
    employmentType: primaryBand?.employmentType ?? "full-time",
    experienceLevel: primaryBand?.experienceLevel ?? "mid-level",
    compensationBands,
    summary: position.summary,
    overview: position.overview,
    responsibilities: position.responsibilities,
    requiredQualifications: position.requiredQualifications,
    preferredQualifications: position.preferredQualifications,
    technologies: position.technologies,
    benefits: position.benefits,
    salaryMin: primaryBand?.salaryMin,
    salaryMax: primaryBand?.salaryMax,
    salaryCurrency: primaryBand?.salaryCurrency ?? "USD",
    salaryPeriod: primaryBand?.salaryPeriod,
    status: "published",
    featured: position.featured ?? false,
    createdAt: now,
    updatedAt: now,
    publishedAt: positionPublishedAt,
  };
}
