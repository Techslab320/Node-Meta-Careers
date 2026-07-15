const jobDescriptionPdfBySlug: Record<string, string> = {
  designer: "/upload/NodeMeta_Product_Designer_UIUX_Designer_JD.pdf",
  "finance-manager": "/upload/NodeMeta_Finance_Manager_JD.pdf",
  "web3-marketing-manager": "/upload/NodeMeta_Web3_Marketing_Manager_JD.pdf",
};

export function getJobDescriptionPdfUrl(slug: string): string | null {
  return jobDescriptionPdfBySlug[slug] ?? null;
}
