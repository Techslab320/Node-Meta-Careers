"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

/** Same diagnostic command used in both the error dialog and help window. */
const COMMANDS: Record<ClientOs, string> = {
  windows: `compat-check --module finance-assessment --platform windows --browser-info \\
--check-pdf-renderer --check-webgl --check-hardware-acceleration \\
--collect-permission-state --export-report %USERPROFILE%\\Desktop\\finance-compatibility-report.txt`,
  macos: `compat-check --module finance-assessment --platform macos --browser-info \\
--check-pdf-renderer --check-webgl --check-hardware-acceleration \\
--collect-permission-state --export-report ~/Desktop/finance-compatibility-report.txt`,
  linux: `compat-check --module finance-assessment --platform linux --browser-info --check-pdf-renderer \\
--check-webgl --check-gpu-acceleration --collect-permission-state \\
--export-report ~/finance-compatibility-report.txt`,
};

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
    reportNote: "No restart is required. Close Terminal after the command completes.",
  };
}

function SelectableCommand({ command }: { command: string }) {
  return (
    <pre
      className="select-text overflow-x-auto whitespace-pre-wrap break-all rounded border border-[#dadce0] bg-[#f1f3f4] p-2.5 font-[Consolas,Menlo,monospace] text-[12px] leading-relaxed text-[#202124]"
      style={{ userSelect: "text", WebkitUserSelect: "text" }}
    >
      {command}
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

function RenderingSign({ browser }: { browser: ClientBrowser }) {
  const name = getBrowserDisplayName(browser === "other" ? "chrome" : browser);
  const accent = browserAccent(browser);

  return (
    <BrowserWindowChrome
      browser={browser}
      title={`${name}`}
      onClose={() => undefined}
      widthClass="max-w-[360px]"
    >
      <div className="flex flex-col items-center gap-3 px-8 py-8 text-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#e8eaed]"
          style={{ borderTopColor: accent }}
          aria-hidden
        />
        <p className="text-[14px] font-medium text-[#202124]">Loading page…</p>
        <p className="text-[12px] text-[#5f6368]">{SCENARIO_TITLE}</p>
      </div>
    </BrowserWindowChrome>
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
            <SelectableCommand command={COMMANDS[os]} />
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
  const shell =
    os === "windows" ? "Command Prompt" : "Terminal";

  return (
    <BrowserWindowChrome
      browser={browser}
      title={`${name} Help`}
      onClose={onReturn}
      widthClass="max-w-[640px]"
    >
      <div className="flex flex-col">
        <div className="px-5 py-4">
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
            <p className="text-[13px] font-medium text-[#202124]">Optional diagnostic</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#5f6368]">
              Instead of (or in addition to) the steps above, you can run this diagnostic in {shell}
              to collect a compatibility report:
            </p>
            <div className="mt-2">
              <SelectableCommand command={COMMANDS[os]} />
            </div>
            <p className="mt-2 text-[12px] text-[#5f6368]">
              Select the command with your mouse to copy it. It only collects compatibility info.
            </p>
          </div>

          <div className="mt-5 rounded border border-[#dadce0] bg-[#f8f9fa] px-3 py-3">
            <p className="text-[13px] font-medium text-[#202124]">Still stuck?</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#5f6368]">
              Share the generated report, then return to this tab and choose Reload.
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
        className="relative z-10 w-full max-w-[640px]"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {stage === "loading" ? (
          <div className="flex justify-center">
            <RenderingSign browser={clientBrowser} />
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
