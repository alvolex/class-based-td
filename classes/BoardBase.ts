class BoardBase {
  private grid: { type: string; enemyCount: number }[][];
  public path: [number, number][] | null = null;

  constructor(private x: number, private y: number) {
    this.grid = [];
  }

  generate(): void {
    this.grid = Array.from({ length: this.y }, (_, rowIndex) => {
      return Array.from({ length: this.x }, (_, colIndex) => {
        if (
          rowIndex === 0 ||
          rowIndex === this.y - 1 ||
          colIndex === 0 ||
          colIndex === this.x - 1
        ) {
          return { type: "W", enemyCount: 0 }; // Wall
        }
        return { type: "empty", enemyCount: 0 }; // Empty cell
      });
    });

    this.grid[1][0] = { type: "S", enemyCount: 0 }; // Start point (top-left inside the wall)
    this.grid[this.y - 2][this.x - 1] = { type: "E", enemyCount: 0 }; // End point (bottom-right inside the wall)

    this.findShortestPath(); // Generate the path
  }

  // Draws the grid as an HTML structure
  draw(): string {
    return this.grid
      .map((row, y) => {
        return `<div class='row'>${row
          .map(
            (cell, x) =>
              `<div class='cell ${this.getCellClass(
                cell
              )}' data-x='${x}' data-y='${y}'></div>`
          )
          .join("")}</div>`;
      })
      .join("");
  }

  // Helper method to get CSS class for a cell
  private getCellClass(cell: { type: string; enemyCount: number }): string {
    switch (cell.type) {
      case "W":
        return "wall";
      case "S":
        return "start";
      case "E":
        return "end";
      case "Enemy":
        return "enemy";
      case "T":
        return "tower";
      case "P":
        return "path";
      default:
        return "empty";
    }
  }

  // Adds a tower to the grid
  addTower(x: number, y: number): boolean {
    if (
      (this.grid[y][x].type.trim() === "empty" ||
        this.grid[y][x].type.trim() === "P") &&
      this.isPathAvailable(x, y)
    ) {
      this.grid[y][x].type = "T"; // Place tower

      // Refresh enemy visibility immediately
      this.grid.forEach((row) => {
        row.forEach((cell) => {
          if (cell.enemyCount > 0) {
            cell.type = "Enemy"; // Ensure enemy cells are updated
          }
        });
      });

      return true;
    }
    return false; // Invalid placement
  }

  setEnemyPosition(
    x: number,
    y: number,
    oldX: number,
    oldY: number,
    isTemporaryPath: boolean = false
  ): void {
    console.log(this.grid[y][x].type === "empty" || this.grid[y][x].type === "P");
    if (this.grid[y][x].type === "empty" || this.grid[y][x].type === "P") {
      this.grid[y][x].type = "Enemy"; // Set enemy position
      this.grid[y][x].enemyCount += 1;
    }
    
    if (
      this.grid[oldY][oldX].type === "Enemy" &&
      this.grid[oldY][oldX].enemyCount > 0
    ) {
      this.grid[oldY][oldX].enemyCount -= 1;
      if (this.grid[oldY][oldX].enemyCount === 0 && !isTemporaryPath) {
        this.grid[oldY][oldX].type = "P"; // Reset to path if no enemies remain and not on temporary path
      } else if (this.grid[oldY][oldX].enemyCount === 0 && isTemporaryPath) {
        this.grid[oldY][oldX].type = "empty"; // Reset to empty if no enemies remain and on temporary path
      }
    }

    if(isTemporaryPath){
      this.grid[y][x].type = "Enemy"; // Set temporary path
      this.grid[y][x].enemyCount += 1;

      if (this.grid[oldY][oldX].enemyCount === 0) {
        this.grid[oldY][oldX].type = "empty"; // Reset to empty if no enemies remain
      }
    }
  }

  // Checks if a path exists between start and end points
  private isPathAvailable(x: number, y: number): boolean {
    const original = this.grid[y][x];
    this.grid[y][x].type = "T"; // Temporarily place tower
    const pathExists = this.findShortestPath() !== null;
    console.log(`Path available: ${pathExists}`);
    this.grid[y][x] = original; // Restore original cell
    return pathExists;
  }

  // Implements A* pathfinding to find the shortest path
  public findShortestPath(
    start: [number, number] = [1, 1],
    end: [number, number] = [this.y - 2, this.x - 2]
  ): [number, number][] | null {
    const openSet: [number, number][] = [start];
    const cameFrom: Map<string, [number, number]> = new Map();
    const gScore: Map<string, number> = new Map();
    const fScore: Map<string, number> = new Map();
    const processed: Set<string> = new Set(); // Track processed nodes

    const key = ([y, x]: [number, number]) => `${y},${x}`;
    const heuristic = (
      [y1, x1]: [number, number],
      [y2, x2]: [number, number]
    ) => Math.abs(y1 - y2) + Math.abs(x1 - x2);

    // Initialize gScore and fScore for all cells
    for (let row = 0; row < this.y; row++) {
      for (let col = 0; col < this.x; col++) {
        const cellKey = key([row, col]);
        gScore.set(cellKey, Infinity);
        fScore.set(cellKey, Infinity);
      }
    }

    gScore.set(key(start), 0);
    fScore.set(key(start), heuristic(start, end));

    while (openSet.length > 0) {
      openSet.sort(
        (a, b) =>
          (fScore.get(key(a)) || Infinity) - (fScore.get(key(b)) || Infinity)
      );
      const current = openSet.shift()!;
      const currentKey = key(current);

      if (current[0] === end[0] && current[1] === end[1]) {
        const path: [number, number][] = [];
        let temp: [number, number] | undefined = current;
        while (temp) {
          path.unshift(temp);
          temp = cameFrom.get(key(temp));
        }
        console.log(`Path: ${JSON.stringify(path)}`);

        //remove old path from grid
        this.path?.forEach(([y, x]) => {
          this.grid[y][x].type = "empty"; // Mark path cells as empty
        });

        this.path = path;
        this.path.forEach(([y, x]) => {
          this.grid[y][x].type = "P"; // Mark path cells
        });
        return path;
      }

      processed.add(currentKey); // Mark the current node as processed

      const [cy, cx] = current;
      const neighbors: [number, number][] = [
        [cy - 1, cx] as [number, number],
        [cy + 1, cx] as [number, number],
        [cy, cx - 1] as [number, number],
        [cy, cx + 1] as [number, number],
      ].filter(
        ([ny, nx]) =>
          ny >= 0 &&
          ny < this.y &&
          nx >= 0 &&
          nx < this.x &&
          this.grid[ny][nx].type !== "W" &&
          this.grid[ny][nx].type !== "T" &&
          !processed.has(key([ny, nx])) // Exclude processed nodes
      );

      for (const neighbor of neighbors) {
        const neighborKey = key(neighbor);
        const tentativeGScore = (gScore.get(currentKey) || 0) + 1;

        if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, end));
          if (
            !openSet.some(
              ([ny, nx]) => ny === neighbor[0] && nx === neighbor[1]
            )
          ) {
            openSet.push(neighbor);
          }
        }
      }
    }

    console.log("No path found");
    return null; // No path found
  }
  // Adds event listeners to get x and y position of clicked cells
  addClickListeners(): void {
    if (typeof window !== "undefined") {
      document.querySelectorAll(".cell").forEach((cell, index) => {
        const x = index % this.x;
        const y = Math.floor(index / this.x);

        // Remove any existing click listeners
        const newCell = cell.cloneNode(true) as HTMLElement;
        cell.replaceWith(newCell);

        // Add the new click listener
        newCell.addEventListener("click", () => {
          console.log(`Clicked cell at x: ${x}, y: ${y}`);
          this.addTower(x, y);
        });
      });
    }
  }

  // Public method to get the type of a cell
  public getCellType(y: number, x: number): string {
    if (y >= 0 && y < this.grid.length && x >= 0 && x < this.grid[0].length) {
      return this.grid[y][x].type;
    }
    return "W"; // Treat out-of-bounds as walls
  }

  // Public method to get grid dimensions
  public getGridDimensions(): { rows: number; cols: number } {
    return { rows: this.grid.length, cols: this.grid[0].length };
  }
}

export default BoardBase;
