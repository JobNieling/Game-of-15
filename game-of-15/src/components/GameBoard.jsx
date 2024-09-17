import React, { useState } from "react";
import Numbers from "./Numbers";
import GameGrid from "./GameGrid";
import "./GameBoard.css";

export default function GameBoard({ playerChoice }) {
  const [availableNumbers, setAvailableNumbers] = useState([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  ]);
  const [grid, setGrid] = useState(Array(3).fill(Array(3).fill(null))); // 3x3 grid initialized with null
  const [selectedCell, setSelectedCell] = useState(null);

  const handleNumberClick = (number) => {
    if (selectedCell) {
      const newGrid = grid.map((row, i) =>
        row.map((cell, j) =>
          i === selectedCell.row && j === selectedCell.col ? number : cell
        )
      );
      setGrid(newGrid);
      setAvailableNumbers(availableNumbers.filter((n) => n !== number));
      setSelectedCell(null); // Deselect the cell after placing the number
    }
  };

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
  };

  const handleCellDrop = (row, col, e) => {
    const number = parseInt(e.dataTransfer.getData("text/plain"), 10);
    const newGrid = grid.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? number : c))
    );
    setGrid(newGrid);
    setAvailableNumbers(availableNumbers.filter((n) => n !== number));
  };

  const handleCellDragOver = (e) => {
    e.preventDefault(); // Necessary for onDrop to work
  };

  return (
    <div className='GameBoard'>
      <GameGrid
        grid={grid}
        onCellClick={handleCellClick}
        selectedCell={selectedCell}
        onCellDrop={handleCellDrop}
        onCellDragOver={handleCellDragOver}
      />
      <Numbers
        availableNumbers={availableNumbers}
        onNumberClick={handleNumberClick}
      />
    </div>
  );
}
