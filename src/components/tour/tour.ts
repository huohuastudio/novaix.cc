// 产品能力展台的交互：自动轮播、功能点高亮联动、鼠标跟随倾斜、进场动画
import { placeTip, type Box } from "../demo/admin-frame";

/** 展台中后台界面的视口尺寸（与真实后台 1280×800 截图对应） */
export const TOUR_WIDTH = 1280;
export const TOUR_HEIGHT = 800;

/** 默认倾斜角度与鼠标跟随的最大偏移（度） */
const BASE_TILT = { rx: 7, ry: -13 };
const TILT_RANGE = 4;
/** 高亮框比目标区域外扩的距离（后台像素） */
const SPOT_PAD = 6;

/** 元素在后台界面中的位置。用 offset 累加，不受外层 3D 变换影响 */
function offsetBox(el: HTMLElement, app: HTMLElement): Box {
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== app) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { left, top, width: el.offsetWidth, height: el.offsetHeight };
}

function unionBox(boxes: Box[]): Box {
  const left = Math.min(...boxes.map((b) => b.left));
  const top = Math.min(...boxes.map((b) => b.top));
  const right = Math.max(...boxes.map((b) => b.left + b.width));
  const bottom = Math.max(...boxes.map((b) => b.top + b.height));
  return { left, top, width: right - left, height: bottom - top };
}

/** 计数动画：把元素文字中的第一个数字从 0 滚动到原值，保留前后缀与小数位 */
function countUp(el: HTMLElement) {
  const text = el.textContent ?? "";
  const match = text.match(/\d+(\.\d+)?/);
  if (!match || match.index === undefined) return;
  const target = Number(match[0]);
  const decimals = match[1] ? match[1].length - 1 : 0;
  const before = text.slice(0, match.index);
  const after = text.slice(match.index + match[0].length);
  const start = performance.now() + 300;
  const duration = 1100;
  el.textContent = before + (0).toFixed(decimals) + after;
  const step = (now: number) => {
    const p = Math.min(1, Math.max(0, (now - start) / duration));
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = before + (target * e).toFixed(decimals) + after;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = text;
  };
  requestAnimationFrame(step);
}

export function initTour(root: HTMLElement) {
  const items = Array.from(root.querySelectorAll<HTMLElement>("[data-tour-item]"));
  const stages = new Map(
    Array.from(root.querySelectorAll<HTMLElement>("[data-tour-stage]")).map((s) => [s.dataset.tourStage!, s]),
  );
  const stack = root.querySelector<HTMLElement>("[data-tour-stack]")!;
  const rigs = Array.from(stack.querySelectorAll<HTMLElement>(".tour-rig"));
  const column = root.querySelector<HTMLElement>("[data-tour-column]")!;
  const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
  const wide = window.matchMedia("(min-width: 1024px)");

  let index = Math.max(0, items.findIndex((i) => i.hasAttribute("data-active")));
  let inView = false;
  let hovering = false;
  let stopped = !motion.matches;

  // 后台界面按 1280 宽渲染后整体缩放：外框与浮层共用一个比例，直接写 transform，避免可继承变量触发整片样式重算
  const scaled = Array.from(stack.querySelectorAll<HTMLElement>(".nx-frame-inner, .tour-floats"));
  new ResizeObserver(() => {
    const transform = `scale(${stack.clientWidth / TOUR_WIDTH})`;
    scaled.forEach((el) => (el.style.transform = transform));
  }).observe(stack);

  // 列表按介绍最长的模块预留高度：各模块文字长短不一，否则切换时展台和下方内容会上下跳动
  const list = items[0].parentElement!;
  let listWidth = 0;
  new ResizeObserver(() => {
    if (list.clientWidth === listWidth) return;
    listWidth = list.clientWidth;
    const headers = items.reduce((h, item) => h + item.querySelector("h3")!.offsetHeight, 0);
    const detail = Math.max(...items.map((item) => item.querySelector<HTMLElement>(".tour-detail > div")!.scrollHeight));
    list.style.minHeight = `${headers + detail}px`;
  }).observe(list);

  const syncRunning = () => {
    root.toggleAttribute("data-stopped", stopped);
    root.toggleAttribute("data-running", inView && !hovering && !stopped);
  };

  // 进场动画只播一次；减少动态效果时不播放，直接保持最终状态
  const play = (stage: HTMLElement | undefined) => {
    if (!stage || stage.hasAttribute("data-played") || !inView || !motion.matches) return;
    stage.setAttribute("data-played", "");
    stage.querySelectorAll<HTMLElement>("[data-tour-count]").forEach(countUp);
  };

  const activeStage = () => stages.get(items[index].dataset.tourItem!);

  function select(i: number) {
    clearSpot();
    index = (i + items.length) % items.length;
    items.forEach((item, k) => {
      const on = k === index;
      item.toggleAttribute("data-active", on);
      item.querySelector("button")?.setAttribute("aria-expanded", String(on));
    });
    const id = items[index].dataset.tourItem;
    stages.forEach((stage, key) => {
      const on = key === id;
      if (on && stage.hidden) {
        // 先显示再激活，保留淡入与「从后方浮上来」的过渡起点
        stage.hidden = false;
        void stage.offsetWidth;
      }
      stage.toggleAttribute("data-active", on);
      // 淡出结束后隐藏，不再参与样式与布局
      if (!on && !stage.hidden) {
        setTimeout(() => {
          if (!stage.hasAttribute("data-active")) stage.hidden = true;
        }, 500);
      }
    });
    play(activeStage());
  }

  // 功能点高亮：目标可以是页面区域、浮层，或 nav:菜单名 指向侧边栏图标
  function setSpot(spec: string) {
    const stage = activeStage();
    if (!stage) return;
    clearSpot();
    const app = stage.querySelector<HTMLElement>("[data-nx-frame] .nx-app")!;
    const spot = stage.querySelector<HTMLElement>("[data-tour-spot]")!;

    let box: Box;
    let full = false;
    if (spec.startsWith("nav:")) {
      const title = spec.slice(4);
      const el = app.querySelector<HTMLElement>(`[data-slot=sidebar] [data-nx-tip="${title}"]`);
      if (!el) return;
      box = offsetBox(el, app);
      // 菜单较长，目标不在可视范围时滚动侧边栏，让它居中显示
      const scroller = el.closest<HTMLElement>("[data-slot=sidebar-content]");
      if (scroller) {
        const view = offsetBox(scroller, app);
        const max = scroller.scrollHeight - scroller.clientHeight;
        const top = Math.round(Math.min(max, Math.max(0, box.top - view.top - scroller.clientHeight / 2 + box.height / 2)));
        scroller.scrollTo({ top, behavior: motion.matches ? "smooth" : "auto" });
        box = { ...box, top: box.top - top };
      }
      placeTip(app, box, title, "right");
    } else {
      const targets = Array.from(stage.querySelectorAll<HTMLElement>(`[data-tour-target="${spec}"]`));
      if (targets.length === 0) return;
      const float = targets[0].closest<HTMLElement>("[data-tour-float]");
      if (float) {
        // 目标是浮层：整个界面变暗，浮层再抬高
        float.setAttribute("data-spot-on", "");
        full = true;
        box = { left: app.offsetWidth / 2, top: app.offsetHeight / 2, width: 0, height: 0 };
      } else {
        box = unionBox(targets.map((t) => offsetBox(t, app)));
      }
    }
    spot.toggleAttribute("data-full", full);
    const pad = full ? 0 : SPOT_PAD;
    spot.style.left = `${box.left - pad}px`;
    spot.style.top = `${box.top - pad}px`;
    spot.style.width = `${box.width + pad * 2}px`;
    spot.style.height = `${box.height + pad * 2}px`;
    // 首次出现时不从左上角滑入
    if (!spot.hasAttribute("data-show")) {
      spot.style.transition = "none";
      void spot.offsetWidth;
      spot.style.transition = "";
    }
    spot.setAttribute("data-show", "");
    stage.setAttribute("data-spot", "");
  }

  // 高亮只会出现在当前模块上
  function clearSpot() {
    const stage = activeStage();
    if (!stage?.hasAttribute("data-spot")) return;
    stage.removeAttribute("data-spot");
    stage.querySelector("[data-tour-spot]")?.removeAttribute("data-show");
    stage.querySelector("[data-spot-on]")?.removeAttribute("data-spot-on");
    const tip = stage.querySelector<HTMLElement>("[data-nx-frame] [data-nx-tooltip]");
    if (tip) tip.hidden = true;
    stage.querySelector("[data-nx-frame] [data-slot=sidebar-content]")?.scrollTo({ top: 0, behavior: motion.matches ? "smooth" : "auto" });
  }

  items.forEach((item, i) => {
    item.querySelector("button")?.addEventListener("click", () => {
      stopped = true;
      syncRunning();
      if (i !== index) select(i);
    });
    item.querySelectorAll<HTMLElement>("[data-spot]").forEach((li) => {
      li.addEventListener("pointerenter", () => {
        if (item.hasAttribute("data-active")) setSpot(li.dataset.spot!);
      });
      li.addEventListener("pointerleave", clearSpot);
    });
  });

  // 进度条走完切换到下一个模块
  root.addEventListener("animationend", (e) => {
    if ((e.target as HTMLElement).hasAttribute("data-tour-progress") && !stopped) select(index + 1);
  });

  // 悬停暂停，移开继续
  root.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse") return;
    hovering = true;
    syncRunning();
  });
  root.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "mouse") return;
    hovering = false;
    syncRunning();
  });

  new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      syncRunning();
      play(activeStage());
    },
    { threshold: 0.35 },
  ).observe(stack);

  motion.addEventListener("change", () => {
    if (!motion.matches) stopped = true;
    syncRunning();
  });

  // 鼠标跟随倾斜：目标角度平滑逼近，移开后回正
  const target = { ...BASE_TILT };
  const current = { ...BASE_TILT };
  let raf = 0;
  const tick = () => {
    current.rx += (target.rx - current.rx) * 0.08;
    current.ry += (target.ry - current.ry) * 0.08;
    rigs.forEach((rig) => {
      rig.style.setProperty("--rx", `${current.rx.toFixed(3)}deg`);
      rig.style.setProperty("--ry", `${current.ry.toFixed(3)}deg`);
    });
    const settled = Math.abs(target.rx - current.rx) < 0.01 && Math.abs(target.ry - current.ry) < 0.01;
    raf = settled ? 0 : requestAnimationFrame(tick);
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };
  column.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || !motion.matches || !wide.matches) return;
    const r = column.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    target.rx = BASE_TILT.rx - ny * TILT_RANGE;
    target.ry = BASE_TILT.ry + nx * TILT_RANGE;
    kick();
  });
  column.addEventListener("pointerleave", () => {
    target.rx = BASE_TILT.rx;
    target.ry = BASE_TILT.ry;
    kick();
  });

  syncRunning();
}
