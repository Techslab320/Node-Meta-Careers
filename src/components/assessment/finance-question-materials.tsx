import type { ReactNode } from "react";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPct(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}%`;
}

function Panel({
  title,
  instruction,
  children,
  footer,
}: {
  title: string;
  instruction: string;
  children: ReactNode;
  footer?: string;
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-violet-500/20 bg-slate-950/70">
      <div className="border-b border-violet-500/15 px-5 py-4">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-400">{instruction}</p>
      </div>
      {children}
      {footer ? (
        <div className="border-t border-violet-500/15 px-5 py-3">
          <p className="text-xs leading-relaxed text-slate-500">{footer}</p>
        </div>
      ) : null}
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 font-medium first:px-5 last:px-5 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  className = "",
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`px-4 py-3 first:px-5 last:px-5 ${
        align === "right" ? "text-right tabular-nums" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}

/** Q2 — partial cash-flow sheet for Apr–Jun forecast */
function CashFlowForecastMaterial() {
  const rows = [
    {
      line: "Opening cash",
      apr: "$186,000",
      may: "To forecast",
      jun: "To forecast",
    },
    {
      line: "Customer collections (inflow)",
      apr: "$68,000 (confirmed)",
      may: "$55–75k (range)",
      jun: "Not estimated",
    },
    {
      line: "New investment / financing",
      apr: "$0",
      may: "Uncertain",
      jun: "Uncertain",
    },
    {
      line: "Payroll & contractors (outflow)",
      apr: "$84,700 (scheduled)",
      may: "To forecast",
      jun: "To forecast",
    },
    {
      line: "Vendors, ads, cloud (outflow)",
      apr: "$41,200 (scheduled)",
      may: "To forecast",
      jun: "To forecast",
    },
    {
      line: "Tax / legal reserves",
      apr: "$8,000",
      may: "Not set",
      jun: "Not set",
    },
    {
      line: "Closing cash",
      apr: "To forecast",
      may: "To forecast",
      jun: "To forecast",
    },
  ] as const;

  return (
    <Panel
      title="NodeMeta — 3-Month Cash-Flow Draft (Apr–Jun)"
      instruction="Use this incomplete cash-flow sheet in your answer. Explain how you would build a reliable 3-month forecast from it."
      footer="Assumptions note from founder: May revenue depends on one enterprise renewal; contractor headcount may rise again; no contingency buffer is modeled yet."
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-violet-500/15 bg-[#120d1c]/80 text-xs uppercase tracking-wide text-slate-500">
              <Th>Line item</Th>
              <Th align="right">April</Th>
              <Th align="right">May</Th>
              <Th align="right">June</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.line}
                className="border-b border-violet-500/10 text-slate-300 last:border-b-0"
              >
                <Td className="text-slate-200">{row.line}</Td>
                <Td align="right">{row.apr}</Td>
                <Td align="right">{row.may}</Td>
                <Td align="right">{row.jun}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/** Q3 — contractor payment request with weak controls */
function ContractorPaymentMaterial() {
  const fields = [
    { label: "Payee", value: "Apex Chain Labs (contractor)" },
    { label: "Amount requested", value: "$12,800 USD" },
    { label: "Work description", value: "“Dev support — March” (no task list)" },
    { label: "SOW / contract on file", value: "Missing" },
    { label: "Timesheet / deliverable proof", value: "Not attached" },
    { label: "Requested by", value: "Engineering lead (Slack message)" },
    { label: "Finance approval", value: "None yet" },
    { label: "Second approver", value: "Not required in current process" },
    { label: "Bank / wallet details", value: "New account — first time used" },
    { label: "Payment method", value: "Wire + USDT (split unclear)" },
    { label: "Due date", value: "ASAP / yesterday" },
  ] as const;

  return (
    <Panel
      title="Sample Contractor Payment Request"
      instruction="Review this payment request, then describe what controls should exist before approval."
      footer="Current practice: engineering can ping finance in Slack and ask for same-day payment."
    >
      <dl className="divide-y divide-violet-500/10">
        {fields.map((field) => (
          <div
            key={field.label}
            className="grid gap-1 px-5 py-3 sm:grid-cols-[220px_1fr] sm:gap-4"
          >
            <dt className="text-xs uppercase tracking-wide text-slate-500">{field.label}</dt>
            <dd className="text-sm text-slate-200">{field.value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

/** Q4 — department cost growth for cost-control recommendations */
function CostControlMaterial() {
  const rows = [
    { dept: "Engineering contractors", feb: 27400, mar: 39200 },
    { dept: "Marketing & community ads", feb: 9200, mar: 21000 },
    { dept: "Cloud & infrastructure", feb: 7800, mar: 12400 },
    { dept: "Software subscriptions", feb: 3100, mar: 5600 },
    { dept: "Travel & offsites", feb: 1400, mar: 7800 },
    { dept: "Miscellaneous / uncategorized", feb: 6100, mar: 11500 },
  ].map((row) => ({
    ...row,
    mom: ((row.mar - row.feb) / row.feb) * 100,
  }));

  return (
    <Panel
      title="NodeMeta — Department Cost Growth (Feb → Mar)"
      instruction="Use this growth table to recommend practical cost-control actions for a growing Web3 company."
      footer="Context: headcount is mostly remote; several vendors renew monthly with no owner review; marketing has no weekly spend cap."
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-violet-500/15 bg-[#120d1c]/80 text-xs uppercase tracking-wide text-slate-500">
              <Th>Department / category</Th>
              <Th align="right">February</Th>
              <Th align="right">March</Th>
              <Th align="right">MoM change</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.dept}
                className="border-b border-violet-500/10 text-slate-300 last:border-b-0"
              >
                <Td className="text-slate-200">{row.dept}</Td>
                <Td align="right">{formatUsd(row.feb)}</Td>
                <Td align="right">{formatUsd(row.mar)}</Td>
                <Td
                  align="right"
                  className={row.mom >= 50 ? "text-rose-300" : "text-amber-200"}
                >
                  {formatPct(row.mom)}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/** Q5 — runway and burn inputs for leadership reporting */
function RunwayBurnMaterial() {
  const metrics = [
    { label: "Cash in bank (today)", value: formatUsd(186000) },
    { label: "Average monthly burn (last 3 months)", value: formatUsd(98500) },
    { label: "Last month burn (March)", value: formatUsd(151200) },
    { label: "Committed outflows next 30 days", value: formatUsd(112000) },
    { label: "Confirmed inflows next 30 days", value: formatUsd(68000) },
    { label: "Simple runway (cash ÷ avg burn)", value: "~1.9 months" },
    { label: "Runway if March burn continues", value: "~1.2 months" },
  ] as const;

  return (
    <Panel
      title="NodeMeta — Runway & Burn Snapshot"
      instruction="Use these figures to explain how you would report runway and burn rate clearly to leadership."
      footer="Leadership has asked for a short weekly update, not a full accounting memo."
    >
      <dl className="divide-y divide-violet-500/10">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="grid gap-1 px-5 py-3 sm:grid-cols-[280px_1fr] sm:gap-4"
          >
            <dt className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</dt>
            <dd className="text-sm font-medium tabular-nums text-white">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

/** Q6 — remote finance documentation tracker with gaps */
function DocumentationMaterial() {
  const rows = [
    {
      doc: "Contractor SOWs",
      owner: "Ops",
      location: "Personal Drive (unshared)",
      status: "3 of 11 missing",
    },
    {
      doc: "Vendor invoices (March)",
      owner: "Finance inbox",
      location: "Email only",
      status: "7 unpaid / not filed",
    },
    {
      doc: "Payroll reports",
      owner: "HR",
      location: "Notion private page",
      status: "Current",
    },
    {
      doc: "Bank statements",
      owner: "Founder",
      location: "Local laptop",
      status: "Feb–Mar not uploaded",
    },
    {
      doc: "Tax / entity docs",
      owner: "External counsel",
      location: "Unknown",
      status: "Access expired",
    },
    {
      doc: "Expense receipts",
      owner: "Team",
      location: "Scattered Slack uploads",
      status: "Incomplete",
    },
  ] as const;

  return (
    <Panel
      title="Remote Finance Document Tracker"
      instruction="Use this tracker to describe how you would manage finance documentation for a remote team."
      footer="Team is distributed across 4 time zones; no single source of truth folder exists today."
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-violet-500/15 bg-[#120d1c]/80 text-xs uppercase tracking-wide text-slate-500">
              <Th>Document set</Th>
              <Th>Owner</Th>
              <Th>Location</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.doc}
                className="border-b border-violet-500/10 text-slate-300 last:border-b-0"
              >
                <Td className="text-slate-200">{row.doc}</Td>
                <Td>{row.owner}</Td>
                <Td>{row.location}</Td>
                <Td className="text-amber-200">{row.status}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/** Q8 — mixed transactions blurring expense types */
function BudgetSeparationMaterial() {
  const rows = [
    {
      date: "Mar 03",
      desc: "AWS invoice — production + personal staging mix",
      amount: 4200,
      codedAs: "Cloud",
      note: "No project tag",
    },
    {
      date: "Mar 07",
      desc: "USDT payment to Apex Chain Labs",
      amount: 12800,
      codedAs: "Contractor",
      note: "Also charged to Product launch budget",
    },
    {
      date: "Mar 12",
      desc: "Founder’s laptop + accessories",
      amount: 3100,
      codedAs: "Ops expense",
      note: "Could be asset / owner draw",
    },
    {
      date: "Mar 18",
      desc: "Telegram ads + community bounty pool",
      amount: 9500,
      codedAs: "Marketing",
      note: "Part paid from project wallet",
    },
    {
      date: "Mar 22",
      desc: "Legal retainer (entity + token review)",
      amount: 8200,
      codedAs: "Legal",
      note: "One invoice, two purposes",
    },
    {
      date: "Mar 28",
      desc: "Card charge: “TOOLS / MISC”",
      amount: 2400,
      codedAs: "Miscellaneous",
      note: "No receipt, no owner",
    },
  ] as const;

  return (
    <Panel
      title="Mixed Transaction Sample (March)"
      instruction="Review these transactions, then explain how you would separate business expenses, vendor payments, and project budgets."
      footer="Today everything posts to one operating account and one spreadsheet tab."
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-violet-500/15 bg-[#120d1c]/80 text-xs uppercase tracking-wide text-slate-500">
              <Th>Date</Th>
              <Th>Description</Th>
              <Th align="right">Amount</Th>
              <Th>Coded as</Th>
              <Th>Issue</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.date}-${row.desc}`}
                className="border-b border-violet-500/10 text-slate-300 last:border-b-0"
              >
                <Td className="whitespace-nowrap text-slate-200">{row.date}</Td>
                <Td>{row.desc}</Td>
                <Td align="right">{formatUsd(row.amount)}</Td>
                <Td>{row.codedAs}</Td>
                <Td className="text-amber-200">{row.note}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/** Q9 — dense technical risk text to rewrite simply */
function RiskCommunicationMaterial() {
  return (
    <Panel
      title="Internal Risk Note (needs clearer communication)"
      instruction="Rewrite or explain this risk for leadership in plain language — without overcomplicating the message."
    >
      <div className="space-y-3 px-5 py-4 text-sm leading-relaxed text-slate-300">
        <p>
          Given the March operating cash burn of approximately $151.2k against trailing
          three-month average burn of ~$98.5k, and confirmed forward collections of only $68k
          versus committed disbursements of $112k over the next 30 days, the implied liquidity
          coverage under a continuation of March run-rate is ~1.2 months, while the smoothed
          average-burn runway remains ~1.9 months; simultaneously, contractor concentration risk
          has increased (Apex + unnamed freelancers &gt; 25% of opex), marketing CAC attribution is
          incomplete, and miscellaneous uncategorized card spend rose 88% MoM, creating both
          forecast variance risk and control risk around unauthorized / undocumented outflows.
        </p>
        <p className="text-xs text-slate-500">
          Audience: CEO + product lead (non-finance). They want: what matters, why, and what to do
          next week.
        </p>
      </div>
    </Panel>
  );
}

/** Q10 — current-state brief for 30-day action plan */
function ActionPlanBriefMaterial() {
  const items = [
    {
      label: "Cash position",
      value: "$186k in bank; ~1.2–1.9 months runway depending on burn assumption",
    },
    {
      label: "Top cost pressures",
      value: "Contractors, marketing ads, cloud, miscellaneous card spend",
    },
    {
      label: "Process gaps",
      value: "Ad-hoc contractor approvals, no SOW check, weak document ownership",
    },
    {
      label: "Reporting gaps",
      value: "No weekly runway update; budgets mixed across projects and vendors",
    },
    {
      label: "Near-term obligations",
      value: "$112k committed outflows in 30 days; $68k confirmed inflows",
    },
    {
      label: "Leadership ask",
      value: "Stabilize cash visibility and put basic finance controls in place within 30 days",
    },
  ] as const;

  return (
    <Panel
      title="NodeMeta — Current-State Brief (for your 30-day plan)"
      instruction="Use this brief to provide a short finance action plan for NodeMeta’s next 30 days."
      footer="Keep the plan practical: owners, weekly checkpoints, and what improves first."
    >
      <dl className="divide-y divide-violet-500/10">
        {items.map((item) => (
          <div
            key={item.label}
            className="grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr] sm:gap-4"
          >
            <dt className="text-xs uppercase tracking-wide text-slate-500">{item.label}</dt>
            <dd className="text-sm text-slate-200">{item.value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

/** Returns supporting material for finance questions 2–6 and 8–10. Q1/Q7 stay on existing UI. */
export function getFinanceQuestionMaterial(questionNumber: number): ReactNode {
  switch (Number(questionNumber)) {
    case 2:
      return <CashFlowForecastMaterial />;
    case 3:
      return <ContractorPaymentMaterial />;
    case 4:
      return <CostControlMaterial />;
    case 5:
      return <RunwayBurnMaterial />;
    case 6:
      return <DocumentationMaterial />;
    case 8:
      return <BudgetSeparationMaterial />;
    case 9:
      return <RiskCommunicationMaterial />;
    case 10:
      return <ActionPlanBriefMaterial />;
    default:
      return null;
  }
}
