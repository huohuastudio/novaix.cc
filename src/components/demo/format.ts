// 与后台一致的格式化函数（金额单位为分，内存 MB，磁盘 GB）

export const currencySymbol = "¥";

export function formatAmount(cents: number) {
  return `${currencySymbol}${(cents / 100).toFixed(2)}`;
}

export function formatMemory(mb: number) {
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} GB`;
  return `${mb} MB`;
}

export function formatDisk(gb: number) {
  if (gb >= 1024) return `${(gb / 1024).toFixed(1)} TB`;
  return `${gb} GB`;
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

// 演示时间统一按北京时间展示，避免构建机时区影响
const BEIJING_OFFSET = 8 * 3600_000;

function beijing(date: Date) {
  return new Date(date.getTime() + BEIJING_OFFSET);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** MM/DD HH:mm */
export function formatCompactDateTime(date: Date) {
  const d = beijing(date);
  return `${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** MM/DD */
export function formatShortDate(date: Date) {
  const d = beijing(date);
  return `${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())}`;
}

/** MM-DD，用于收入趋势横轴 */
export function formatChartDate(date: Date) {
  const d = beijing(date);
  return `${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** 北京时间当天 0 点往前推 n 天后的时间 */
export function beijingDayStart(now: Date, daysAgo: number) {
  const d = beijing(now);
  const start = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - daysAgo);
  return new Date(start - BEIJING_OFFSET);
}
