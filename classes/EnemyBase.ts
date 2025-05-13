import BoardBase from "./BoardBase";

class EnemyBase {
  private position: { x: number; y: number };
  private path: [number, number][];
  private pathIndex: number;
  private speed: number;
  private currentBoard: BoardBase | null = null;
  private temporaryPath: [number, number][] | null = null;
  public lastPosition: { x: number; y: number } | null = null;
  public health: number = 100;

  constructor(board: BoardBase, speed: number = 0.01, health: number = 100) {
    this.health = health;
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
    if (this.pathIndex >= this.path.length - 1 && !this.temporaryPath) {
      console.log("Enemy has reached the end of the path.");
      return;
    }

    this.path = this.currentBoard?.path || []; // Get the current path from the board
    if (this.path.length === 0) {
      console.log("No path available.");
      return;
    }

    // Check if the enemy is far from the path
    const currentPoint = [Math.floor(this.position.y), Math.floor(this.position.x)] as [number, number];
    const nearestPoint = this.findNearestPathPoint(currentPoint);

    if (this.temporaryPath) {
      // Follow the temporary path
      this.followPath(this.temporaryPath, true);
      if (this.pathIndex >= this.temporaryPath.length - 1) {
        this.temporaryPath = null; // Clear temporary path once reached

        // get pathIndex of the nearest point
        const nearestPointIndex = this.path.findIndex(
          (point) => point[0] === nearestPoint![0] && point[1] === nearestPoint![1]
        );

        this.pathIndex = nearestPointIndex;
      }
    } else if (nearestPoint && this.calculateDistance(currentPoint, nearestPoint) > 1) {
      // Calculate a temporary path to the nearest point in the main path
      this.temporaryPath = this.calculatePathToPoint(currentPoint, nearestPoint);
      this.pathIndex = 0; // Reset pathIndex for the temporary path
      this.followPath(this.temporaryPath, true);
    } else {
      // Follow the main path
      this.followPath(this.path);
    }
  }

  private followPath(path: [number, number][], isTemporaryPath: boolean = false): void {
    if (this.pathIndex >= path.length - 1) {
      return;
    }

    const [nextY, nextX] = path[this.pathIndex + 1];
    const target = { x: nextX, y: nextY };

    // Use lastPosition as previous cell coordinates
    const oldX = this.lastPosition?.x ?? Math.floor(this.position.x);
    const oldY = this.lastPosition?.y ?? Math.floor(this.position.y);

    // Lerp towards the target position
    this.position.x += (target.x - this.position.x) * this.speed;
    this.position.y += (target.y - this.position.y) * this.speed;

    // Check if the enemy is close enough to the target to move to the next point
    if (
      Math.abs(this.position.x - target.x) < 0.01 &&
      Math.abs(this.position.y - target.y) < 0.01
    ) {
      this.currentBoard?.setEnemyPosition(
        nextX,
        nextY,
        this.lastPosition?.x ?? oldX,
        this.lastPosition?.y ?? oldY,
        isTemporaryPath
      );
      this.position = { x: target.x, y: target.y };
      this.pathIndex++;
      this.lastPosition = { x: target.x, y: target.y }; // Update lastPosition to the current position
    }
  }

  private findNearestPathPoint(currentPoint: [number, number]): [number, number] | null {
    let nearestPoint: [number, number] | null = null;
    let minDistance = Infinity;

    for (const point of this.path) {
      const distance = this.calculateDistance(currentPoint, point);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    }

    return nearestPoint;
  }

  private calculateDistance(
    [y1, x1]: [number, number],
    [y2, x2]: [number, number]
  ): number {
    return Math.abs(y1 - y2) + Math.abs(x1 - x2);
  }

  private calculatePathToPoint(
    start: [number, number],
    end: [number, number]
  ): [number, number][] {
    if (!this.currentBoard) {
      return [];
    }

    const openSet: [number, number][] = [start];
    const cameFrom: Map<string, [number, number]> = new Map();
    const processed: Set<string> = new Set(); // Track processed nodes
    const key = ([y, x]: [number, number]) => `${y},${x}`;
    const { rows, cols } = this.currentBoard.getGridDimensions();

    while (openSet.length > 0) {
      const current = openSet.shift()!;
      const currentKey = key(current);

      if (processed.has(currentKey)) {
        continue; // Skip already processed nodes
      }

      processed.add(currentKey); // Mark the current node as processed

      if (current[0] === end[0] && current[1] === end[1]) {
        const path: [number, number][] = [];
        let temp: [number, number] | undefined = current;
        while (temp) {
          path.unshift(temp);
          temp = cameFrom.get(key(temp));
        }
        return path;
      }

      const [cy, cx] = current;
      const neighbors: [number, number][] = [
        [cy - 1, cx] as [number, number],
        [cy + 1, cx] as [number, number],
        [cy, cx - 1] as [number, number],
        [cy, cx + 1] as [number, number],
      ].filter(
        ([ny, nx]) =>
          ny >= 0 &&
          ny < rows &&
          nx >= 0 &&
          nx < cols &&
          this.currentBoard!.getCellType(ny, nx) !== "W" && // Exclude walls
          !processed.has(key([ny, nx])) // Exclude already processed nodes
      );

      for (const neighbor of neighbors) {
        const neighborKey = key(neighbor);
        if (!cameFrom.has(neighborKey)) {
          cameFrom.set(neighborKey, current);
          openSet.push(neighbor);
        }
      }
    }

    return []; // No path found
  }

  // Gets the current position of the enemy
  getPosition(): { x: number; y: number } {
    return this.position;
  }
}

export default EnemyBase;
