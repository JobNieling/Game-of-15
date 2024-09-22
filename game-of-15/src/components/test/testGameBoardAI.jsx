import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GameBoard.css";
import Numbers from "./Numbers";
import GameStatus from "./GameStatus";

export default function GameBoardAI({ playerChoice, onGameEnd }) {
  const [grid, setGrid] = useState(
    Array(3)
      .fill(null)
      .map(() => Array(3).fill(null))
  );
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [availableNumbers, setAvailableNumbers] = useState([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  ]);
  const [aiNumbers, setAiNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(playerChoice);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState(null);
  const [score, setScore] = useState({ odd: 0, even: 0, tie: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const aiPlayer = playerChoice === "odd" ? "even" : "odd";
  const navigate = useNavigate();

  const getAvailableNumbers = (playerType, usedNumbers) => {
    const allNumbers = playerType === "odd" ? [1, 3, 5, 7, 9] : [0, 2, 4, 6, 8];
    return allNumbers.filter((number) => !usedNumbers.includes(number));
  };

  // Helper function to extract all used numbers from the grid
  const getUsedNumbers = (grid) => {
    return grid.flat().filter((cell) => cell !== null);
  };

  useEffect(() => {
    // Update AI numbers whenever the grid changes or a number is used
    setAiNumbers(getAvailableNumbers(aiPlayer, getUsedNumbers(grid)));
  }, [grid]);

  // Reset game state when player choice changes
  useEffect(() => {
    resetGameState();
  }, [playerChoice]);

  // Handle AI turn when it's AI's turn and no winner is declared
  useEffect(() => {
    if (currentPlayer === aiPlayer && !winner) {
      handleAIPlay();
    }
  }, [currentPlayer, winner]);

  // Reset the game state
  const resetGameState = () => {
    setGrid(
      Array(3)
        .fill(null)
        .map(() => Array(3).fill(null))
    );
    setCurrentPlayer(playerChoice);
    setAvailableNumbers([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    setWinner(null);
    setIsProcessing(false);
  };

  // Check for a winner or a tie
  const checkForWinner = (newGrid) => {
    const lines = [
      ...newGrid,
      [newGrid[0][0], newGrid[1][0], newGrid[2][0]],
      [newGrid[0][1], newGrid[1][1], newGrid[2][1]],
      [newGrid[0][2], newGrid[1][2], newGrid[2][2]],
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

  // Update grid and check for a winner
  const updateGridAndCheckWinner = async (newGrid, numberToRemove) => {
    const result = checkForWinner(newGrid);
    setGrid(newGrid);

    if (result) {
      handleGameEnd(result);
    } else {
      setCurrentPlayer(currentPlayer === "odd" ? "even" : "odd");
      updateAvailableNumbers(numberToRemove);
    }
  };

  // Handle game end and update scoreboard
  const handleGameEnd = async (result) => {
    setWinner(result);
    setError(result === "tie" ? "It's a tie!" : null);

    setScore((prevScore) => {
      const newScore = { ...prevScore };
      newScore[result] = prevScore[result] + 1;
      return newScore;
    });

    await updateScoreboard(result);
    onGameEnd(result);
  };

  // Update available numbers after a move
  const updateAvailableNumbers = (numberToRemove) => {
    setAvailableNumbers((prevNumbers) =>
      prevNumbers.filter((num) => num !== numberToRemove)
    );
    setAiNumbers((prevNumbers) =>
      prevNumbers.filter((num) => num !== numberToRemove)
    );
  };

  // Handle number selection
  const handleNumberClick = (number) => {
    if (isNumberSelectable(number)) {
      setSelectedNumber(number);
    } else {
      setError("You cannot select this number!");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Check if a number is selectable by the current player
  const isNumberSelectable = (number) => {
    const isCurrentPlayerOdd = currentPlayer === "odd";
    const isNumberOdd = number % 2 !== 0;
    return (
      (isCurrentPlayerOdd && isNumberOdd) ||
      (!isCurrentPlayerOdd && !isNumberOdd)
    );
  };

  // Handle cell click for placing a number
  const handleCellClick = (row, col) => {
    if (isProcessing || winner) return; // Prevent interaction during AI processing or if game is over

    const cellValue = grid[row][col];
    if (
      selectedNumber !== null &&
      (cellValue === null || cellValue === selectedNumber)
    ) {
      const newGrid = grid.map((r) => r.slice());
      newGrid[row][col] = selectedNumber;
      updateGridAndCheckWinner(newGrid, selectedNumber);
      setSelectedNumber(null);
    } else {
      setError("Invalid move!");
      setTimeout(() => setError(null), 3000);
    }

    setSelectedCell({ row, col });
  };

  // Handle AI's move
  const handleAIPlay = async () => {
    if (isProcessing || winner) return;

    setIsProcessing(true);
    try {
      const response = await fetch("http://localhost:5000/api/ai-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grid,
          available_numbers: aiNumbers,
          currentPlayer,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch AI move");

      const { row, col, number } = await response.json();

      if (row !== undefined && col !== undefined && number !== undefined) {
        const newGrid = grid.map((r) => r.slice());
        newGrid[row][col] = number;
        await updateGridAndCheckWinner(newGrid, number);
      }
    } catch (error) {
      console.error("Error during AI move:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update scoreboard on the server
  const updateScoreboard = async (result) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/update-scoreboard",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [result]: score[result] + 1, tie: score.tie }),
        }
      );
      if (!response.ok) throw new Error("Failed to update scoreboard");
    } catch (error) {
      console.error("Error updating scoreboard:", error);
    }
  };

  return (
    <div className='GameBoard'>
      <GameStatus
        winner={winner}
        onRestart={() => navigate("/start")}
        currentPlayer={currentPlayer}
      />
      <Numbers
        availableNumbers={availableNumbers}
        onNumberClick={handleNumberClick}
        onNumberDragStart={(e, number) =>
          e.dataTransfer.setData("text/plain", number)
        }
      />
      <table className='GameGrid'>
        <tbody>
          {grid.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className='GameCell'
                  onClick={() => handleCellClick(i, j)}
                >
                  {cell !== null ? cell : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {error && <div className='error'>{error}</div>}
      {winner && (
        <button className='play-again' onClick={() => navigate("/start")}>
          Play Again
        </button>
      )}
    </div>
  );
}
