"use client";
import { useState } from 'react';
import './board.scss';
import BoardBase from "@/classes/BoardBase";

export default function Home() {
  const [boardHtml, setBoardHtml] = useState<string>('');
  const [board] = useState(() => {
    const newBoard = new BoardBase(25, 25);
    newBoard.generate();
    return newBoard;
  });

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
    <div>
      <div
        className={'board-wrapper'}
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