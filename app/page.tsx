"use client";
import { useEffect, useState, useMemo } from 'react';
import './board.scss';
import BoardBase from "@/classes/BoardBase";
import EnemyBase from "@/classes/EnemyBase";

export default function Home() {
  const [boardHtml, setBoardHtml] = useState<string>('');
  const [board] = useState(() => {
    const newBoard = new BoardBase(25, 25);
    newBoard.generate();
    return newBoard;
  });

  const enemy = useMemo(() => new EnemyBase(board, 0.1), [board]);

  useEffect(() => {
    const interval = setInterval(() => {
      enemy.update();
      const enemyPosition = enemy.getPosition();
      const enemyX = Math.floor(enemyPosition.x);
      const enemyY = Math.floor(enemyPosition.y);

      // Update the enemy's position using absolute positioning
      const enemyDiv = document.querySelector('.enemy') as HTMLElement;
      if (enemyDiv) {
        enemyDiv.style.left = `${enemyX * 20}px`; // Assuming each cell is 20px wide
        enemyDiv.style.top = `${enemyY * 20}px`; // Assuming each cell is 20px tall
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [enemy]);

  const handleAddTower = (x: number, y: number) => {
    if (board.addTower(x, y)) {
      setBoardHtml(board.draw()); // Update the grid HTML
    }
  };

  // Initial render of the grid
  if (!boardHtml) {
    setBoardHtml(board.draw());
  }

  return (
    <div className={'board-wrapper'}>
      <div
        
        dangerouslySetInnerHTML={{ __html: boardHtml }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.classList.contains('cell')) {
            const x = target.dataset.x ? parseInt(target.dataset.x) : -1;
            const y = target.dataset.y ? parseInt(target.dataset.y) : -1;
            if (x >= 0 && y >= 0) {
              handleAddTower(x, y);
            }
          }
        }}
      />
      <div className="enemy"></div>
    </div>
  );
}