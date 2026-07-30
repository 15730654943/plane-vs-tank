import type { Position } from '../types/game';

export interface AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

/**
 * AABB碰撞检测
 */
export function checkAABBCollision(a: AABB, b: AABB): boolean {
  return (
    a.minX < b.maxX &&
    a.maxX > b.minX &&
    a.minY < b.maxY &&
    a.maxY > b.minY
  );
}

/**
 * 判断点是否在AABB内
 */
export function pointInAABB(point: Position, box: AABB): boolean {
  return (
    point.x >= box.minX &&
    point.x <= box.maxX &&
    point.y >= box.minY &&
    point.y <= box.maxY
  );
}

/**
 * 圆形碰撞检测
 */
export function checkCircleCollision(a: Circle, b: Circle): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < a.radius + b.radius;
}

/**
 * 判断点是否在圆内
 */
export function pointInCircle(point: Position, circle: Circle): boolean {
  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

/**
 * 计算点到圆心的距离
 */
export function distanceToCircleCenter(point: Position, circle: Circle): number {
  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算点到线段的距离
 */
export function pointToSegmentDistance(
  point: Position,
  segmentStart: Position,
  segmentEnd: Position
): number {
  const dx = segmentEnd.x - segmentStart.x;
  const dy = segmentEnd.y - segmentStart.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return Math.sqrt(
      (point.x - segmentStart.x) ** 2 + (point.y - segmentStart.y) ** 2
    );
  }

  let t = ((point.x - segmentStart.x) * dx + (point.y - segmentStart.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = segmentStart.x + t * dx;
  const closestY = segmentStart.y + t * dy;

  return Math.sqrt(
    (point.x - closestX) ** 2 + (point.y - closestY) ** 2
  );
}

/**
 * 线段与线段相交检测
 */
export function segmentsIntersect(
  a1: Position,
  a2: Position,
  b1: Position,
  b2: Position
): boolean {
  const crossProduct = (p1: Position, p2: Position, p3: Position): number => {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  };

  const d1 = crossProduct(b1, b2, a1);
  const d2 = crossProduct(b1, b2, a2);
  const d3 = crossProduct(a1, a2, b1);
  const d4 = crossProduct(a1, a2, b2);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }

  if (d1 === 0 && pointOnSegment(a1, b1, b2)) return true;
  if (d2 === 0 && pointOnSegment(a2, b1, b2)) return true;
  if (d3 === 0 && pointOnSegment(b1, a1, a2)) return true;
  if (d4 === 0 && pointOnSegment(b2, a1, a2)) return true;

  return false;
}

function pointOnSegment(p: Position, segStart: Position, segEnd: Position): boolean {
  return (
    p.x <= Math.max(segStart.x, segEnd.x) &&
    p.x >= Math.min(segStart.x, segEnd.x) &&
    p.y <= Math.max(segStart.y, segEnd.y) &&
    p.y >= Math.min(segStart.y, segEnd.y)
  );
}

/**
 * AABB与圆形碰撞检测
 */
export function checkAABBCircleCollision(box: AABB, circle: Circle): boolean {
  const closestX = Math.max(box.minX, Math.min(circle.x, box.maxX));
  const closestY = Math.max(box.minY, Math.min(circle.y, box.maxY));

  const dx = circle.x - closestX;
  const dy = circle.y - closestY;

  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

/**
 * 计算两个位置之间的距离
 */
export function distance(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算距离的平方（避免开方运算，用于性能敏感场景）
 */
export function distanceSquared(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}
