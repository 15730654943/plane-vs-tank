import { Entity } from './Entity';
import { InputState, CharacterType } from '../types';
import { CHARACTER_CONFIGS } from '../config/characters';
import { CHARACTER_WEAPONS } from '../config/weapons';
import { calculateDamage } from '../config/constants';

export interface PlayerStats {
  kills: number;
  deaths: number;
  totalDamage: number;
}

/**
 * 玩家实体基类
 */
export abstract class Player extends Entity {
  name: string;
  characterType: CharacterType;
  team: number;

  // 生命
  hp: number;
  maxHp: number;

  // 能量
  energy: number;
  maxEnergy: number;
  energyRegen: number;

  // 防御
  armor: number;
  baseArmor: number;
  tempShield = 0;

  // 移动
  speed: number;
  baseSpeed: number;

  // 状态效果
  damageMultiplier = 1;
  speedMultiplier = 1;
  invincible = false;

  // 计时器（单位：秒）
  invincibleTimer = 0;
  armorBoostTimer = 0;
  damageBoostTimer = 0;
  speedBoostTimer = 0;
  shieldTimer = 0;

  // 武器
  lastFireTime = 0;
  specialCooldownTimer = 0;

  // 状态
  isDead = false;
  respawnTimer = 0;
  isSprinting = false;
  sprintTimer = 0;

  // 统计
  kills = 0;
  deaths = 0;
  totalDamage = 0;

  // 输入
  input: InputState | null = null;

  // 护盾冷却
  shieldCooldownTimer = 0;

  constructor(
    name: string,
    characterType: CharacterType,
    team: number,
    x: number,
    y: number
  ) {
    const config = CHARACTER_CONFIGS[characterType];
    super(x, y, config.size.width, config.size.height);
    this.name = name;
    this.characterType = characterType;
    this.team = team;

    this.maxHp = config.maxHp;
    this.hp = config.maxHp;
    this.maxEnergy = config.maxEnergy;
    this.energy = config.maxEnergy;
    this.energyRegen = config.energyRegen;
    this.baseSpeed = config.baseSpeed;
    this.speed = config.baseSpeed;
    this.baseArmor = config.baseArmor;
    this.armor = config.baseArmor;
  }

  update(dt: number): void {
    if (!this.active) return;

    if (this.isDead) {
      this.respawnTimer -= dt / 1000;
      if (this.respawnTimer <= 0) {
        this.respawn();
      }
      return;
    }

    // 能量恢复
    this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegen * (dt / 1000));

    // 更新计时器
    this.updateTimers(dt / 1000);

    // 更新速度/护甲倍率
    this.speed = this.baseSpeed * this.speedMultiplier;
    this.armor = this.baseArmor + (this.armorBoostTimer > 0 ? 20 : 0);

    // 处理输入
    if (this.input) {
      this.handleInput(dt);
    }

    // 边界限制
    this.clampToMap();
  }

  protected updateTimers(dtSeconds: number): void {
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dtSeconds;
      if (this.invincibleTimer <= 0) this.invincible = false;
    }
    if (this.armorBoostTimer > 0) {
      this.armorBoostTimer -= dtSeconds;
    }
    if (this.damageBoostTimer > 0) {
      this.damageBoostTimer -= dtSeconds;
      if (this.damageBoostTimer <= 0) this.damageMultiplier = 1;
    }
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= dtSeconds;
      if (this.speedBoostTimer <= 0) this.speedMultiplier = 1;
    }
    if (this.shieldTimer > 0) {
      this.shieldTimer -= dtSeconds;
      if (this.shieldTimer <= 0) this.tempShield = 0;
    }
    if (this.specialCooldownTimer > 0) {
      this.specialCooldownTimer -= dtSeconds;
    }
    if (this.sprintTimer > 0) {
      this.sprintTimer -= dtSeconds;
      if (this.sprintTimer <= 0) {
        this.isSprinting = false;
        this.speedMultiplier = 1;
      }
    }
    if (this.shieldCooldownTimer > 0) {
      this.shieldCooldownTimer -= dtSeconds;
    }
  }

  abstract handleInput(dt: number): void;
  abstract render(ctx: CanvasRenderingContext2D, alpha?: number): void;

  /**
   * 受到伤害
   */
  takeDamage(baseDamage: number, attackerMultiplier: number): number {
    if (!this.active || this.isDead || this.invincible) return 0;

    let dmg = calculateDamage(baseDamage, attackerMultiplier, this.armor);

    // 先消耗临时护盾
    if (this.tempShield > 0) {
      const absorb = Math.min(this.tempShield, dmg);
      this.tempShield -= absorb;
      dmg -= absorb;
    }

    this.hp -= dmg;

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }

    return dmg;
  }

  /**
   * 治疗
   */
  heal(amount: number): void {
    if (this.isDead) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  /**
   * 恢复能量
   */
  addEnergy(amount: number): void {
    this.energy = Math.min(this.maxEnergy, this.energy + amount);
  }

  /**
   * 消耗能量
   */
  consumeEnergy(amount: number): boolean {
    if (this.energy >= amount) {
      this.energy -= amount;
      return true;
    }
    return false;
  }

  die(): void {
    this.isDead = true;
    this.deaths++;
    this.respawnTimer = 3; // 3秒后重生
    this.tempShield = 0;
    this.isSprinting = false;
  }

  respawn(): void {
    this.isDead = false;
    this.hp = this.maxHp;
    this.energy = this.maxEnergy;
    this.invincible = true;
    this.invincibleTimer = 2; // 重生后2秒无敌
  }

  abstract setMapSize(width: number, height: number): void;

  clampToMap(): void {
    // 子类中根据地图大小限制
  }

  setMapBounds(mapWidth: number, mapHeight: number): void {
    this.position.x = Math.max(0, Math.min(mapWidth - this.width, this.position.x));
    this.position.y = Math.max(0, Math.min(mapHeight - this.height, this.position.y));
  }

  getFireCooldownMs(): number {
    const weapons = CHARACTER_WEAPONS[this.characterType];
    return weapons.primary.fireRate * 1000;
  }

  canFire(): boolean {
    return Date.now() - this.lastFireTime >= this.getFireCooldownMs();
  }

  onFire(): void {
    this.lastFireTime = Date.now();
  }

  getDamageMultiplier(): number {
    return this.damageMultiplier;
  }
}
