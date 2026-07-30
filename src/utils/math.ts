import type { Position, Velocity } from '../types/game';

export interface Vector2 {
  x: number;
  y: number;
}

/**
 * 向量加法
 */
export function vecAdd(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

/**
 * 向量减法
 */
export function vecSub(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

/**
 * 向量数乘
 */
export function vecScale(v: Vector2, s: number): Vector2 {
  return { x: v.x * s, y: v.y * s };
}

/**
 * 向量点积
 */
export function vecDot(a: Vector2, b: Vector2): number {
  return a.x * b.x + a.y * b.y;
}

/**
 * 向量长度
 */
export function vecLength(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * 向量归一化
 */
export function vecNormalize(v: Vector2): Vector2 {
  const len = vecLength(v);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

/**
 * 向量旋转
 */
export function vecRotate(v: Vector2, angleRad: number): Vector2 {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos,
  };
}

/**
 * 计算从a指向b的角度（弧度）
 */
export function angleBetween(a: Position, b: Position): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * 将角度转换为方向向量
 */
export function angleToVector(angleRad: number): Vector2 {
  return {
    x: Math.cos(angleRad),
    y: Math.sin(angleRad),
  };
}

/**
 * 将弧度转换为角度
 */
export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * 将角度转换为弧度
 */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * 标准化角度到 [-PI, PI]
 */
export function normalizeAngleRad(rad: number): number {
  while (rad > Math.PI) rad -= Math.PI * 2;
  while (rad < -Math.PI) rad += Math.PI * 2;
  return rad;
}

/**
 * 标准化角度到 [0, 2PI]
 */
export function normalizeAngleRadPositive(rad: number): number {
  rad = rad % (Math.PI * 2);
  if (rad < 0) rad += Math.PI * 2;
  return rad;
}

/**
 * 线性插值
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * 向量线性插值
 */
export function vecLerp(a: Vector2, b: Vector2, t: number): Vector2 {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}

/**
 * 位置线性插值
 */
export function positionLerp(a: Position, b: Position, t: number): Position {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}

/**
 * 数值限制在[min, max]范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 平滑插值（dt为时间步长，speed为速度）
 */
export function smoothLerp(current: number, target: number, dt: number, speed: number = 5): number {
  return lerp(current, target, 1 - Math.exp(-speed * dt));
}

/**
 * 生成[min, max]范围内的随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成[min, max]范围内的随机浮点数
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * 在单位圆内生成随机点
 */
export function randomPointInCircle(radius: number = 1): Vector2 {
  const r = radius * Math.sqrt(Math.random());
  const theta = Math.random() * Math.PI * 2;
  return {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
  };
}

/**
 * 在矩形范围内生成随机点
 */
export function randomPointInRect(minX: number, maxX: number, minY: number, maxY: number): Vector2 {
  return {
    x: randomFloat(minX, maxX),
    y: randomFloat(minY, maxY),
  };
}

/**
 * 从数组中随机选择一个元素
 */
export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 以给定概率返回true
 */
export function randomBool(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * 计算两个位置之间的曼哈顿距离
 */
export function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
