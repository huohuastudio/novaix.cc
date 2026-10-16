// 收入趋势面积图：按 recharts 的布局规则绘制，构建时与浏览器端共用
import { area, curveMonotoneX, line } from "d3-shape";
import { currencySymbol } from "./format";

export interface RevenuePoint {
  date: string;
  amount: number; // 单位：元
}

export const CHART_HEIGHT = 240;
// 对应后台 AreaChart margin={{ left: 0, right: 4, top: 4 }}、YAxis width={56}、XAxis 默认高度 30
const MARGIN_RIGHT = 4;
const PLOT_LEFT = 56;
const PLOT_TOP = 4;
const PLOT_BOTTOM = CHART_HEIGHT - 30;
const MIN_TICK_GAP = 40;
const TICK_FONT_SIZE = 12;
// "MM-DD" 在 Geist 12px 下的宽度，浏览器端会用实测值替换
export const DEFAULT_LABEL_WIDTH = 29.2;
// 纵轴刻度文字高度，顶部刻度据此下移避免被裁切
const Y_LABEL_HALF = 9;

/** recharts getNiceTickValues 的简化实现：从 0 开始的 5 个刻度 */
export function niceTicks(max: number) {
  if (max <= 0) return [0, 1, 2, 3, 4];
  const rough = max / 4;
  const digit = Math.floor(Math.log10(rough)) + 1;
  const unit = 10 ** digit;
  const scale = digit !== 1 ? 0.05 : 0.1;
  const step = Math.ceil(rough / unit / scale - 1e-9) * scale * unit;
  return [0, 1, 2, 3, 4].map((i) => Math.round(i * step * 1e6) / 1e6);
}

export interface ChartLayout {
  width: number;
  xs: number[];
  ys: number[];
  yTicks: number[];
  yMax: number;
  plotLeft: number;
  plotRight: number;
  plotTop: number;
  plotBottom: number;
}

export function layoutChart(points: RevenuePoint[], width: number): ChartLayout {
  const plotRight = width - MARGIN_RIGHT;
  const yTicks = niceTicks(Math.max(...points.map((p) => p.amount)));
  const yMax = yTicks[yTicks.length - 1];
  const span = points.length > 1 ? (plotRight - PLOT_LEFT) / (points.length - 1) : 0;
  const xs = points.map((_, i) => PLOT_LEFT + i * span);
  const ys = points.map((p) => PLOT_BOTTOM - (p.amount / yMax) * (PLOT_BOTTOM - PLOT_TOP));
  return { width, xs, ys, yTicks, yMax, plotLeft: PLOT_LEFT, plotRight, plotTop: PLOT_TOP, plotBottom: PLOT_BOTTOM };
}

/** recharts preserveStartEnd 横轴刻度筛选：保留首尾，中间按最小间距贪心选取 */
function pickXTicks(xs: number[], width: number, labelWidth: (i: number) => number) {
  const n = xs.length;
  const shown: { i: number; x: number }[] = [];
  let start = 0;
  let end = width;

  const tailSize = labelWidth(n - 1);
  const tailGap = xs[n - 1] + tailSize / 2 - end;
  const tailX = tailGap > 0 ? xs[n - 1] - tailGap : xs[n - 1];
  const tail = { i: n - 1, x: tailX };
  if (tailX - tailSize / 2 >= start && tailX + tailSize / 2 <= end) {
    end = tailX - (tailSize / 2 + MIN_TICK_GAP);
  }

  for (let i = 0; i < n - 1; i++) {
    const size = labelWidth(i);
    let x = xs[i];
    if (i === 0) {
      const gap = x - size / 2 - start;
      if (gap < 0) x -= gap;
    }
    if (x - size / 2 >= start && x + size / 2 <= end) {
      shown.push({ i, x });
      start = x + size / 2 + MIN_TICK_GAP;
    }
  }
  shown.push(tail);
  return shown;
}

const fmt = (n: number) => String(Math.round(n * 1000) / 1000);

export type Coord = [number, number];

export function chartCoords(l: ChartLayout): Coord[] {
  return l.xs.map((x, i) => [x, l.ys[i]]);
}

/** 面积与折线路径；baseline 为面积底边的 y 坐标 */
export function curvePaths(coords: Coord[], baseline: number) {
  return {
    area: area().x((d) => d[0]).y0(baseline).y1((d) => d[1]).curve(curveMonotoneX)(coords) ?? "",
    line: line().curve(curveMonotoneX)(coords) ?? "",
  };
}

export function renderRevenueChart(
  points: RevenuePoint[],
  width: number,
  gradientId: string,
  labelWidth: (i: number) => number = () => DEFAULT_LABEL_WIDTH,
  clip = true,
) {
  const l = layoutChart(points, width);
  const paths = curvePaths(chartCoords(l), l.plotBottom);

  const grid = [...l.yTicks]
    .map((t) => {
      const y = fmt(l.plotBottom - (t / l.yMax) * (l.plotBottom - l.plotTop));
      return `<line class="stroke-border/50" fill="none" x1="${l.plotLeft}" y1="${y}" x2="${fmt(l.plotRight)}" y2="${y}"></line>`;
    })
    .join("");

  const tickStyle = `fill="#666" style="font-size:${TICK_FONT_SIZE}px"`;
  const xLabels = pickXTicks(l.xs, width, labelWidth)
    .map(({ i, x }) => `<text x="${fmt(x)}" y="224" text-anchor="middle" ${tickStyle}><tspan x="${fmt(x)}" dy="0.71em">${points[i].date}</tspan></text>`)
    .join("");
  const yLabels = l.yTicks
    .map((t) => {
      const y = Math.max(l.plotBottom - (t / l.yMax) * (l.plotBottom - l.plotTop), Y_LABEL_HALF);
      return `<text x="46" y="${fmt(y)}" text-anchor="end" ${tickStyle}><tspan x="46" dy="0.355em">${currencySymbol}${t}</tspan></text>`;
    })
    .join("");

  return `<svg class="block" width="${width}" height="${CHART_HEIGHT}" viewBox="0 0 ${width} ${CHART_HEIGHT}">
<g>${grid}</g>
<defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--color-amount)" stop-opacity="0.12"></stop><stop offset="100%" stop-color="var(--color-amount)" stop-opacity="0"></stop></linearGradient></defs>
<defs><clipPath id="${gradientId}-clip"><rect data-reveal x="${fmt(l.xs[0])}" y="0" width="${fmt(l.xs[l.xs.length - 1] - l.xs[0])}" height="${Math.floor(l.plotBottom + 1)}"></rect></clipPath></defs>
<g${clip ? ` clip-path="url(#${gradientId}-clip)"` : ""}>
<path data-area fill="url(#${gradientId})" fill-opacity="0.6" stroke="none" d="${paths.area}"></path>
<path data-line fill="none" stroke="var(--color-amount)" stroke-width="1.5" d="${paths.line}"></path>
</g>
<g>${xLabels}${yLabels}</g>
<path data-cursor class="stroke-border" visibility="hidden" pointer-events="none" d=""></path>
<circle data-dot visibility="hidden" r="4" fill="var(--color-amount)" stroke-width="2" stroke="transparent"></circle>
</svg>`;
}
