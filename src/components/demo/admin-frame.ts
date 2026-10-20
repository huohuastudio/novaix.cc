// 后台演示外框的交互：缩放适配、滚动激活、侧边栏收起、分组折叠、提示框

export const APP_WIDTH = 1440;
export const APP_HEIGHT = 900;
export const CHROME_HEIGHT = 44;

const THEME_LABELS: Record<string, string> = { light: "浅色", dark: "深色", auto: "跟随系统" };

// Radix 把箭头元素尺寸（size-2.5）计入偏移，sideOffset 为 0 时内容与触发元素间距为 10px
const TOOLTIP_GAP = 10;
// 箭头为 10px 方块旋转 45°，中心落在内容边缘内侧 2px
const ARROW_INSET = 2 - 5;

/**
 * 后台界面当前的视觉缩放比例，供图表、地图把鼠标坐标换算回后台坐标。
 * 取实际渲染宽度，以便把外层的倾斜、缩放动画也计算在内。
 */
export function frameScale(el: Element) {
  const app = el.closest<HTMLElement>(".nx-app");
  return app ? app.getBoundingClientRect().width / app.offsetWidth : 1;
}

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** 在后台坐标系中显示提示框：side 为 right 时显示在目标右侧，否则显示在下方 */
export function placeTip(app: HTMLElement, box: Box, text: string, side: "right" | "bottom") {
  const tip = app.querySelector<HTMLElement>("[data-nx-tooltip]")!;
  const tipArrow = tip.querySelector<HTMLElement>("[data-nx-tooltip-arrow]")!;
  tip.querySelector<HTMLElement>("[data-nx-tooltip-text]")!.textContent = text;
  tip.hidden = false;
  const w = tip.offsetWidth;
  const h = tip.offsetHeight;
  if (side === "right") {
    tip.style.left = `${box.left + box.width + TOOLTIP_GAP}px`;
    tip.style.top = `${box.top + box.height / 2 - h / 2}px`;
    tipArrow.style.cssText = `left:${ARROW_INSET}px;top:50%;transform:translateY(-50%) rotate(45deg)`;
  } else {
    // 贴近右边缘时向左收，与 Radix 的碰撞处理一致
    const left = Math.min(box.left + box.width / 2 - w / 2, app.offsetWidth - w);
    tip.style.left = `${left}px`;
    tip.style.top = `${box.top + box.height + TOOLTIP_GAP}px`;
    const arrowX = box.left + box.width / 2 - left;
    tipArrow.style.cssText = `top:${ARROW_INSET}px;left:${arrowX}px;transform:translateX(-50%) rotate(45deg)`;
  }
}

export function initAdminFrame(frame: HTMLElement) {
  const app = frame.querySelector<HTMLElement>(".nx-app")!;

  // 缩放：按外框宽度等比缩放后台界面（app 的布局宽度即后台视口宽度）
  const resize = () => frame.style.setProperty("--nx-s", String(frame.clientWidth / app.offsetWidth));
  new ResizeObserver(resize).observe(frame);
  resize();

  // 滚动激活：点击外框后才允许内部滚动，移出后恢复为页面滚动
  frame.addEventListener("pointerdown", () => frame.setAttribute("data-active", ""));
  frame.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") frame.removeAttribute("data-active");
  });

  // 侧边栏收起为图标模式
  const sidebar = app.querySelector<HTMLElement>("[data-slot=sidebar]")!;
  app.querySelector("[data-nx-sidebar-trigger]")?.addEventListener("click", () => {
    const collapsed = sidebar.dataset.state === "expanded";
    sidebar.dataset.state = collapsed ? "collapsed" : "expanded";
    sidebar.dataset.collapsible = collapsed ? "icon" : "";
    hideTip();
  });

  // 分组折叠
  app.querySelectorAll<HTMLElement>("[data-nx-collapse]").forEach((label) => {
    label.addEventListener("click", () => {
      const root = label.closest<HTMLElement>("[data-slot=collapsible]")!;
      const content = root.querySelector<HTMLElement>("[data-slot=collapsible-content]")!;
      const open = root.dataset.state !== "open";
      const state = open ? "open" : "closed";
      root.dataset.state = state;
      label.dataset.state = state;
      content.dataset.state = state;
      label.setAttribute("aria-expanded", String(open));
      content.hidden = !open;
    });
  });

  // 提示框
  const tip = app.querySelector<HTMLElement>("[data-nx-tooltip]")!;

  function hideTip() {
    tip.hidden = true;
  }

  function showTip(target: HTMLElement) {
    if (target.hasAttribute("data-nx-tip-collapsed") && sidebar.dataset.state !== "collapsed") return;
    const s = frameScale(app);
    const base = app.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    const box = {
      left: (r.left - base.left) / s,
      top: (r.top - base.top) / s,
      width: r.width / s,
      height: r.height / s,
    };
    const text = target.hasAttribute("data-nx-tip-theme")
      ? THEME_LABELS[document.documentElement.dataset.theme ?? "auto"] ?? "跟随系统"
      : target.dataset.nxTip ?? "";
    placeTip(app, box, text, target.dataset.nxTipSide === "right" ? "right" : "bottom");
  }

  app.querySelectorAll<HTMLElement>("[data-nx-tip]").forEach((el) => {
    el.addEventListener("pointerenter", () => showTip(el));
    el.addEventListener("pointerleave", hideTip);
    el.addEventListener("click", hideTip);
  });
}
