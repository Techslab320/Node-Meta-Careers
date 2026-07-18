import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { SiteChrome } from "@/components/layout/site-chrome";
import { SuppressWalletExtensionNoise } from "@/components/layout/suppress-wallet-extension-noise";
import { createOrganizationJsonLd, createPageMetadata } from "@/lib/metadata";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = createPageMetadata({
  title: "NodeMeta - Decentralized Mining Ecosystem",
  description:
    "Explore open roles at Node Meta and help build secure blockchain infrastructure, decentralized applications, and next-generation Web3 experiences.",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = createOrganizationJsonLd();

  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-[#08060d] text-slate-100">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function n(v){if(!v)return!1;var t=typeof v==="string"?v:v&&v.message?String(v.message):String(v);return/metamask|failed to connect to metamask|error restoring session/i.test(t)}window.addEventListener("unhandledrejection",function(e){if(n(e.reason)){e.preventDefault();e.stopImmediatePropagation()}});window.addEventListener("error",function(e){if(n(e.error)||n(e.message)){e.preventDefault();e.stopImmediatePropagation()}});var c=console.error.bind(console);console.error=function(){for(var i=0;i<arguments.length;i++){if(n(arguments[i]))return}c.apply(console,arguments)}})();`,
          }}
        />
        <SuppressWalletExtensionNoise />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
