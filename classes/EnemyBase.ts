import BoardBase from "./BoardBase";

class EnemyBase {
  private position: { x: number; y: number };
  private path: [number, number][];
  private pathIndex: number;
  private speed: number;
  private currentBoard: BoardBase | null = null;

  constructor(board: BoardBase, speed: number = 0.01) {
    if (!board.path) {
      throw new Error("No path available in the board.");
    }

    this.path = board.path;
    this.pathIndex = 0;
    this.speed = speed;
    this.currentBoard = board;

    // Start at the first position in the path
    const [startY, startX] = this.path[0];
    this.position = { x: startX, y: startY };
  }

  // Updates the enemy's position by lerping towards the next point in the path
  update(): void {
    if (this.pathIndex >= this.path.length - 1) {
      console.log("Enemy has reached the end of the path.");
      return;
    }

    this.path = this.currentBoard?.path || []; // Get the current path from the board
    if (this.path.length === 0) {
      console.log("No path available.");
      return;
    }

    const [nextY, nextX] = this.path[this.pathIndex + 1];
    const target = { x: nextX, y: nextY };

    // Lerp towards the target position
    this.position.x += (target.x - this.position.x) * this.speed;
    this.position.y += (target.y - this.position.y) * this.speed;

    // Check if the enemy is close enough to the target to move to the next point
    this.pathIndex++;
    this.position = { x: target.x, y: target.y }; // Snap to the target
    if (
      Math.abs(this.position.x - target.x) < 0.01 &&
      Math.abs(this.position.y - target.y) < 0.01
    ) {
    }
  }

  // Gets the current position of the enemy
  getPosition(): { x: number; y: number } {
    return this.position;
  }
}

export default EnemyBase;
