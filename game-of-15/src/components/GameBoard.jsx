// components/GameBoard.jsx
import React, { useState, useEffect } from "react";
import GameGrid from "./GameGrid";
import Numbers from "./Numbers";
import Scoreboard from "./Scoreboard";
import GameStatus from "./GameStatus";
import "./GameBoard.css";

const SIZE = 3;

export default function GameBoard({ playerChoice }) {
  const [grid, setGrid] = useState(
    Array(SIZE)
      .fill(null)
      .map(() => Array(SIZE).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState(playerChoice);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState({ odd: 0, even: 0 });
  const [gameEnded, setGameEnded] = useState(false);
  const [remainingNumbers, setRemainingNumbers] = useState(
    Array.from({ length: 10 }, (_, i) => i)
  );
  const [zeroUsed, setZeroUsed] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);

  useEffect(() => {
    if (winner || grid.flat().length === SIZE * SIZE) {
      checkForWinner();
    }
  }, [grid]);

  const handleCellClick = (row, col) => {
    if (
      grid[row][col] === null &&
      !winner &&
      !gameEnded &&
      selectedNumber !== null &&
      isPlayerTurn()
    ) {
      if (selectedNumber === 0 && zeroUsed) return; // Zero can only be used once

      placeNumberInGrid(selectedNumber, row, col);
      setSelectedNumber(null); // Reset selected number after placing
      setCurrentPlayer(currentPlayer === "odd" ? "even" : "odd");
    }
  };

  const handleNumberClick = (number) => {
    if (number === 0 && zeroUsed) return; // Zero can only be used once
    if (isPlayerTurn()) {
      setSelectedNumber(number);
    }
  };

  const handleNumberDragStart = (e, number) => {
    e.dataTransfer.setData("number", number);
  };

  const handleDrop = (e, row, col) => {
    e.preventDefault();
    const number = parseInt(e.dataTransfer.getData("number"), 10);
    if (number === 0 && zeroUsed) return;
    if (grid[row][col] === null && isPlayerTurn()) {
      placeNumberInGrid(number, row, col);
      setSelectedNumber(null); // Reset selected number after placing
      setCurrentPlayer(currentPlayer === "odd" ? "even" : "odd");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const placeNumberInGrid = (number, row, col) => {
    const updatedGrid = [...grid];
    updatedGrid[row][col] = number;
    setGrid(updatedGrid);

    setRemainingNumbers(remainingNumbers.filter((num) => num !== number));
    if (number === 0) {
      setZeroUsed(true);
    }
  };

  const checkForWinner = () => {
    const lines = [
      ...grid, // Rows
      ...grid[0].map((_, i) => grid.map((row) => row[i])), // Columns
      [grid[0][0], grid[1][1], grid[2][2]], // Diagonal 1
      [grid[0][2], grid[1][1], grid[2][0]], // Diagonal 2
    ];

    for (let line of lines) {
      if (line.reduce((acc, num) => acc + (num || 0), 0) === 15) {
        setWinner(currentPlayer);
        setScore((prevScore) => ({
          ...prevScore,
          [currentPlayer]: prevScore[currentPlayer] + 1,
        }));
        setGameEnded(true);
        return;
      }
    }

    if (
      remainingNumbers.length === 0 ||
      (remainingNumbers.length === 1 && zeroUsed)
    ) {
      setGameEnded(true);
      if (winner === null) {
        setWinner("tie");
      }
    }
  };

  const isPlayerTurn = () => {
    return (
      selectedNumber !== null &&
      (selectedNumber % 2 === 0
        ? currentPlayer === "even"
        : currentPlayer === "odd")
    );
  };

  const restartGame = () => {
    setGrid(
      Array(SIZE)
        .fill(null)
        .map(() => Array(SIZE).fill(null))
    );
    setCurrentPlayer(playerChoice);
    setWinner(null);
    setGameEnded(false);
    setRemainingNumbers(Array.from({ length: 10 }, (_, i) => i));
    setZeroUsed(false);
    setSelectedNumber(null);
  };

  return (
    <div className='GameBoard'>
      {winner ? (
        <GameStatus winner={winner} onRestart={restartGame} />
      ) : (
        <div>
          <div className='game-info'>
            <h2>Player: {currentPlayer === "odd" ? "Odd's" : "Even's"} Turn</h2>
          </div>
          <GameGrid
            grid={grid}
            onCellClick={handleCellClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            selectedNumber={selectedNumber}
          />
          <Numbers
            numbers={remainingNumbers}
            onNumberClick={handleNumberClick}
            onNumberDragStart={handleNumberDragStart}
          />
          <Scoreboard score={score} />
        </div>
      )}
    </div>
  );
}
