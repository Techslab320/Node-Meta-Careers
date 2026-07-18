"use client";

import { useEffect } from "react";

function isMetaMaskNoise(value: unknown): boolean {
  if (!value) return false;
  const text =
    typeof value === "string"
      ? value
      : value instanceof Error
        ? `${value.name} ${value.message}`
        : typeof value === "object" &&
            "message" in value &&
            typeof (value as { message: unknown }).message === "string"
          ? (value as { message: string }).message
          : String(value);

  return /metamask|failed to connect to metamask|error restoring session/i.test(
    text,
  );
}

/**
 * MetaMask injects into every page and throws when it can't restore a session.
 * This site has no wallet features — swallow that noise so it doesn't fill the
 * Next.js `[browser]` terminal feed.
 */
export function SuppressWalletExtensionNoise() {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isMetaMaskNoise(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const onError = (event: ErrorEvent) => {
      if (isMetaMaskNoise(event.error) || isMetaMaskNoise(event.message)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const originalConsoleError = console.error.bind(console);
    console.error = (...args: unknown[]) => {
      if (args.some(isMetaMaskNoise)) return;
      originalConsoleError(...args);
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onError);

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onError);
      console.error = originalConsoleError;
    };
  }, []);

  return null;
}
