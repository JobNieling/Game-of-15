import React, { useState } from "react";
import "./GameBoard.css";
import Numbers from "./Numbers";
import GameStatus from "./GameStatus";
import Scoreboard from "./Scoreboard";

export default function GameBoard({ playerChoice }) {
  const [grid, setGrid] = useState(
    Array(3)
      .fill(null)
      .map(() => Array(3).fill(null))
  );
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [availableNumbers, setAvailableNumbers] = useState([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(playerChoice);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState({ odd: 0, even: 0 });
  const [error, setError] = useState(null);

  const checkForWinner = (newGrid) => {
    const lines = [
      // Rows
      ...newGrid,
      // Columns
      [newGrid[0][0], newGrid[1][0], newGrid[2][0]],
      [newGrid[0][1], newGrid[1][1], newGrid[2][1]],
      [newGrid[0][2], newGrid[1][2], newGrid[2][2]],
      // Diagonals
      [newGrid[0][0], newGrid[1][1], newGrid[2][2]],
      [newGrid[0][2], newGrid[1][1], newGrid[2][0]],
    ];

    for (const line of lines) {
      const nonNullCells = line.filter((cell) => cell !== null);
      const sum = nonNullCells.reduce((acc, cell) => acc + cell, 0);

      if (nonNullCells.length === 3 && sum === 15) {
        return currentPlayer;
      }
    }

    return newGrid.flat().every((cell) => cell !== null) ? "tie" : null;
  };

  const updateGridAndCheckWinner = (newGrid, numberToRemove) => {
    const result = checkForWinner(newGrid);
    setGrid(newGrid);

    if (result) {
      setWinner(result);
      setError(result === "tie" ? "It's a tie!" : null);
      if (result !== "tie") {
        setScore((prevScore) => ({
          ...prevScore,
          [currentPlayer]: prevScore[currentPlayer] + 1,
        }));
      }
    } else {
      setCurrentPlayer(currentPlayer === "odd" ? "even" : "odd");
      setAvailableNumbers((prevNumbers) =>
        prevNumbers.filter((num) => num !== numberToRemove)
      );
    }
  };

  const handleCellClick = (row, col) => {
    if (winner || grid[row][col] !== null) return;
    const number = availableNumbers[0];
    if (currentPlayer === "even" && number % 2 === 1) return;
    if (currentPlayer === "odd" && number % 2 === 0) return;

    const newGrid = grid.map((r) => r.slice());
    newGrid[row][col] = number;
    updateGridAndCheckWinner(newGrid, number);
  };

  const handleCellDrop = (row, col, e) => {
    const draggedNumber = parseInt(e.dataTransfer.getData("text/plain"), 10);

    if (
      winner ||
      isNaN(draggedNumber) ||
      draggedNumber < 0 ||
      draggedNumber > 9
    )
      return;

    if (
      grid[row][col] === null ||
      (grid[row][col] !== null && draggedNumber === 0)
    ) {
      if (
        (currentPlayer === "even" && draggedNumber % 2 === 1) ||
        (currentPlayer === "odd" && draggedNumber % 2 === 0)
      )
        return;

      const newGrid = grid.map((r) => r.slice());
      newGrid[row][col] = draggedNumber;
      updateGridAndCheckWinner(newGrid, draggedNumber);
    } else {
      setError("Cell already occupied or invalid drop!");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleCellDragOver = (e) => e.preventDefault();

  const handleNumberClick = (number) => {
    if (
      winner ||
      !availableNumbers.includes(number) ||
      number < 0 ||
      number > 9
    )
      return;

    if (selectedCell.row !== null && selectedCell.col !== null) {
      const newGrid = grid.map((r) => r.slice());
      if (
        newGrid[selectedCell.row][selectedCell.col] === null ||
        number === 0
      ) {
        newGrid[selectedCell.row][selectedCell.col] = number;
        updateGridAndCheckWinner(newGrid, number);
        setSelectedCell({ row: null, col: null });
      } else {
        setError("Cell already occupied!");
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  const handleNumberDragStart = (e, number) =>
    e.dataTransfer.setData("text/plain", number);

  return (
    <div className='GameBoard'>
      <GameStatus
        winner={winner}
        onRestart={() => window.location.reload()}
        currentPlayer={currentPlayer}
      />
      {winner ? (
        <Scoreboard score={score} />
      ) : (
        <>
          <Numbers
            availableNumbers={availableNumbers}
            onNumberClick={handleNumberClick}
            onNumberDragStart={handleNumberDragStart}
          />
          <table className='GameGrid'>
            <tbody>
              {grid.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`cell ${
                        selectedCell.row === i && selectedCell.col === j
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleCellClick(i, j)}
                      onDragOver={handleCellDragOver}
                      onDrop={(e) => handleCellDrop(i, j, e)}
                    >
                      {cell !== null ? (
                        <span className='cell-number'>{cell}</span>
                      ) : (
                        ""
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {error && <div className='error-message'>{error}</div>}
        </>
      )}
    </div>
  );
}
