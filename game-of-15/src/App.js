// App.js
import React, { useState } from "react";
import GameGrid from "./components/GameGrid";
import Numbers from "./components/Numbers";
import "./App.css";

export default function App() {
  const [grid, setGrid] = useState(
    Array.from({ length: 3 }, () => Array(3).fill(null))
  );
  const [availableNumbers, setAvailableNumbers] = useState([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  ]);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [zeroOverwritten, setZeroOverwritten] = useState(false);

  const handleNumberClick = (number) => {
    if (selectedCell.row !== null && selectedCell.col !== null) {
      placeNumberInGrid(number, selectedCell.row, selectedCell.col);
      setSelectedCell({ row: null, col: null });
    }
  };

  const placeNumberInGrid = (number, row, col) => {
    const cellValue = grid[row][col];
    if (cellValue !== null && number !== 0) return;
    if (number === 0 && zeroOverwritten && cellValue !== null) return;

    const updatedGrid = [...grid];
    updatedGrid[row][col] = number;

    if (number === 0) {
      setZeroOverwritten(true);
      setAvailableNumbers(availableNumbers.filter((num) => num !== 0));
    } else if (number !== 0) {
      setAvailableNumbers(availableNumbers.filter((num) => num !== number));
    }

    setGrid(updatedGrid);
  };

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
  };

  const handleDrop = (row, col, e) => {
    e.preventDefault();
    const number = parseInt(e.dataTransfer.getData("text/plain"));
    if (!isNaN(number)) {
      placeNumberInGrid(number, row, col);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className='GameLayout'>
      <GameGrid
        grid={grid}
        onCellClick={handleCellClick}
        onCellDrop={handleDrop}
        onCellDragOver={handleDragOver}
        selectedCell={selectedCell}
      />
      <Numbers
        availableNumbers={availableNumbers}
        onNumberClick={handleNumberClick}
      />
    </div>
  );
}
