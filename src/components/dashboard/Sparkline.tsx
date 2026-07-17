import { useClient } from "@/hooks/useClient";
import { useRunsTimeline, type DailyRunCount } from "@/hooks/useRunsTimeline";

const W = 200;
const H = 64;
const AXIS_L = 30;
const AXIS_B = 14;
const PLOT_L = AXIS_L;
const PLOT_R = W - 4;
const PLOT_W = PLOT_R - PLOT_L;
const PLOT_T = 2;
const PLOT_B = H - AXIS_B;
const PLOT_H = PLOT_B - PLOT_T;

const trimLeadingZeros = (data: DailyRunCount[]) => {
  const first = data.findIndex((d) => d.total > 0);
  if (first === -1) return data.slice(-14);
  return data.slice(Math.max(0, first));
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

const gridLines = (ceiling: number, step: number): { y: number; label: string }[] => {
  const ticks: { y: number; label: string }[] = [];
  for (let v = 0; v <= ceiling; v += step) {
    ticks.push({ y: v, label: String(v) });
  }
  return ticks;
};

const linePath = (
  data: DailyRunCount[],
  valueKey: "total" | "successful",
  maxVal: number
): string | null => {
  const values = data.map((d) => d[valueKey]);
  if (values.length < 2) return null;
  const stepX = PLOT_W / (values.length - 1);
  return values
    .map((v, i) => {
      const x = PLOT_L + i * stepX;
      const y = PLOT_B - (v / maxVal) * PLOT_H;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
};

export const Sparkline = ({ windowDays }: { windowDays: number }) => {
  const { data: client } = useClient();
  const { data: raw } = useRunsTimeline(client?.organization_id, windowDays);

  const data = raw ? trimLeadingZeros(raw) : undefined;
  if (!data || data.length < 2) return null;

  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const { ceiling, step } = niceCeiling(maxVal);
  const totalPath = linePath(data, "total", ceiling);
  const successPath = linePath(data, "successful", ceiling);
  if (!totalPath || !successPath) return null;

  const totalRuns = data.reduce((s, d) => s + d.total, 0);
  const successRuns = data.reduce((s, d) => s + d.successful, 0);

  const yTicks = gridLines(ceiling, step);
  const xLabels = [
    { x: PLOT_L, label: formatDate(data[0].date) },
    { x: PLOT_L + PLOT_W / 2, label: formatDate(data[Math.floor(data.length / 2)].date) },
    { x: PLOT_R, label: formatDate(data[data.length - 1].date) },
  ];

  return (
    <div className="mt-6 border border-border bg-background p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-label font-mono uppercase tracking-[0.08em] text-muted">
          Run Activity
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-label font-mono uppercase tracking-[0.05em] text-muted">
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4A4A4A", display: "inline-block", flexShrink: 0 }} />
            {totalRuns} total
          </span>
          <span className="flex items-center gap-1 text-label font-mono uppercase tracking-[0.05em] text-muted">
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#6B8F7A", display: "inline-block", flexShrink: 0 }} />
            {successRuns} success
          </span>
        </div>
      </div>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        overflow="visible"
        style={{ display: "block", fontFamily: "JetBrains Mono, monospace" }}
      >
        {/* Grid lines + Y labels */}
        {yTicks.map((tick) => {
          const y = PLOT_B - (tick.y / ceiling) * PLOT_H;
          return (
            <g key={tick.label}>
              <line
                x1={PLOT_L}
                y1={y}
                x2={PLOT_R}
                y2={y}
                stroke="#E0DDDA"
                strokeWidth={0.5}
              />
              <text
                x={PLOT_L - 3}
                y={y + 2}
                textAnchor="end"
                fill="#6B6762"
                fontSize={9}
                letterSpacing="0.08em"
              >
                {tick.label}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {xLabels.map((item) => (
          <text
            key={item.label}
            x={item.x}
            y={PLOT_B + 11}
            textAnchor="middle"
            fill="#6B6762"
            fontSize={9}
            letterSpacing="0.05em"
          >
            {item.label}
          </text>
        ))}

        {/* Total line */}
        <path
          d={totalPath}
          fill="none"
          stroke="#4A4A4A"
          strokeWidth={0.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Success line */}
        <path
          d={successPath}
          fill="none"
          stroke="#6B8F7A"
          strokeWidth={0.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
