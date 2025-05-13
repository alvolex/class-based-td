"use client";
import { useEffect, useState } from 'react';
import './board.scss';
import BoardBase from "@/classes/BoardBase";
import TowerBase from '@/classes/TowerBase';
import EnemyBase from '@/classes/EnemyBase';

export default function Home() {
  const [boardHtml, setBoardHtml] = useState<string>('');
  const [board] = useState(() => {
    const newBoard = new BoardBase(25, 25);
    newBoard.generate();
    return newBoard;
  });

  useEffect(() => {
    board.startGame(); // Start the game only once here

    (function loop() {
      const rand = Math.round(Math.random() * (3000 - 500)) + 500;
      // speed 0.2 - 0.9
      const randSpeed = Math.round(Math.random() * (0.9 - 0.2) * 100) / 100 + 0.2;
      const randHealth = Math.round(Math.random() * (100 - 50)) + 50;
      setTimeout(function () {
        console.log(randSpeed);
        new EnemyBase(board, randSpeed, randHealth);
        loop();
      }, rand);
    }());

    const interval = setInterval(() => {
      setBoardHtml(board.draw()); // Redraw the grid every 100ms
    }, 100);

    return () => clearInterval(interval);
  }, [board]);

  const handleAddTower = (x: number, y: number) => {
    if (new TowerBase(board, x, y, 10, 3, 500)) {
      setBoardHtml(board.draw()); // Update the grid HTML
    }
  };

  // Initial render of the grid
  useEffect(() => {
    if (!boardHtml) {
      setBoardHtml(board.draw());
    }
  }, [boardHtml, board]);

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