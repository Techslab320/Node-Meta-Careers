import { siteConfig } from "@/config/site";

const main = siteConfig.mainWebsiteUrl.replace(/\/$/, "");

export const footerEcosystemLinks = [
  { label: "Community", href: `${main}/community` },
  { label: "Technology", href: `${main}/technology` },
  { label: "Tokenomics", href: `${main}/tokenomics` },
  { label: "Token Reserve Strategy", href: `${main}/token-reserve-strategy` },
  { label: "10 Year Halving Model", href: `${main}/10-year-halving-model` },
  { label: "Reserve and Burn Allocation", href: `${main}/reserve-and-burn-allocation` },
  { label: "Whitepaper", href: `${main}/whitepaper` },
] as const;

export const footerCompanyLinks = [
  { label: "Terms & Conditions", href: `${main}/terms-and-conditions` },
  { label: "Data Deletion", href: `${main}/data-deletion-request` },
  { label: "Privacy Policy", href: `${main}/privacy-policy` },
  { label: "Not an Investment", href: `${main}/not-an-investment` },
  { label: "Features", href: `${main}/features` },
  { label: "Roadmap", href: `${main}/roadmap` },
  { label: "Token Migration", href: `${main}/migrate` },
] as const;

export const footerSocialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/nodemeta",
    icon: "facebook",
  },
  {
    label: "Reddit",
    href: "https://www.reddit.com/user/NodeMeta/",
    icon: "reddit",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@NodeMeta",
    icon: "youtube",
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/NodeMeta64329",
    icon: "x",
  },
  {
    label: "Telegram",
    href: "https://t.me/nodemetabusiness",
    icon: "telegram",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/nodemeta/about/",
    icon: "linkedin",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/nodemetabusiness/",
    icon: "pinterest",
  },
  {
    label: "Discord",
    href: "https://discordapp.com/users/1399260731949453352",
    icon: "discord",
  },
] as const;

export const footerContactEmail = "careers@node-meta.careers";
