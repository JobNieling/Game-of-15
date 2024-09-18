import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useScoreboard from "../hooks/useScoreboard";
import "./GameBoard.css";
import Numbers from "./Numbers";
import GameStatus from "./GameStatus";

const GameBoard = ({ playerChoice, onGameEnd }) => {
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
  const { fetchScoreboard } = useScoreboard(); // Use the custom hook

  const navigate = useNavigate(); // Hook for navigation

  // Check if there's a winner or a tie
  const checkForWinner = (newGrid) => {
    const lines = [
      ...newGrid, // Rows
      [newGrid[0][0], newGrid[1][0], newGrid[2][0]], // Columns
      [newGrid[0][1], newGrid[1][1], newGrid[2][1]],
      [newGrid[0][2], newGrid[1][2], newGrid[2][2]],
      [newGrid[0][0], newGrid[1][1], newGrid[2][2]], // Diagonals
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
      if (result !== "tie") {
        fetchScoreboard(); // Refresh scoreboard if there's a winner
      }
      onGameEnd(result); // Notify parent component of game result
      navigate("/end"); // Redirect to end screen
    } else {
      setCurrentPlayer(currentPlayer === "odd" ? "even" : "odd");
      setAvailableNumbers((prevNumbers) =>
        prevNumbers.filter((num) => num !== numberToRemove)
      );
    }
  };

  // Handle clicking on a cell
  const handleCellClick = (row, col) => {
    if (grid[row][col] !== null || winner) return; // Prevent clicking if cell is occupied or game is over

    if (selectedCell.row !== null && selectedCell.col !== null) {
      const newGrid = grid.map((r, i) =>
        r.map((cell, j) =>
          i === row && j === col
            ? grid[selectedCell.row][selectedCell.col]
            : cell
        )
      );
      newGrid[selectedCell.row][selectedCell.col] = null; // Clear the previous cell

      updateGridAndCheckWinner(
        newGrid,
        grid[selectedCell.row][selectedCell.col]
      );
      setSelectedCell({ row: null, col: null }); // Deselect cell after placement
    }
  };

  // Handle dragging over a cell
  const handleCellDragOver = (e) => {
    e.preventDefault();
  };

  // Handle dropping a number into a cell
  const handleCellDrop = (row, col, e) => {
    e.preventDefault();
    const numberToDrop = parseInt(e.dataTransfer.getData("text"), 10);
    if (!availableNumbers.includes(numberToDrop) || grid[row][col] !== null)
      return; // Validate number and cell

    const newGrid = grid.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? numberToDrop : cell))
    );

    updateGridAndCheckWinner(newGrid, numberToDrop);
  };

  // Handle clicking on a number
  const handleNumberClick = (number) => {
    if (winner || !availableNumbers.includes(number)) return; // Prevent action if game is over or number is not available

    if (selectedCell.row === null) {
      alert("Please select a cell first.");
      return;
    }

    const newGrid = grid.map((r, i) =>
      r.map((cell, j) =>
        i === selectedCell.row && j === selectedCell.col ? number : cell
      )
    );

    updateGridAndCheckWinner(newGrid, number);
  };

  // Handle dragging a number
  const handleNumberDragStart = (number, e) => {
    e.dataTransfer.setData("text", number.toString());
  };

  return (
    <div className='GameBoard'>
      <GameStatus
        winner={winner}
        onRestart={() => navigate("/")} // Use navigate to redirect to start screen
        currentPlayer={currentPlayer}
      />
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
                  } ${cell !== null ? "occupied" : ""}`}
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
    </div>
  );
};

export default GameBoard;
