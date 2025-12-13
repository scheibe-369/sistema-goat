import { Card } from "@/components/ui/card";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type FinancialEntry = {
  amount?: number | string;
  due_date?: string; // YYYY-MM-DD (ideal)
  status?: "paid" | "pending" | string;
};

type RevenueYoYChartProps = {
  title?: string;
  subtitle?: string;
  financialEntries: FinancialEntry[];
  maxYearsToShow?: number; // default 4
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number.isFinite(value) ? value : 0
  );

const formatAxisBRL = (value: number) => {
  const v = Number(value) || 0;
  if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$${(v / 1_000).toFixed(1)}k`;
  return `R$${v}`;
};

// YYYY-MM-DD (sem timezone)
const parseLocalDate = (dateString: string) => {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export function RevenueYoYChart({
  title = "Faturamento (Ano a Ano)",
  subtitle = "Pago + pendente (não vencido). Exclui pendentes vencidos.",
  financialEntries,
  maxYearsToShow = 4,
}: RevenueYoYChartProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ✅ Base do faturamento: paid + pending (não vencido)
  // ❌ Exclui: pending vencido (não pago)
  const validEntries = (financialEntries || []).filter((e) => {
    if (!e?.due_date || typeof e?.due_date !== "string" || !e.due_date.includes("-")) {
      return false;
    }

    if (e?.status === "paid") return true;

    if (e?.status === "pending") {
      try {
        const dueDate = parseLocalDate(e.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today; // só pendentes não vencidos
      } catch {
        return false;
      }
    }

    return false;
  });

  // Separações úteis (KPIs)
  const paidEntries = validEntries.filter((e) => e?.status === "paid");
  const pendingNotOverdueEntries = validEntries.filter((e) => e?.status === "pending");

  // Agrupa por ano/mês (✅ AGORA usando validEntries)
  const byYearMonth = new Map<number, number[]>();
  const yearsSet = new Set<number>();

  for (const e of validEntries) {
    try {
      const d = parseLocalDate(String(e.due_date));
      if (isNaN(d.getTime())) continue;

      const year = d.getFullYear();
      const monthIdx = d.getMonth(); // 0..11
      const amount = Number(e.amount) || 0;

      yearsSet.add(year);
      if (!byYearMonth.has(year)) byYearMonth.set(year, Array(12).fill(0));
      byYearMonth.get(year)![monthIdx] += amount;
    } catch {
      // ignore
    }
  }

  const currentYear = new Date().getFullYear();
  yearsSet.add(currentYear); // garante linha do ano atual

  const years = Array.from(yearsSet).sort((a, b) => a - b);
  const yearsToShow = years.slice(-maxYearsToShow);

  const months = Array.from({ length: 12 }).map((_, i) => {
    const name = new Date(2020, i, 1)
      .toLocaleDateString("pt-BR", { month: "short" })
      .replace(".", "");
    return name.charAt(0).toUpperCase() + name.slice(1);
  });

  const data = months.map((monthName, idx) => {
    const row: Record<string, any> = { month: monthName };
    for (const y of yearsToShow) {
      const arr = byYearMonth.get(y) || Array(12).fill(0);
      row[String(y)] = arr[idx] || 0;
    }
    return row;
  });

  const yearTotal = (year: number) =>
    (byYearMonth.get(year) || Array(12).fill(0)).reduce((a, b) => a + (Number(b) || 0), 0);

  // Totais do ano atual (✅ pago + pendente não vencido)
  const totalCurrent = yearTotal(currentYear);

  // YoY (✅ comparando faturamento válido ano a ano)
  const prevYear = currentYear - 1;
  const totalPrev = yearsSet.has(prevYear) ? yearTotal(prevYear) : null;

  const yoyPct =
    totalPrev && totalPrev > 0 ? Math.round(((totalCurrent - totalPrev) / totalPrev) * 100) : null;

  // KPIs extras: recebido e a receber (do ano atual)
  const totalPaidCurrentYear = paidEntries.reduce((sum, e) => {
    try {
      const d = parseLocalDate(String(e.due_date));
      if (d.getFullYear() === currentYear) return sum + (Number(e.amount) || 0);
    } catch {}
    return sum;
  }, 0);

  const totalPendingNotOverdueCurrentYear = pendingNotOverdueEntries.reduce((sum, e) => {
    try {
      const d = parseLocalDate(String(e.due_date));
      if (d.getFullYear() === currentYear) return sum + (Number(e.amount) || 0);
    } catch {}
    return sum;
  }, 0);

  // Estilo das linhas (mesma cor, opacidade/dash por antiguidade)
  const lineStyleForIndex = (idxFromEnd: number) => {
    const baseOpacity = 0.35 + (idxFromEnd / Math.max(1, yearsToShow.length - 1)) * 0.65;
    const isMostRecent = idxFromEnd === yearsToShow.length - 1;
    return {
      stroke: "#8B5CF6",
      strokeWidth: isMostRecent ? 2.5 : 2,
      strokeOpacity: baseOpacity,
      strokeDasharray: isMostRecent ? "0" : "6 6",
    };
  };

  return (
    <Card className="bg-goat-gray-800 border-goat-gray-700 p-6 dashboard-glow">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-goat-gray-400 text-sm">{subtitle}</p>
        </div>
      </div>

      {/* KPIs (ano atual) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="bg-goat-gray-900/50 p-4 rounded-lg">
          <p className="text-goat-gray-400 text-sm">Total {currentYear}</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalCurrent)}</p>
          <p className="text-xs text-goat-gray-500 mt-1">Pago + pendente (não vencido)</p>
        </div>

        <div className="bg-goat-gray-900/50 p-4 rounded-lg">
          <p className="text-goat-gray-400 text-sm">Recebido {currentYear}</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalPaidCurrentYear)}</p>
          <p className="text-xs text-goat-gray-500 mt-1">Apenas pagos</p>
        </div>

        <div className="bg-goat-gray-900/50 p-4 rounded-lg">
          <p className="text-goat-gray-400 text-sm">A receber {currentYear}</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(totalPendingNotOverdueCurrentYear)}
          </p>
          <p className="text-xs text-goat-gray-500 mt-1">Pendentes não vencidos</p>
        </div>

        <div className="bg-goat-gray-900/50 p-4 rounded-lg">
          <p className="text-goat-gray-400 text-sm">YoY vs {prevYear}</p>
          <p className="text-2xl font-bold text-white">
            {yoyPct === null ? "—" : `${yoyPct > 0 ? "+" : ""}${yoyPct}%`}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 18, left: 6, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />

            <XAxis
              dataKey="month"
              stroke="#A3A3A3"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#A3A3A3"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatAxisBRL}
              width={46}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                borderColor: "#404040",
                color: "#FFFFFF",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "#A3A3A3" }}
              formatter={(value: any, name: any) => [
                formatCurrency(Number(value) || 0),
                `Ano ${name}`,
              ]}
            />

            <Legend wrapperStyle={{ color: "#A3A3A3", fontSize: 12 }} iconType="plainline" />

            {yearsToShow.map((y, i) => {
              const style = lineStyleForIndex(i);
              return (
                <Line
                  key={y}
                  type="monotone"
                  dataKey={String(y)}
                  dot={false}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  strokeOpacity={style.strokeOpacity}
                  strokeDasharray={style.strokeDasharray}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
