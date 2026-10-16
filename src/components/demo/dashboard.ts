// 仪表盘演示的交互：收入趋势切换与悬停、节点排行排序、节点分布地图
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";
import { frameScale } from "./admin-frame";
import { currencySymbol, formatAmount, formatPercent } from "./format";
import { chartCoords, curvePaths, layoutChart, renderRevenueChart, type Coord, type RevenuePoint } from "./revenue-chart";

interface Region {
  region_id: number;
  display_name: string;
  latitude: number;
  longitude: number;
  node_count: number;
  online_count: number;
  cpu_usage: number;
  mem_usage: number;
}

interface NodeRank {
  id: number;
  name: string;
  cpu_usage: number;
  mem_usage: number;
  disk_usage: number;
}

interface DemoData {
  revenue: RevenuePoint[];
  ranking: NodeRank[];
  regions: Region[];
}

let gradientSeq = 0;

// recharts 面积图动画参数：1500ms，easing "ease"
const ANIMATION_DURATION = 1500;

/** cubic-bezier 缓动（牛顿迭代求解） */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-4) break;
      const d = slopeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    return sampleY(Math.min(1, Math.max(0, t)));
  };
}

const ease = cubicBezier(0.25, 0.1, 0.25, 1);
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initDashboard(root: HTMLElement) {
  const data: DemoData = JSON.parse(root.querySelector("[data-nx-data]")!.textContent!);
  initRevenue(root, data.revenue);
  initRanking(root, data.ranking);
  initMap(root, data.regions);
}

/* ═══ 收入趋势 ═══ */

function initRevenue(root: HTMLElement, all: RevenuePoint[]) {
  const host = root.querySelector<HTMLElement>("[data-nx-chart]")!;
  const tip = host.querySelector<HTMLElement>("[data-nx-chart-tip]")!;
  const tipDate = tip.querySelector<HTMLElement>("[data-nx-chart-tip-date]")!;
  const tipValue = tip.querySelector<HTMLElement>("[data-nx-chart-tip-value]")!;
  const gradientId = `nx-revenue-gradient-${++gradientSeq}`;
  let days = 30;
  let points = all;
  let width = 0;

  // 用实际字体测量横轴标签宽度，与 recharts 的避让计算保持一致
  const measureCtx = document.createElement("canvas").getContext("2d")!;
  const labelWidth = (i: number) => {
    measureCtx.font = `12px ${getComputedStyle(host).fontFamily}`;
    return measureCtx.measureText(points[i].date).width;
  };

  // 动画状态，对应 recharts 的 previousPointsRef：当前显示的曲线坐标（动画中为插值结果）
  let shown: Coord[] | null = null;
  // 首次展开进度；展开前曲线被裁剪为宽度 0
  let revealAlpha = 0;
  // 发生过变形动画后不再裁剪曲线两端（与 recharts 一致）
  let morphed = false;
  let morphFrame = 0;

  function setReveal(alpha: number) {
    const rect = host.querySelector("[data-reveal]");
    if (!rect) return;
    const l = layoutChart(points, width);
    rect.setAttribute("width", String(alpha * (l.xs[l.xs.length - 1] - l.xs[0])));
  }

  function setPaths(coords: Coord[]) {
    const svg = host.querySelector("svg");
    if (!svg) return;
    const p = curvePaths(coords, layoutChart(points, width).plotBottom);
    svg.querySelector("[data-area]")!.setAttribute("d", p.area);
    svg.querySelector("[data-line]")!.setAttribute("d", p.line);
  }

  /** 从当前形状过渡到新数据：每个新点从旧点 floor(i × 旧点数 / 新点数) 插值而来 */
  function morph(from: Coord[], to: Coord[]) {
    cancelAnimationFrame(morphFrame);
    morphed = true;
    host.querySelector("svg g[clip-path]")?.removeAttribute("clip-path");
    if (reducedMotion()) {
      shown = to;
      return setPaths(to);
    }
    const factor = from.length / to.length;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ANIMATION_DURATION);
      const e = ease(t);
      const current: Coord[] =
        t === 1
          ? to
          : to.map((c, i) => {
              const prev = from[Math.floor(i * factor)];
              return prev ? [prev[0] + (c[0] - prev[0]) * e, prev[1] + (c[1] - prev[1]) * e] : c;
            });
      if (t > 0) shown = current;
      setPaths(current);
      if (t < 1) morphFrame = requestAnimationFrame(step);
    };
    step(start);
  }

  function reveal() {
    if (reducedMotion()) {
      revealAlpha = 1;
      shown = chartCoords(layoutChart(points, width));
      return setReveal(1);
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ANIMATION_DURATION);
      revealAlpha = ease(t);
      if (t > 0 && !shown) shown = chartCoords(layoutChart(points, width));
      setReveal(revealAlpha);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function render() {
    width = host.clientWidth;
    if (!width) return;
    host.querySelector("svg")?.remove();
    host.insertAdjacentHTML("afterbegin", renderRevenueChart(points, width, gradientId, labelWidth, !morphed));
    const target = chartCoords(layoutChart(points, width));
    if (!shown) return setReveal(revealAlpha);
    // 展开动画进行中、或坐标未变化（如字体加载后的重绘）时直接定格，不触发变形
    const unchanged =
      shown.length === target.length &&
      shown.every((c, i) => Math.abs(c[0] - target[i][0]) < 0.01 && Math.abs(c[1] - target[i][1]) < 0.01);
    if (revealAlpha < 1 || unchanged) {
      setReveal(revealAlpha);
      shown = target;
      return setPaths(target);
    }
    morph(shown, target);
  }

  new ResizeObserver(() => {
    if (host.clientWidth !== width) render();
  }).observe(host);
  document.fonts?.ready.then(render);
  render();

  // 进入视口时播放首次展开动画（对应后台页面加载时的入场动画）
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      reveal();
    },
    { threshold: 0.3 },
  );
  io.observe(host);

  root.querySelectorAll<HTMLElement>("[data-nx-days]").forEach((btn) => {
    btn.addEventListener("click", () => {
      days = Number(btn.dataset.nxDays);
      points = all.slice(-days);
      root.querySelectorAll<HTMLElement>("[data-nx-days]").forEach((b) => {
        const active = b === btn;
        b.dataset.state = active ? "active" : "inactive";
        b.setAttribute("aria-selected", String(active));
      });
      root.querySelector("[data-nx-revenue-days]")!.textContent = String(days);
      const total = points.reduce((s, p) => s + p.amount, 0);
      root.querySelector("[data-nx-revenue-total]")!.textContent = formatAmount(Math.round(total * 100));
      hide();
      render();
    });
  });

  function hide() {
    tip.classList.add("invisible");
    const svg = host.querySelector("svg");
    svg?.querySelector("[data-cursor]")?.setAttribute("visibility", "hidden");
    svg?.querySelector("[data-dot]")?.setAttribute("visibility", "hidden");
  }

  host.addEventListener("pointermove", (e) => {
    const svg = host.querySelector("svg");
    if (!svg) return;
    const s = frameScale(host);
    const rect = host.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / s;
    const my = (e.clientY - rect.top) / s;
    const l = layoutChart(points, width);
    if (mx < l.plotLeft || mx > l.plotRight || my < l.plotTop || my > l.plotBottom) return hide();

    const step = points.length > 1 ? (l.plotRight - l.plotLeft) / (points.length - 1) : 1;
    const i = Math.max(0, Math.min(points.length - 1, Math.round((mx - l.plotLeft) / step)));
    const x = l.xs[i];
    const cursor = svg.querySelector("[data-cursor]")!;
    cursor.setAttribute("d", `M${x},${l.plotTop}L${x},${l.plotBottom}`);
    cursor.setAttribute("visibility", "visible");
    const dot = svg.querySelector("[data-dot]")!;
    dot.setAttribute("cx", String(x));
    dot.setAttribute("cy", String(l.ys[i]));
    dot.setAttribute("visibility", "visible");

    tipDate.textContent = points[i].date;
    tipValue.textContent = `${currencySymbol}${points[i].amount.toFixed(2)}收入`;
    const wasHidden = tip.classList.contains("invisible");
    tip.classList.remove("invisible");
    // 与 recharts 一致：默认在光标右下方 10px，放不下时翻到另一侧
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    const tx = x + 10 + tw > width ? Math.max(x - 10 - tw, 0) : x + 10;
    const ty = my + 10 + th > host.clientHeight ? Math.max(my - 10 - th, 0) : my + 10;
    if (wasHidden) tip.style.transition = "none";
    tip.style.transform = `translate(${tx}px, ${ty}px)`;
    if (wasHidden) {
      void tip.offsetWidth;
      tip.style.transition = "transform 400ms";
    }
  });
  host.addEventListener("pointerleave", hide);
}

/* ═══ 节点资源排行 ═══ */

type SortKey = "cpu" | "mem" | "disk";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "cpu", label: "按 CPU" },
  { key: "mem", label: "按内存" },
  { key: "disk", label: "按磁盘" },
];

const CHECK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check pointer-events-none size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>';

function usageColor(pct: number) {
  return pct > 80 ? "bg-destructive" : pct > 60 ? "bg-amber-500" : "bg-foreground/60";
}

function initRanking(root: HTMLElement, ranking: NodeRank[]) {
  const trigger = root.querySelector<HTMLElement>("[data-nx-select]")!;
  const list = root.querySelector<HTMLElement>("[data-nx-ranking]")!;
  let current: SortKey = "cpu";
  let menu: HTMLElement | null = null;

  const value = (n: NodeRank, key: SortKey) => (key === "cpu" ? n.cpu_usage : key === "mem" ? n.mem_usage : n.disk_usage);

  function renderList() {
    const rows = [...ranking].sort((a, b) => value(b, current) - value(a, current)).slice(0, 5);
    // 复用已有行，保留进度条宽度过渡动画
    rows.forEach((node, i) => {
      const row = list.children[i] as HTMLElement;
      const v = value(node, current);
      const pct = Math.min(v, 100);
      row.querySelector("span")!.textContent = node.name;
      const bar = row.querySelector<HTMLElement>(".h-full")!;
      bar.className = `h-full rounded-full ${usageColor(pct)} transition-all duration-500`;
      bar.style.width = `${pct}%`;
      row.querySelector(".w-10")!.textContent = formatPercent(v);
    });
  }

  function close() {
    menu?.remove();
    menu = null;
    trigger.dataset.state = "closed";
    trigger.setAttribute("aria-expanded", "false");
  }

  function open() {
    trigger.dataset.state = "open";
    trigger.setAttribute("aria-expanded", "true");
    menu = document.createElement("div");
    menu.setAttribute("role", "listbox");
    menu.dataset.slot = "select-content";
    menu.className =
      "nx-pop-in absolute top-full right-0 z-50 mt-1 flex min-w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-border/50";
    menu.style.transformOrigin = "top right";
    const viewport = document.createElement("div");
    viewport.className = "flex w-full flex-col gap-0.5 p-1";
    for (const opt of SORT_OPTIONS) {
      const item = document.createElement("div");
      item.setAttribute("role", "option");
      item.tabIndex = -1;
      item.className =
        "relative flex w-full cursor-default items-center gap-2 rounded-lg py-1.5 pr-3 pl-8 text-sm whitespace-nowrap outline-hidden select-none focus:bg-accent focus:text-accent-foreground";
      item.innerHTML =
        (opt.key === current
          ? `<span class="pointer-events-none absolute left-2 flex size-4 items-center justify-center">${CHECK_ICON}</span>`
          : "") + `<span>${opt.label}</span>`;
      item.addEventListener("pointermove", () => item.focus({ preventScroll: true }));
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        current = opt.key;
        trigger.querySelector("[data-nx-select-value]")!.textContent = opt.label;
        close();
        renderList();
      });
      viewport.append(item);
    }
    menu.append(viewport);
    trigger.parentElement!.append(menu);
    (viewport.children[SORT_OPTIONS.findIndex((o) => o.key === current)] as HTMLElement).focus({ preventScroll: true });
  }

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (menu) close();
    else open();
  });
  document.addEventListener("pointerdown", (e) => {
    if (menu && !menu.contains(e.target as Node) && !trigger.contains(e.target as Node)) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* ═══ 节点分布地图（对应 components/node-map.tsx） ═══ */

const REGION_LABELS: Array<{ name: string; lat: number; lng: number; sea?: boolean }> = [
  { name: "中国", lat: 35, lng: 105 },
  { name: "俄罗斯", lat: 62, lng: 95 },
  { name: "美国", lat: 40, lng: -100 },
  { name: "加拿大", lat: 56, lng: -96 },
  { name: "巴西", lat: -10, lng: -55 },
  { name: "澳大利亚", lat: -25, lng: 135 },
  { name: "印度", lat: 22, lng: 80 },
  { name: "日本", lat: 37, lng: 140 },
  { name: "印度尼西亚", lat: -3, lng: 118 },
  { name: "德国", lat: 51, lng: 10 },
  { name: "英国", lat: 54, lng: -2 },
  { name: "韩国", lat: 36, lng: 128 },
  { name: "泰国", lat: 15, lng: 101 },
  { name: "新加坡", lat: 1.3, lng: 104 },
  { name: "阿根廷", lat: -35, lng: -64 },
  { name: "南非", lat: -30, lng: 25 },
  { name: "埃及", lat: 27, lng: 30 },
  { name: "沙特阿拉伯", lat: 24, lng: 45 },
  { name: "墨西哥", lat: 23, lng: -102 },
  { name: "太平洋", lat: 0, lng: -150, sea: true },
  { name: "大西洋", lat: 15, lng: -35, sea: true },
  { name: "印度洋", lat: -20, lng: 75, sea: true },
];

const INITIAL_SCALE = 140;
const MIN_SCALE = 80;
const MAX_SCALE = 600;
const VB_W = 960;
const VB_H = 480;
const SVG_NS = "http://www.w3.org/2000/svg";
const ONLINE = "#22c55e";

const countries = (() => {
  const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
  return feature(topo, topo.objects.countries).features;
})();

function initMap(root: HTMLElement, regions: Region[]) {
  const svg = root.querySelector<SVGSVGElement>("[data-nx-map]")!;
  const frame = svg.closest<HTMLElement>("[data-nx-frame]")!;
  const tip = root.querySelector<HTMLElement>("[data-nx-map-tip]")!;
  let scale = INITIAL_SCALE;
  let translate: [number, number] = [VB_W / 2, VB_H / 1.7];

  const countryLayer = document.createElementNS(SVG_NS, "g");
  const labelLayer = document.createElementNS(SVG_NS, "g");
  const dotLayer = document.createElementNS(SVG_NS, "g");
  svg.append(countryLayer, labelLayer, dotLayer);

  const countryPaths = countries.map(() => {
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("fill", "#d1d5db");
    p.setAttribute("stroke", "#fff");
    p.setAttribute("stroke-width", "0.5");
    p.setAttribute("class", "dark:fill-[#374151] dark:stroke-[#1f2937]");
    countryLayer.append(p);
    return p;
  });

  const labels = REGION_LABELS.map((label) => {
    const t = document.createElementNS(SVG_NS, "text");
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("class", `select-none pointer-events-none ${label.sea ? "fill-muted-foreground/30" : "fill-muted-foreground/70"}`);
    t.style.fontSize = `${label.sea ? 22 : 18}px`;
    t.style.fontStyle = label.sea ? "italic" : "normal";
    t.textContent = label.name;
    labelLayer.append(t);
    return t;
  });

  const dots = regions.map((region) => {
    const g = document.createElementNS(SVG_NS, "g");
    g.dataset.nodeDot = "";
    const hasOnline = region.online_count > 0;
    const color = hasOnline ? ONLINE : "var(--muted-foreground)";
    let pulse: SVGCircleElement | null = null;
    if (hasOnline) {
      pulse = document.createElementNS(SVG_NS, "circle");
      pulse.setAttribute("fill", color);
      pulse.style.animation = "nx-map-pulse 2s ease-out infinite";
      g.append(pulse);
    }
    const dot = document.createElementNS(SVG_NS, "circle");
    dot.setAttribute("r", "6");
    dot.setAttribute("fill", color);
    dot.setAttribute("stroke", "var(--card)");
    dot.setAttribute("stroke-width", "2");
    dot.setAttribute("class", "cursor-pointer");
    dot.addEventListener("pointerenter", (e) => showTip(region, e));
    dot.addEventListener("pointerleave", () => (tip.hidden = true));
    g.append(dot);
    dotLayer.append(g);
    return { region, circles: pulse ? [pulse, dot] : [dot] };
  });

  function draw() {
    const projection = geoMercator().scale(scale).translate(translate);
    const path = geoPath(projection);
    countries.forEach((f, i) => countryPaths[i].setAttribute("d", path(f) ?? ""));
    REGION_LABELS.forEach((label, i) => {
      const c = projection([label.lng, label.lat]);
      if (!c) return;
      labels[i].setAttribute("x", String(c[0]));
      labels[i].setAttribute("y", String(c[1]));
    });
    for (const { region, circles } of dots) {
      const c = projection([region.longitude, region.latitude]);
      if (!c) continue;
      for (const circle of circles) {
        circle.setAttribute("cx", String(c[0]));
        circle.setAttribute("cy", String(c[1]));
      }
    }
  }

  function showTip(region: Region, e: PointerEvent) {
    const s = frameScale(svg);
    const rect = svg.getBoundingClientRect();
    tip.style.left = `${(e.clientX - rect.left) / s}px`;
    tip.style.top = `${(e.clientY - rect.top) / s - 12}px`;
    const online = region.online_count > 0;
    tip.querySelector("[data-nx-map-tip-name]")!.textContent = region.display_name;
    tip.querySelector<HTMLElement>("[data-nx-map-tip-dot]")!.style.backgroundColor = online ? ONLINE : "var(--muted-foreground)";
    tip.querySelector("[data-nx-map-tip-nodes]")!.textContent = `节点 ${region.online_count}/${region.node_count} 在线`;
    const usage = tip.querySelector<HTMLElement>("[data-nx-map-tip-usage]")!;
    usage.hidden = !online;
    usage.textContent = `CPU ${region.cpu_usage.toFixed(0)}% · 内存 ${region.mem_usage.toFixed(0)}%`;
    tip.hidden = false;
  }

  // 拖拽平移
  let drag: { x: number; y: number; tx: number; ty: number } | null = null;
  svg.addEventListener("pointerdown", (e) => {
    if ((e.target as Element).closest("[data-node-dot]")) return;
    svg.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY, tx: translate[0], ty: translate[1] };
  });
  svg.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const rect = svg.getBoundingClientRect();
    translate = [
      drag.tx + (e.clientX - drag.x) * (VB_W / rect.width),
      drag.ty + (e.clientY - drag.y) * (VB_H / rect.height),
    ];
    draw();
  });
  const endDrag = () => (drag = null);
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);
  svg.addEventListener("lostpointercapture", endDrag);

  // 滚轮缩放：仅在演示外框激活后生效，避免抢占页面滚动
  svg.addEventListener(
    "wheel",
    (e) => {
      if (!frame.hasAttribute("data-active")) return;
      e.preventDefault();
      e.stopPropagation();
      scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale - e.deltaY * 0.3));
      draw();
    },
    { passive: false },
  );

  root.querySelectorAll<HTMLElement>("[data-nx-map-zoom]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.nxMapZoom;
      if (action === "reset") {
        scale = INITIAL_SCALE;
        translate = [VB_W / 2, VB_H / 1.7];
      } else {
        scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + (action === "in" ? 40 : -40)));
      }
      draw();
    });
  });

  draw();
}
