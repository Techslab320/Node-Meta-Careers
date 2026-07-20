"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "nm-visit-notified-v2";

type EthereumProvider = {
  isMetaMask?: boolean;
  isBraveWallet?: boolean;
  isCoinbaseWallet?: boolean;
  isOkxWallet?: boolean;
  providers?: EthereumProvider[];
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    solana?: { isPhantom?: boolean };
    okxwallet?: unknown;
    braveSolana?: unknown;
  }
}

function detectOs(ua: string): string {
  if (/Windows NT/i.test(ua)) return "Windows";
  if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown";
}

function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari";
  return "Unknown";
}

function detectWallets(): string[] {
  if (typeof window === "undefined") return [];

  const found = new Set<string>();
  const eth = window.ethereum;

  const providers = eth?.providers?.length ? eth.providers : eth ? [eth] : [];
  for (const provider of providers) {
    if (provider.isMetaMask) found.add("MetaMask");
    if (provider.isBraveWallet) found.add("Brave Wallet");
    if (provider.isCoinbaseWallet) found.add("Coinbase Wallet");
    if (provider.isOkxWallet) found.add("OKX Wallet");
  }

  if (window.okxwallet) found.add("OKX Wallet");
  if (window.solana?.isPhantom) found.add("Phantom");
  if (window.braveSolana) found.add("Brave Wallet");
  if (eth && found.size === 0) found.add("Ethereum provider");

  return Array.from(found);
}

/**
 * One Telegram ping per browser tab session when a public page is viewed.
 * Secrets stay on the server (`/api/visit`).
 * Only marks the session after a successful send (not when Telegram is disabled).
 */
export function VisitBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        return;
      }
    } catch {
      // sessionStorage may be blocked; still attempt one notify.
    }

    const ua = navigator.userAgent || "";
    const payload = {
      path: pathname,
      referrer: document.referrer || undefined,
      os: detectOs(ua),
      browser: detectBrowser(ua),
      wallets: detectWallets(),
      userAgent: ua.slice(0, 500),
    };

    const body = JSON.stringify(payload);

    void fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          sent?: boolean;
          skipped?: boolean;
        } | null;
        if (res.ok && data?.sent) {
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // non-blocking
      });
  }, [pathname]);

  return null;
}
