// 后台 shadcn 组件的 class 定义，逐字摘自 ui/src/components/ui/*.tsx，用于展台中的后台界面还原。
// 合并规则与后台一致（clsx + tailwind-merge），页面上额外传入的 className 会按后台的方式覆盖。
// 弹层类组件（对话框、弹出框、下拉）去掉了 fixed 定位与开合动画，由 TourFloat 负责摆放。
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 展台固定按 1280 宽的后台视口渲染：后台 class 中的响应式前缀（sm:/md:/lg:/xl:）必须手动换成该宽度下生效的结果，
// 不能在运行时替换——Tailwind 只为源码中出现过的 class 生成样式。这里检查并报错，避免遗漏。
const RESPONSIVE = /(^|:)(sm|md|lg|xl|2xl|max-sm|max-md|max-lg|max-xl|max-2xl):/;

export function cn(...inputs: ClassValue[]) {
  const merged = twMerge(clsx(inputs));
  const bad = merged.split(/\s+/).filter((c) => RESPONSIVE.test(c));
  if (bad.length) throw new Error(`展台 class 含响应式前缀，请按 1280 宽手动展开：${bad.join(" ")}`);
  return merged;
}

// ── Button ──

const buttonBase =
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer transition-all outline-none select-none active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

const buttonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline:
    "bg-secondary text-secondary-foreground hover:bg-[oklch(0.91_0_0)] aria-expanded:bg-[oklch(0.91_0_0)] dark:bg-input/30 dark:hover:bg-input/60 dark:aria-expanded:bg-input/60",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
  ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
  destructive:
    "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
  link: "text-primary underline-offset-4 hover:underline",
  field:
    "border border-input bg-transparent font-normal focus-visible:border-foreground/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 dark:aria-expanded:bg-input/50",
};

const buttonSizes = {
  default: "h-8 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
  xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
  sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-3 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
  lg: "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
  icon: "size-8",
  "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
  "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
  "icon-lg": "size-9",
};

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

export function button(variant: ButtonVariant = "default", size: ButtonSize = "default", className?: ClassValue) {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

// ── Badge ──

const badgeBase =
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!";

const badgeVariants = {
  default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
  secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
  destructive:
    "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
  outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
  ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
  link: "text-primary underline-offset-4 hover:underline",
};

export type BadgeVariant = keyof typeof badgeVariants;

export function badge(variant: BadgeVariant = "default", className?: ClassValue) {
  return cn(badgeBase, badgeVariants[variant], className);
}

// ── 表单 ──

export function input(className?: ClassValue) {
  return cn(
    "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-foreground/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30 dark:disabled:bg-input/80 dark:focus-visible:border-foreground/60 dark:aria-invalid:border-destructive/50",
    className,
  );
}

export function textarea(className?: ClassValue) {
  return cn(
    "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-foreground/40 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30 dark:disabled:bg-input/80 dark:focus-visible:border-foreground/60 dark:aria-invalid:border-destructive/50",
    className,
  );
}

export function label(className?: ClassValue) {
  return cn(
    "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
    className,
  );
}

export function selectTrigger(className?: ClassValue) {
  return cn(
    "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-placeholder:text-muted-foreground data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:focus-visible:border-foreground/60 dark:aria-invalid:border-destructive/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    className,
  );
}

export function checkbox(className?: ClassValue) {
  return cn(
    "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
    className,
  );
}

export function switchRoot(className?: ClassValue) {
  return cn(
    "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 outline-none data-checked:bg-primary data-unchecked:bg-black/15 dark:data-unchecked:bg-white/20 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[size=default]:h-6 data-[size=default]:w-10 data-[size=sm]:h-4 data-[size=sm]:w-7",
    className,
  );
}

export const switchThumb =
  "pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-4 group-data-[size=sm]/switch:data-checked:translate-x-3 data-unchecked:translate-x-0";

export function separator(className?: ClassValue) {
  return cn("shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px", className);
}

// ── Table ──

export function table(className?: ClassValue) {
  return cn("w-full caption-bottom text-sm", className);
}

export function tableHeader(className?: ClassValue) {
  return cn("bg-muted [&_tr]:border-b", className);
}

export function tableBody(className?: ClassValue) {
  return cn("[&_tr:last-child]:border-0", className);
}

export function tableRow(className?: ClassValue) {
  return cn("border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted", className);
}

export function tableHead(className?: ClassValue) {
  return cn("h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0", className);
}

export function tableCell(className?: ClassValue) {
  return cn("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", className);
}

// ── Tabs ──

export function tabs(className?: ClassValue) {
  return cn("group/tabs flex gap-2 data-horizontal:flex-col", className);
}

export function tabsList(variant: "default" | "line" = "default", className?: ClassValue) {
  return cn(
    "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
    variant === "default" ? "bg-muted" : "gap-1 bg-transparent",
    className,
  );
}

export function tabsTrigger(className?: ClassValue) {
  return cn(
    "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
    "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
    "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
    className,
  );
}

// ── 弹层 ──

/** 对话框内容（不含 fixed 居中定位与动画） */
export function dialogContent(className?: ClassValue) {
  return cn("grid w-full gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground shadow-lg outline-none", className);
}

export function dialogHeader(className?: ClassValue) {
  return cn("flex flex-col gap-2", className);
}

export function dialogFooter(className?: ClassValue) {
  return cn("-mx-4 -mb-4 flex flex-row gap-2 rounded-b-xl bg-muted/50 p-4 justify-end", className);
}

export function dialogTitle(className?: ClassValue) {
  return cn("font-heading text-base leading-none font-medium", className);
}

export function dialogDescription(className?: ClassValue) {
  return cn("text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground", className);
}

/** 表格行操作的图标按钮（普通 / 危险操作） */
export const rowAction = button("ghost", "icon", "size-8");
export const rowActionDanger = button("ghost", "icon", "size-8 text-destructive hover:text-destructive");

/** 对话框右上角关闭按钮 */
export const dialogClose = button("ghost", "icon-sm", "absolute top-2 right-2");

/** 弹出框内容（不含定位与动画） */
export function popoverContent(className?: ClassValue) {
  return cn(
    "z-50 flex w-72 flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden",
    className,
  );
}
