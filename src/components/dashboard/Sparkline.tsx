import { useState } from "react";
import { useClient } from "@/hooks/useClient";
import { useRunsTimeline, type DailyRunCount } from "@/hooks/useRunsTimeline";

const VIEWBOX_W = 1000;
const PLOT_H = 108;
const CHARCOAL = "#4A4A4A";
const SUCCESS = "#6B8F7A";
const GRID = "#E0DDDA";

const trimLeadingZeros = (data: DailyRunCount[]) => {
  const first = data.findIndex((d) => d.total > 0);
  if (first === -1) return data.slice(-14);
  return data.slice(Math.max(0, first));
};

const toCumulative = (data: DailyRunCount[]) => {
  let total = 0;
  let successful = 0;
  let failed = 0;

  return data.map((day) => {
    total += day.total;
    successful += day.successful;
    failed += day.failed;
    return { ...day, total, successful, failed };
  });
};

const formatDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

const niceCeiling = (max: number): { ceiling: number; step: number } => {
  if (max <= 5) return { ceiling: 5, step: 5 };
  if (max <= 20) return { ceiling: Math.ceil(max / 5) * 5, step: 5 };
  if (max <= 50) return { ceiling: Math.ceil(max / 10) * 10, step: 10 };
  if (max <= 100) return { ceiling: Math.ceil(max / 20) * 20, step: 20 };
  return { ceiling: Math.ceil(max / 50) * 50, step: 50 };
};

const scaleX = (index: number, length: number) =>
  length === 1 ? VIEWBOX_W / 2 : (index / (length - 1)) * VIEWBOX_W;

const scaleY = (value: number, ceiling: number) =>
  PLOT_H - (value / ceiling) * PLOT_H;

const linePath = (data: DailyRunCount[], valueKey: "total" | "successful", ceiling: number) =>
  data
    .map((d, i) => `${i === 0 ? "M" : "L"}${scaleX(i, data.length).toFixed(1)},${scaleY(d[valueKey], ceiling).toFixed(1)}`)
    .join(" ");

const areaPath = (data: DailyRunCount[], valueKey: "total" | "successful", ceiling: number) => {
  const line = linePath(data, valueKey, ceiling);
  const lastX = scaleX(data.length - 1, data.length);
  const firstX = scaleX(0, data.length);
  return `${line} L${lastX.toFixed(1)},${PLOT_H} L${firstX.toFixed(1)},${PLOT_H} Z`;
};

const analyticalTicks = (ceiling: number) =>
  Array.from(new Set([0, Math.ceil(ceiling / 2), ceiling])).sort((a, b) => a - b);

export const Sparkline = ({ windowDays }: { windowDays: number }) => {
  const { data: client } = useClient();
  const { data: raw } = useRunsTimeline(client?.organization_id, windowDays);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = raw ? trimLeadingZeros(raw) : undefined;
  if (!data || data.length < 2) return null;

  const cumulativeData = toCumulative(data);
  const totalRuns = cumulativeData[cumulativeData.length - 1].total;
  const { ceiling } = niceCeiling(Math.max(totalRuns, 1));
  const totalPath = areaPath(cumulativeData, "total", ceiling);
  const successPath = areaPath(cumulativeData, "successful", ceiling);
  const totalLine = linePath(cumulativeData, "total", ceiling);
  const successLine = linePath(cumulativeData, "successful", ceiling);

  const successRuns = cumulativeData[cumulativeData.length - 1].successful;
  const ticks = analyticalTicks(ceiling);
  const middleIndex = Math.floor((data.length - 1) / 2);
  const active = activeIndex === null ? null : cumulativeData[activeIndex];

  return (
    <div className="mt-6 border border-border bg-background p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-label font-mono uppercase tracking-[0.08em] text-muted">
          Run Activity
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-label font-mono uppercase tracking-[0.05em] text-muted">
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: CHARCOAL, display: "inline-block", flexShrink: 0 }} />
            {totalRuns} total
          </span>
          <span className="flex items-center gap-1 text-label font-mono uppercase tracking-[0.05em] text-muted">
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: SUCCESS, display: "inline-block", flexShrink: 0 }} />
            {successRuns} success
          </span>
        </div>
      </div>

      <div className="relative" style={{ height: 142 }} role="group" aria-label="Daily workflow runs">
        <div className="absolute inset-x-0 top-0" style={{ left: 30, height: PLOT_H }}>
          <svg
            className="block h-full w-full"
            viewBox={`0 0 ${VIEWBOX_W} ${PLOT_H}`}
            preserveAspectRatio="none"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {ticks.map((tick) => {
              const y = scaleY(tick, ceiling);
              return <line key={tick} x1="0" y1={y} x2={VIEWBOX_W} y2={y} stroke={GRID} strokeWidth="1" />;
            })}
            <path d={totalPath} fill={CHARCOAL} fillOpacity="0.12" />
            <path d={successPath} fill={SUCCESS} fillOpacity="0.22" />
            <path d={totalLine} fill="none" stroke={CHARCOAL} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path d={successLine} fill="none" stroke={SUCCESS} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            {cumulativeData.map((item, index) => {
              const x = scaleX(index, cumulativeData.length);
              const y = scaleY(item.total, ceiling);
              const label = `${formatDate(item.date)}: ${item.total} total, ${item.successful} successful, ${item.failed} failed cumulative`;
              return (
                <circle
                  key={item.date}
                  cx={x}
                  cy={y}
                  r="8"
                  fill="transparent"
                  stroke="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={label}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onBlur={() => setActiveIndex(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setActiveIndex(null);
                  }}
                />
              );
            })}
          </svg>
        </div>

        <div className="absolute left-0 top-0 flex h-full flex-col justify-between pr-2 text-right text-label font-mono text-muted" style={{ width: 28, height: PLOT_H }}>
          {ticks.slice().reverse().map((tick) => <span key={tick}>{tick}</span>)}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-between pl-[30px] pr-0 text-label font-mono text-muted">
          <span>{formatDate(data[0].date)}</span>
          {data.length > 2 && <span>{formatDate(data[middleIndex].date)}</span>}
          <span>{formatDate(data[data.length - 1].date)}</span>
        </div>

        {active && (
          <div className="pointer-events-none absolute right-0 top-0 border border-border bg-background px-2 py-1 text-label font-mono uppercase tracking-[0.04em] text-muted">
            <div>{formatDate(active.date)}</div>
            <div>{active.total} total · {active.successful} success · {active.failed} failed cumulative</div>
          </div>
        )}
      </div>
    </div>
  );
};
