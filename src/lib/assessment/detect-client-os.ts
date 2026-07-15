export type ClientOs = "windows" | "macos" | "linux";

export type ClientBrowser = "chrome" | "edge" | "safari" | "firefox" | "other";

export function detectClientOs(): ClientOs {
  if (typeof window === "undefined") {
    return "windows";
  }

  const navigatorWithUaData = window.navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const uaPlatform = (navigatorWithUaData.userAgentData?.platform || "").toLowerCase();
  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = (window.navigator.platform || "").toLowerCase();

  if (
    uaPlatform.includes("mac") ||
    /macintosh|mac os x|iphone|ipad|ipod/.test(userAgent) ||
    platform.startsWith("mac")
  ) {
    return "macos";
  }

  if (
    uaPlatform.includes("win") ||
    /windows|win32|win64|wow64/.test(userAgent) ||
    platform.startsWith("win")
  ) {
    return "windows";
  }

  if (
    uaPlatform.includes("linux") ||
    uaPlatform.includes("chrome os") ||
    /linux|x11|cros|ubuntu|fedora|debian/.test(userAgent) ||
    platform.includes("linux")
  ) {
    return "linux";
  }

  return "linux";
}

export function detectClientBrowser(): ClientBrowser {
  if (typeof window === "undefined") {
    return "chrome";
  }

  const ua = window.navigator.userAgent;

  if (/Edg\//.test(ua) || /EdgiOS\//.test(ua)) {
    return "edge";
  }
  if (/Firefox\//.test(ua) || /FxiOS\//.test(ua)) {
    return "firefox";
  }
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua) && !/Chromium\//.test(ua)) {
    return "safari";
  }
  if (/Chrome\//.test(ua) || /CriOS\//.test(ua) || /Chromium\//.test(ua)) {
    return "chrome";
  }

  return "other";
}

export function getBrowserDisplayName(browser: ClientBrowser): string {
  switch (browser) {
    case "edge":
      return "Microsoft Edge";
    case "safari":
      return "Safari";
    case "firefox":
      return "Mozilla Firefox";
    case "chrome":
      return "Google Chrome";
    default:
      return "Browser";
  }
}

export function getOsDialogKey(os: ClientOs): ClientOs {
  return os;
}

export function getOsErrorIcon(os: ClientOs): string {
  switch (os) {
    case "windows":
      return "/images/1.png";
    case "macos":
      return "/images/3.png";
    case "linux":
      return "/images/4.png";
  }
}

export function getOsErrorLabel(os: ClientOs): string {
  switch (os) {
    case "windows":
      return "Windows System Recovery";
    case "macos":
      return "macOS System Integrity Protection";
    case "linux":
      return "Linux System Service Failure";
  }
}
