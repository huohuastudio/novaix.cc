// 后台 shadcn 组件渲染后的完整 class，摘自实际 DOM。
// 依赖视口的类（fixed、h-svh、md: 前缀）已改为相对演示外框计算。

export const sidebarMenuButton =
  "peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm";

export const sidebarMenuButtonLg =
  "peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-12 text-sm group-data-[collapsible=icon]:p-0!";

export const sidebarGroupLabel =
  "flex h-8 shrink-0 items-center rounded-md px-2 font-medium ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-150 ease-in-out group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

export const ghostButton =
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer transition-all outline-none select-none active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 size-8";

export const ghostButtonSm =
  "group/button inline-flex shrink-0 items-center justify-center text-sm font-medium whitespace-nowrap cursor-pointer transition-all outline-none select-none active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 size-7 rounded-[min(var(--radius-md),12px)]";

export const tabsList =
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none bg-muted h-8";

export const tabsTrigger =
  "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent py-0.5 font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground px-2.5 text-xs cursor-pointer";

const badgeBase =
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border font-medium whitespace-nowrap transition-all text-2xs px-1.5 py-0";

export const badge: Record<string, string> = {
  default: `${badgeBase} border-transparent bg-primary text-primary-foreground`,
  secondary: `${badgeBase} border-transparent bg-secondary text-secondary-foreground`,
  destructive: `${badgeBase} border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20`,
  outline: `${badgeBase} border-border text-foreground`,
};

export const selectTrigger =
  "flex items-center justify-between rounded-lg border border-input bg-transparent py-2 whitespace-nowrap transition-colors outline-none select-none focus-visible:border-foreground/40 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 h-7 w-auto gap-1 border-none px-2 text-xs shadow-none cursor-default";

export const selectContent =
  "absolute z-50 min-w-full overflow-x-hidden overflow-y-auto rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-border/50";

export const selectItem =
  "relative flex w-full cursor-default items-center gap-2 rounded-lg py-1.5 pr-3 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground";
