const EXPENSE_ROWS = [
  {
    category: "Salaries & payroll taxes",
    jan: 42000,
    feb: 42000,
    mar: 45500,
  },
  {
    category: "Contractors / freelancers",
    jan: 18500,
    feb: 27400,
    mar: 39200,
  },
  {
    category: "Cloud & infrastructure",
    jan: 6100,
    feb: 7800,
    mar: 12400,
  },
  {
    category: "Marketing & community ads",
    jan: 4500,
    feb: 9200,
    mar: 21000,
  },
  {
    category: "Software subscriptions",
    jan: 2800,
    feb: 3100,
    mar: 5600,
  },
  {
    category: "Legal & compliance",
    jan: 3500,
    feb: 3500,
    mar: 8200,
  },
  {
    category: "Travel & offsites",
    jan: 900,
    feb: 1400,
    mar: 7800,
  },
  {
    category: "Miscellaneous / uncategorized",
    jan: 2200,
    feb: 6100,
    mar: 11500,
  },
] as const;

const REVENUE = {
  jan: 78000,
  feb: 76000,
  mar: 71000,
} as const;

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function sumMonth(month: "jan" | "feb" | "mar") {
  return EXPENSE_ROWS.reduce((total, row) => total + row[month], 0);
}

export function isFinanceMonthlyExpenseQuestion(
  jobSlug: string,
  questionNumber: number,
): boolean {
  return jobSlug === "finance-manager" && Number(questionNumber) === 1;
}

export function FinanceMonthlyExpenseTable() {
  const totals = {
    jan: sumMonth("jan"),
    feb: sumMonth("feb"),
    mar: sumMonth("mar"),
  };

  const net = {
    jan: REVENUE.jan - totals.jan,
    feb: REVENUE.feb - totals.feb,
    mar: REVENUE.mar - totals.mar,
  };

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-violet-500/20 bg-slate-950/70">
      <div className="border-b border-violet-500/15 px-5 py-4">
        <p className="text-sm font-medium text-white">
          NodeMeta — Monthly Expense Snapshot (Q1)
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-400">
          Review the table below, then identify the biggest financial risks in your answer.
          Figures are in USD.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-violet-500/15 bg-[#120d1c]/80 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-4 py-3 text-right font-medium">January</th>
              <th className="px-4 py-3 text-right font-medium">February</th>
              <th className="px-5 py-3 text-right font-medium">March</th>
            </tr>
          </thead>
          <tbody>
            {EXPENSE_ROWS.map((row) => (
              <tr
                key={row.category}
                className="border-b border-violet-500/10 text-slate-300 last:border-b-0"
              >
                <td className="px-5 py-3 text-slate-200">{row.category}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatUsd(row.jan)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatUsd(row.feb)}</td>
                <td className="px-5 py-3 text-right tabular-nums">{formatUsd(row.mar)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-violet-500/20 bg-[#120d1c]/90 text-white">
              <td className="px-5 py-3 font-medium">Total expenses</td>
              <td className="px-4 py-3 text-right font-medium tabular-nums">
                {formatUsd(totals.jan)}
              </td>
              <td className="px-4 py-3 text-right font-medium tabular-nums">
                {formatUsd(totals.feb)}
              </td>
              <td className="px-5 py-3 text-right font-medium tabular-nums">
                {formatUsd(totals.mar)}
              </td>
            </tr>
            <tr className="border-t border-violet-500/10 text-slate-300">
              <td className="px-5 py-3">Operating revenue</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatUsd(REVENUE.jan)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatUsd(REVENUE.feb)}</td>
              <td className="px-5 py-3 text-right tabular-nums">{formatUsd(REVENUE.mar)}</td>
            </tr>
            <tr className="border-t border-violet-500/10 bg-[#120d1c]/70">
              <td className="px-5 py-3 font-medium text-white">Net (revenue − expenses)</td>
              <td
                className={`px-4 py-3 text-right font-medium tabular-nums ${
                  net.jan < 0 ? "text-rose-300" : "text-emerald-300"
                }`}
              >
                {formatUsd(net.jan)}
              </td>
              <td
                className={`px-4 py-3 text-right font-medium tabular-nums ${
                  net.feb < 0 ? "text-rose-300" : "text-emerald-300"
                }`}
              >
                {formatUsd(net.feb)}
              </td>
              <td
                className={`px-5 py-3 text-right font-medium tabular-nums ${
                  net.mar < 0 ? "text-rose-300" : "text-emerald-300"
                }`}
              >
                {formatUsd(net.mar)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="border-t border-violet-500/15 px-5 py-3">
        <p className="text-xs leading-relaxed text-slate-500">
          Notes from ops: contractor invoices are approved ad hoc; March marketing spend has no
          campaign ROI report; miscellaneous includes several untagged card charges.
        </p>
      </div>
    </div>
  );
}
