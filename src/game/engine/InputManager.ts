import { InputState } from '../types';

/**
 * 输入管理器
 * 键盘 (WASD/空格/Shift/E/数字键) 和鼠标输入
 */
export class InputManager {
  private state: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
    special: false,
    sprint: false,
    shield: false,
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    slot1: false,
    slot2: false,
    slot3: false,
    slot4: false,
    slot5: false,
  };

  private canvas: HTMLCanvasElement | null = null;
  private mouseWorldX = 0;
  private mouseWorldY = 0;

  // 按键映射
  private keyMap: Record<string, keyof InputState> = {
    'w': 'up',
    'W': 'up',
    'ArrowUp': 'up',
    's': 'down',
    'S': 'down',
    'ArrowDown': 'down',
    'a': 'left',
    'A': 'left',
    'ArrowLeft': 'left',
    'd': 'right',
    'D': 'right',
    'ArrowRight': 'right',
    ' ': 'shoot',
    'Space': 'shoot',
    'Shift': 'sprint',
    'ShiftLeft': 'sprint',
    'ShiftRight': 'sprint',
    'e': 'special',
    'E': 'special',
    'q': 'shield',
    'Q': 'shield',
    '1': 'slot1',
    '2': 'slot2',
    '3': 'slot3',
    '4': 'slot4',
    '5': 'slot5',
  };

  private handlers: { keydown: (e: KeyboardEvent) => void; keyup: (e: KeyboardEvent) => void; mousedown: (e: MouseEvent) => void; mouseup: (e: MouseEvent) => void; mousemove: (e: MouseEvent) => void; contextmenu: (e: Event) => void };

  constructor() {
    this.handlers = {
      keydown: this.onKeyDown.bind(this),
      keyup: this.onKeyUp.bind(this),
      mousedown: this.onMouseDown.bind(this),
      mouseup: this.onMouseUp.bind(this),
      mousemove: this.onMouseMove.bind(this),
      contextmenu: (e) => e.preventDefault(),
    };

    this.attach();
  }

  attachCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  attach(): void {
    window.addEventListener('keydown', this.handlers.keydown);
    window.addEventListener('keyup', this.handlers.keyup);
    window.addEventListener('mousedown', this.handlers.mousedown);
    window.addEventListener('mouseup', this.handlers.mouseup);
    window.addEventListener('mousemove', this.handlers.mousemove);
    window.addEventListener('contextmenu', this.handlers.contextmenu);
  }

  detach(): void {
    window.removeEventListener('keydown', this.handlers.keydown);
    window.removeEventListener('keyup', this.handlers.keyup);
    window.removeEventListener('mousedown', this.handlers.mousedown);
    window.removeEventListener('mouseup', this.handlers.mouseup);
    window.removeEventListener('mousemove', this.handlers.mousemove);
    window.removeEventListener('contextmenu', this.handlers.contextmenu);
  }

  private onKeyDown(e: KeyboardEvent): void {
    const action = this.keyMap[e.key] || this.keyMap[e.code];
    if (action) {
      (this.state as unknown as Record<string, boolean>)[action] = true;
      // 阻止默认行为（如空格滚动页面）
      if (['Space', ' '].includes(e.key) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    const action = this.keyMap[e.key] || this.keyMap[e.code];
    if (action) {
      (this.state as unknown as Record<string, boolean>)[action] = false;
    }
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button === 0) {
      this.state.mouseDown = true;
      this.state.shoot = true;
    }
  }

  private onMouseUp(e: MouseEvent): void {
    if (e.button === 0) {
      this.state.mouseDown = false;
      this.state.shoot = false;
    }
  }

  private onMouseMove(e: MouseEvent): void {
    if (this.canvas) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.state.mouseX = (e.clientX - rect.left) * scaleX;
      this.state.mouseY = (e.clientY - rect.top) * scaleY;
    } else {
      this.state.mouseX = e.clientX;
      this.state.mouseY = e.clientY;
    }
  }

  getState(): InputState {
    return { ...this.state };
  }

  /**
   * 获取当前移动方向向量（已归一化）
   */
  getMovementDirection(): { x: number; y: number } {
    let dx = 0;
    let dy = 0;
    if (this.state.up) dy -= 1;
    if (this.state.down) dy += 1;
    if (this.state.left) dx -= 1;
    if (this.state.right) dx += 1;

    // 归一化
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
    }

    return { x: dx, y: dy };
  }

  /**
   * 获取四方向输入（坦克用）
   */
  getCardinalDirection(): { x: number; y: number; primary: 'x' | 'y' | null } {
    let dx = 0;
    let dy = 0;
    if (this.state.up) dy -= 1;
    if (this.state.down) dy += 1;
    if (this.state.left) dx -= 1;
    if (this.state.right) dx += 1;

    // 坦克只能四方向移动，优先水平方向
    let primary: 'x' | 'y' | null = null;
    if (dx !== 0 && dy !== 0) {
      // 同时按下时优先最近按下的方向，简单处理为优先水平
      primary = 'x';
      dy = 0;
    } else if (dx !== 0) {
      primary = 'x';
    } else if (dy !== 0) {
      primary = 'y';
    }

    return { x: dx, y: dy, primary };
  }

  setMouseWorldPos(x: number, y: number): void {
    this.mouseWorldX = x;
    this.mouseWorldY = y;
  }

  getMouseWorldPos(): { x: number; y: number } {
    return { x: this.mouseWorldX, y: this.mouseWorldY };
  }

  reset(): void {
    this.state = {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      special: false,
      sprint: false,
      shield: false,
      mouseX: this.state.mouseX,
      mouseY: this.state.mouseY,
      mouseDown: false,
      slot1: false,
      slot2: false,
      slot3: false,
      slot4: false,
      slot5: false,
    };
  }
}
