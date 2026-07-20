const jobDescriptionPdfBySlug: Record<string, string> = {
  designer: "/upload/NodeMeta_Product_Designer_UIUX_Designer_JD.pdf",
  "finance-manager": "/upload/NodeMeta_Finance_Manager_JD.pdf",
  "web3-marketing-manager": "/upload/NodeMeta_Web3_Marketing_Manager_JD.pdf",
  "blockchain-smart-contract-developer": "/upload/Solidity Engineer JD.pdf",
  "backend-engineer-blockchain-indexing-marketplace":
    "/upload/Backend Engineer JD.pdf",
  "frontend-engineer-web3": "/upload/Frontend Engineer JD.pdf",
  "payments-commerce-backend-engineer-smartcommerce":
    "/upload/Payment Engineer JD.pdf",
};

export function getJobDescriptionPdfUrl(slug: string): string | null {
  const path = jobDescriptionPdfBySlug[slug];
  if (!path) return null;
  // Encode filename spaces while keeping path separators.
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}
