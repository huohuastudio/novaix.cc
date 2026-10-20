// 运维监控：节点 HK-01 最近 1 小时的演示监控数据，以及按 recharts 布局规则生成的图表几何（构建时运行）
// 对应后台 ui/src/components/node-stats.tsx（GaugeChart / ChartCard + AreaChart）与 lib/chart-utils.ts
import { formatPercent } from "../../../demo/format";
import { curvePaths, niceTicks } from "../../../demo/revenue-chart";

const MB = 1024 ** 2;
const GB = 1024 ** 3;

/** 后台 formatBytes：1024 进制，保留 1 位小数 */
export function formatBytes(bytes: number) {
  if (!bytes) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// ── 演示数据：60 个点，每分钟一个，截止 2026/10/20 20:50 ──

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261020);
const END_MINUTE = 20 * 60 + 50;
const COUNT = 60;
const CPU_CORES = 32;
const MEM_TOTAL = 64 * GB;
const DISK_TOTAL = 1024 * GB;
const DISK_USED = 473.1 * GB;

export interface Metric {
  time: string;
  cpu: number;
  mem: number;
  rx: number;
  tx: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

export const metrics: Metric[] = Array.from({ length: COUNT }, (_, i) => {
  const minute = END_MINUTE - (COUNT - 1) + i;
  const cpuSpike = i === 13 ? 9 : i === 14 ? 21 : i === 45 ? 14 : 0;
  const netSpike = i === 21 ? 3.6 : i === 22 ? 1.4 : i === 46 ? 2.8 : 0;
  return {
    time: `${pad(Math.floor(minute / 60))}:${pad(minute % 60)}`,
    cpu: +(21.5 + 3.2 * Math.sin(i / 6) + rand() * 4 + cpuSpike).toFixed(1),
    mem: 57.4 + i * 0.018 + 0.4 * Math.sin(i / 8) + rand() * 0.35,
    rx: Math.round((2.6 + 0.8 * Math.sin(i / 5 + 1) + rand() * 0.7 + netSpike) * MB),
    tx: Math.round((1.2 + 0.35 * Math.sin(i / 5 + 1) + rand() * 0.35 + netSpike * 0.45) * MB),
  };
});

const latest = metrics[COUNT - 1];

// ── 资源使用率环形图（GaugeChart） ──

export interface Gauge {
  key: string;
  title: string;
  icon: string;
  percent: number;
  used: string;
  total: string;
  color: string;
}

/** 使用率超过 80% 显示危险色，超过 60% 显示 chart-5 */
const gaugeColor = (percent: number, color: string) =>
  percent > 80 ? "var(--color-destructive)" : percent > 60 ? "var(--color-chart-5)" : color;

const memUsed = (latest.mem / 100) * MEM_TOTAL;
const diskPercent = (DISK_USED / DISK_TOTAL) * 100;

export const gauges: Gauge[] = [
  { key: "cpu", title: "CPU 使用率", icon: "cpu", percent: latest.cpu, used: formatPercent(latest.cpu), total: `${CPU_CORES} 核`, color: gaugeColor(latest.cpu, "var(--color-chart-1)") },
  { key: "mem", title: "内存使用率", icon: "memory-stick", percent: latest.mem, used: formatBytes(memUsed), total: formatBytes(MEM_TOTAL), color: gaugeColor(latest.mem, "var(--color-chart-2)") },
  { key: "disk", title: "磁盘使用率", icon: "hard-drive", percent: diskPercent, used: formatBytes(DISK_USED), total: formatBytes(DISK_TOTAL), color: gaugeColor(diskPercent, "var(--color-chart-3)") },
];

// recharts Pie：160×160，默认 margin 5 → 最大半径 75；innerRadius 68%、outerRadius 85%，从 12 点方向顺时针
export const GAUGE_SIZE = 160;
const GAUGE_C = 80;
const GAUGE_OUTER = 63.75;
const GAUGE_INNER = 51;
/** 进场动画遮罩：圆环中线半径，描边宽度覆盖整个圆环 */
export const GAUGE_MID = (GAUGE_OUTER + GAUGE_INNER) / 2;
export const GAUGE_BAND = GAUGE_OUTER - GAUGE_INNER + 2;

const r4 = (n: number) => String(Math.round(n * 1e4) / 1e4);
const RADIAN = Math.PI / 180;
const polar = (r: number, angle: number) => ({ x: GAUGE_C + Math.cos(-RADIAN * angle) * r, y: GAUGE_C + Math.sin(-RADIAN * angle) * r });

/** recharts Sector 的 getSectorPath（cornerRadius 为 0） */
function sectorPath(startAngle: number, endAngle: number) {
  const angle = Math.sign(endAngle - startAngle) * Math.min(Math.abs(endAngle - startAngle), 359.999);
  const end = startAngle + angle;
  const large = +(Math.abs(angle) > 180);
  const os = polar(GAUGE_OUTER, startAngle);
  const oe = polar(GAUGE_OUTER, end);
  const is = polar(GAUGE_INNER, startAngle);
  const ie = polar(GAUGE_INNER, end);
  return (
    `M ${r4(os.x)},${r4(os.y)} A ${GAUGE_OUTER},${GAUGE_OUTER},0, ${large},${+(startAngle > end)}, ${r4(oe.x)},${r4(oe.y)} ` +
    `L ${r4(ie.x)},${r4(ie.y)} A ${GAUGE_INNER},${GAUGE_INNER},0, ${large},${+(startAngle <= end)}, ${r4(is.x)},${r4(is.y)} Z`
  );
}

/** 已用 / 剩余两个扇区，startAngle 90 → endAngle -270 */
export function gaugeSectors(percent: number) {
  const p = Math.min(Math.max(percent, 0), 100);
  const mid = 90 - p * 3.6;
  return { used: sectorPath(90, mid), free: sectorPath(mid, -270) };
}

// ── 趋势图（AreaChart） ──

// ChartCard 中图表区域 538×208；CHART_MARGIN = { top: 4, right: 4, bottom: 0, left: -12 }，XAxis 高 30，YAxis 默认宽 60
export const CHART_W = 538;
export const CHART_H = 208;
const PLOT_TOP = 4;
const PLOT_BOTTOM = CHART_H - 30;
const PLOT_RIGHT = CHART_W - 4;
const MARGIN_LEFT = -12;
/** 刻度线长 6 + 间距 2 */
const TICK_OFFSET = 8;
const MIN_TICK_GAP = 5;
/** 纵轴最上方刻度文字下移，避免被裁切（与 recharts 实际渲染一致） */
const Y_TOP_SHIFT = 5;

/** Geist 12px 字形宽度（与后台同一字体实测），用于横轴刻度的避让计算 */
const GLYPH: Record<string, number> = {
  "0": 7.97, "1": 4.61, "2": 7.44, "3": 7.36, "4": 7.39, "5": 7.52, "6": 7.5, "7": 6.3, "8": 7.25, "9": 7.5, ":": 3.58,
};
/** 字距调整使实际宽度略小于字形之和 */
const textWidth = (s: string) => [...s].reduce((w, c) => w + (GLYPH[c] ?? 7.4), 0) - 0.5;

const fmt = (n: number) => String(Math.round(n * 1e6) / 1e6);

/** recharts getTicksEnd（XAxis 默认 interval="preserveEnd"）：从末尾向前按最小间距选取，末尾刻度贴右边界 */
function pickXTicks(xs: number[], labels: string[], start: number, end: number) {
  const shown: { x: number; label: string }[] = [];
  for (let i = xs.length - 1; i >= 0; i--) {
    const size = textWidth(labels[i]);
    let x = xs[i];
    if (i === xs.length - 1) {
      const gap = x + size / 2 - end;
      if (gap > 0) x -= gap;
    }
    if (x < start || x > end) continue;
    if (x - size / 2 >= start && x + size / 2 <= end) {
      shown.unshift({ x, label: labels[i] });
      end = x - (size / 2 + MIN_TICK_GAP);
    }
  }
  return shown;
}

export interface TrendSeries {
  values: number[];
  color: string;
  /** 面积填充的渐变 id；不填为纯折线 */
  gradient?: string;
}

export interface TrendChart {
  plotLeft: number;
  plotRight: number;
  grid: string[];
  xTicks: { x: string; label: string }[];
  yTicks: { x: number; y: string; label: string }[];
  series: { color: string; gradient?: string; area: string; line: string }[];
}

export function trendChart(
  series: TrendSeries[],
  { yAxisWidth = 60, max, format = String }: { yAxisWidth?: number; max?: number; format?: (v: number) => string } = {},
): TrendChart {
  const plotLeft = MARGIN_LEFT + yAxisWidth;
  const ticks = max === undefined ? niceTicks(Math.max(...series.flatMap((s) => s.values))) : [0, 1, 2, 3, 4].map((k) => (k * max) / 4);
  const top = ticks[ticks.length - 1];
  const yOf = (v: number) => PLOT_BOTTOM - (v / top) * (PLOT_BOTTOM - PLOT_TOP);
  const step = (PLOT_RIGHT - plotLeft) / (metrics.length - 1);
  const xs = metrics.map((_, i) => plotLeft + i * step);

  return {
    plotLeft,
    plotRight: PLOT_RIGHT,
    grid: ticks.map((t) => fmt(yOf(t))),
    xTicks: pickXTicks(xs, metrics.map((m) => m.time), plotLeft, PLOT_RIGHT).map((t) => ({ x: fmt(t.x), label: t.label })),
    yTicks: ticks.map((t, k) => ({
      x: plotLeft - TICK_OFFSET,
      y: fmt(k === ticks.length - 1 ? yOf(t) + Y_TOP_SHIFT : yOf(t)),
      label: format(t),
    })),
    series: series.map((s) => {
      const coords = s.values.map((v, i) => [xs[i], yOf(v)] as [number, number]);
      return { color: s.color, gradient: s.gradient, ...curvePaths(coords, PLOT_BOTTOM) };
    }),
  };
}

const pick = (key: keyof Omit<Metric, "time">) => metrics.map((m) => m[key] as number);
const percentAxis = { max: 100, format: (v: number) => `${v}%` };

export const cpuChart = trendChart([{ values: pick("cpu"), color: "var(--color-chart-1)", gradient: "ops-cpuGrad" }], percentAxis);
export const memChart = trendChart([{ values: pick("mem"), color: "var(--color-chart-2)", gradient: "ops-memGrad" }], percentAxis);
// 流量纵轴加宽到 68（BYTES_AXIS_WIDTH），0 显示为 "0"
export const netChart = trendChart(
  [
    { values: pick("rx"), color: "var(--color-chart-4)", gradient: "ops-rxGrad" },
    { values: pick("tx"), color: "var(--color-chart-5)", gradient: "ops-txGrad" },
  ],
  { yAxisWidth: 68, format: (v) => (v === 0 ? "0" : formatBytes(v)) },
);
