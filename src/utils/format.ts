/**
 * 将秒数格式化为 mm:ss 或 hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  const isNegative = seconds < 0;
  seconds = Math.abs(Math.floor(seconds));

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${isNegative ? '-' : ''}${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${isNegative ? '-' : ''}${pad(mins)}:${pad(secs)}`;
}

/**
 * 将日期格式化为相对时间（如：3分钟前）
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date().getTime();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;
  return new Date(date).toLocaleDateString('zh-CN');
}

/**
 * 格式化数字，添加千分位分隔符
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

/**
 * 将大数字缩写（如 1500 -> 1.5K）
 */
export function formatCompactNumber(num: number): string {
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
  if (abs >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (abs >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

/**
 * 计算百分比，保留指定小数位
 */
export function calculatePercentage(value: number, total: number, decimals: number = 1): string {
  if (total === 0) return '0%';
  const pct = (value / total) * 100;
  return pct.toFixed(decimals) + '%';
}

/**
 * 计算比率（如 K/D）
 */
export function calculateRatio(numerator: number, denominator: number, decimals: number = 2): string {
  if (denominator === 0) return numerator > 0 ? '∞' : '0.00';
  return (numerator / denominator).toFixed(decimals);
}

/**
 * 格式化ELO分数变化（带 + 或 - 符号）
 */
export function formatEloChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change}`;
}

/**
 * 截断文本并添加省略号
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * 将秒数格式化为中文描述
 */
export function formatDurationChinese(seconds: number): string {
  seconds = Math.floor(seconds);
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hrs > 0) parts.push(`${hrs}小时`);
  if (mins > 0) parts.push(`${mins}分钟`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}秒`);

  return parts.join('');
}
