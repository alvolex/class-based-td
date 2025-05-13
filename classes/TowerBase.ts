// filepath: c:\Utveckling\class-based-td\classes\TowerBase.ts
import BoardBase from "./BoardBase";
import EnemyBase from "./EnemyBase";

class TowerBase {
  private board: BoardBase;
  private damage: number;
  private attackSpeed: number; // milliseconds between checks
  private range: number; // range in cells
  private position: { x: number; y: number };
  private intervalId: number | null = null;

  constructor(
    board: BoardBase,
    x: number,
    y: number,
    damage: number = 10,
    range: number = 3,
    attackSpeed: number = 100
  ) {
    this.board = board;
    this.position = { x, y };
    this.damage = damage;
    this.range = range;
    this.attackSpeed = attackSpeed;

    // Place tower on the board
    this.board.addTower(x, y);
    board.registerTower(this);

    // Start repeating attack checks
    this.intervalId = window.setInterval(
      () => this.attackClosestEnemy(),
      this.attackSpeed
    );
  }

  // Find and damage the closest enemy within range
  private attackClosestEnemy(): void {
    let enemies = this.board.getEnemies();

    if (enemies.length === 0) {
      return;
    }

    let closest: EnemyBase | null = null;
    let minDist = Infinity;

    // remove enemies with the isDead tag
    enemies = enemies.filter((enemy) => !enemy.isDead);
    if (enemies.length === 0) {
      return;
    }

    for (const enemy of enemies) {
      const pos = enemy.getPosition();
      const dx = pos.x - this.position.x;
      const dy = pos.y - this.position.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= this.range && dist < minDist) {
        minDist = dist;
        closest = enemy;
      }
    }

    if (closest) {
      closest.takeDamage(this.damage);
    }
  }

  // Stop the tower from attacking
  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default TowerBase;
