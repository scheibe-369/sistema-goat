"use client";

import { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { Stage } from "@/hooks/useStages";
import type { Lead } from "@/hooks/useLeads";

type FunnelRow = {
  id: string;
  name: string;
  value: number;
};

const formatPct = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 }).format(v);

export function SalesFunnelHorizontalChart({
  stages,
  leads,
  title = "Funil de Vendas",
  description = "Distribuição de leads por etapa (funil horizontal).",
}: {
  stages: Stage[];
  leads: Lead[];
  title?: string;
  description?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const data = useMemo<FunnelRow[]>(() => {
    const counts = new Map<string, number>();
    for (const l of leads) counts.set(l.stage, (counts.get(l.stage) ?? 0) + 1);

    const isFollowUp = (name: string) => {
      const n = name.toLowerCase().replace(/\s/g, "");
      return n.startsWith("follow-up") || n.startsWith("followup");
    };

    const followStages = stages.filter((s) => isFollowUp(s.name));
    const mainStages = stages.filter((s) => !isFollowUp(s.name));

    const rows: FunnelRow[] = mainStages.map((s) => ({
      id: s.id,
      name: s.name,
      value: counts.get(s.id) ?? 0,
    }));

    if (followStages.length > 0) {
      const followCount = followStages.reduce((acc, s) => acc + (counts.get(s.id) ?? 0), 0);
      rows.push({ id: "followup-group", name: "Follow-up", value: followCount });
    }

    // só etapas com leads (igual você comentou no print)
    return rows.filter((r) => r.value > 0);
  }, [stages, leads]);

  const totalLeads = useMemo(() => data.reduce((a, b) => a + b.value, 0), [data]);
  const stagesWithLeads = data.length;

  const first = data[0]?.value ?? 0;
  const last = data[data.length - 1]?.value ?? 0;
  const conversion = first > 0 ? last / first : 0;

  // ====== SVG layout ======
  const W = 1200;
  const H = 280;
  const padL = 28;
  const padR = 28;
  const padTop = 18;
  const padBottom = 34; // espaço p/ “labels”
  const innerW = W - padL - padR;
  const innerH = H - padTop - padBottom;

  const maxVal = Math.max(1, ...data.map((d) => d.value));
  const minSegH = 34;

  const scaleH = (v: number) => {
    const t = v / maxVal;
    return Math.max(minSegH, innerH * (0.25 + 0.75 * t)); // sempre “encorpado”
  };

  // tooltip (mesmo look do recharts)
  const [tip, setTip] = useState<{
    show: boolean;
    x: number;
    y: number;
    name: string;
    value: number;
  }>({ show: false, x: 0, y: 0, name: "", value: 0 });

  const showTip = (e: React.MouseEvent, row: FunnelRow) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;

    // posição relativa ao container
    let x = e.clientX - rect.left + 12;
    let y = e.clientY - rect.top + 12;

    // “clamp” simples pra não sair do card
    x = Math.max(8, Math.min(x, rect.width - 220));
    y = Math.max(8, Math.min(y, rect.height - 70));

    setTip({ show: true, x, y, name: row.name, value: row.value });
  };

  const hideTip = () => setTip((p) => ({ ...p, show: false }));

  return (
    <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-goat-purple" />
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <p className="text-goat-gray-400 text-sm">{description}</p>
        </div>
        <div className="text-goat-gray-400 text-sm whitespace-nowrap">
          <span className="text-white font-semibold">{totalLeads}</span> lead(s)
        </div>
      </div>

      {/* KPIs (mesmo padrão do ProjectionChart) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-goat-gray-900/50 p-4 rounded-lg">
          <p className="text-goat-gray-400 text-sm">Leads no funil</p>
          <p className="text-2xl font-bold text-white">{totalLeads}</p>
        </div>
        <div className="bg-goat-gray-900/50 p-4 rounded-lg">
          <p className="text-goat-gray-400 text-sm">Etapas com leads</p>
          <p className="text-2xl font-bold text-white">{stagesWithLeads}</p>
        </div>
        <div className="bg-goat-gray-900/50 p-4 rounded-lg">
          <p className="text-goat-gray-400 text-sm">Conversão (1ª → última)</p>
          <p className="text-2xl font-bold text-white">{formatPct(conversion)}</p>
        </div>
      </div>

      {/* Chart container (estilo do ProjectionChart: grid + roxo + tooltip escuro) */}
      <div ref={wrapRef} className="relative w-full h-[260px]">
        {data.length > 0 ? (
          <>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-full"
              preserveAspectRatio="none"
              onMouseLeave={hideTip}
            >
              <defs>
                {/* fundo leve */}
                <linearGradient id="funnelBg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
                </linearGradient>

                {/* roxo do ProjectionChart */}
                <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* painel */}
              <rect
                x="0"
                y="0"
                width={W}
                height={H}
                rx="10"
                ry="10"
                fill="url(#funnelBg)"
              />

              {/* grid (igual ao CartesianGrid do recharts) */}
              {Array.from({ length: 4 }).map((_, i) => {
                const y = padTop + (innerH * i) / 3;
                return (
                  <line
                    key={`h-${i}`}
                    x1={padL}
                    y1={y}
                    x2={W - padR}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.10)"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* eixo X divisórias */}
              {data.map((_, i) => {
                if (i === 0) return null;
                const x = padL + (innerW * i) / data.length;
                return (
                  <line
                    key={`v-${i}`}
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={padTop + innerH}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* FUNIL HORIZONTAL (trapezóides conectados) */}
              {data.map((row, i) => {
                const segW = innerW / data.length;
                const x0 = padL + i * segW;
                const x1 = x0 + segW;

                const hL = scaleH(row.value);
                const hR = scaleH(data[i + 1]?.value ?? row.value);

                const yc = padTop + innerH / 2;

                const yLT = yc - hL / 2;
                const yLB = yc + hL / 2;
                const yRT = yc - hR / 2;
                const yRB = yc + hR / 2;

                const inset = 2;

                const points = [
                  `${x0 + inset},${yLT}`,
                  `${x1 - inset},${yRT}`,
                  `${x1 - inset},${yRB}`,
                  `${x0 + inset},${yLB}`,
                ].join(" ");

                return (
                  <g key={row.id}>
                    <polygon
                      points={points}
                      fill="url(#colorFunnel)"
                      stroke="#8B5CF6"
                      strokeOpacity={0.55}
                      strokeWidth="1.5"
                      onMouseMove={(e) => showTip(e, row)}
                    />

                    {/* valor */}
                    <text
                      x={x0 + segW / 2}
                      y={padTop + innerH / 2 - 6}
                      textAnchor="middle"
                      fontSize="14"
                      fill="rgba(255,255,255,0.92)"
                      style={{ fontWeight: 700 }}
                      pointerEvents="none"
                    >
                      {row.value}
                    </text>

                    {/* label etapa */}
                    <text
                      x={x0 + segW / 2}
                      y={padTop + innerH + 22}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#A3A3A3"
                      pointerEvents="none"
                    >
                      {row.name.length > 18 ? `${row.name.slice(0, 18)}…` : row.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Tooltip (mesmo estilo do recharts no seu ProjectionChart) */}
            {tip.show && (
              <div
                style={{ left: tip.x, top: tip.y }}
                className="absolute z-10 pointer-events-none"
              >
                <div
                  className="px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "#171717",
                    borderColor: "#404040",
                    color: "#FFFFFF",
                  }}
                >
                  <div className="text-goat-gray-400 text-xs mb-1">{tip.name}</div>
                  <div className="text-white text-sm font-semibold">
                    {tip.value} lead(s)
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-goat-gray-400">Nenhum dado disponível para exibir</p>
          </div>
        )}
      </div>
    </Card>
  );
}
