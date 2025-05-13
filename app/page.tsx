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

  const enemy = useMemo(() => new EnemyBase(board, 0.7), [board]);
  const enemy2 = useMemo(() => new EnemyBase(board, 0.7), [board]);

  useEffect(() => {
    const interval = setInterval(() => {
      enemy.update();
      setBoardHtml(board.draw()); // Update the grid HTML
    }, 100);

    
   /*  const interval2 = setInterval(() => {
      enemy2.update();
      setBoardHtml(board.draw()); // Update the grid HTML
    }, 100); */
    
    return () => clearInterval(interval);
   return () => clearInterval(interval2);
  }, [enemy, enemy2]);

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
    </div>
  );
}