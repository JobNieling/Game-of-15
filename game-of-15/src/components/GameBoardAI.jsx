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
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [ai_number, setAiNumber] = useState(
    playerChoice === "odd" ? [0, 2, 4, 6, 8] : [1, 3, 5, 7, 9]
  );
  const [currentPlayer, setCurrentPlayer] = useState(playerChoice);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState(null);
  const [currentGrid, setCurrentGrid] = useState(grid);
  const [isProcessing, setIsProcessing] = useState(false); // New state to prevent interaction during AI turn
  const aiPlayer = playerChoice === "odd" ? "even" : "odd";
  const player = playerChoice;
  const navigate = useNavigate();

  // Reset the game state when the player choice changes
  useEffect(() => {
    setGrid(
      Array(3)
        .fill(null)
        .map(() => Array(3).fill(null))
    );
    setCurrentPlayer(playerChoice);
    setAvailableNumbers([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    setWinner(null);
  }, [playerChoice]);

  // Update AI's available numbers when playerChoice changes
  useEffect(() => {
    if (currentPlayer === aiPlayer && !winner) {
      // console.log("Turn went from:", player, "to", aiPlayer);
      // console.log("AI's turn frontend");
      // console.log("AI Player: ", aiPlayer);
      // console.log("Player: ", player);
      // console.log("AI Number: ", ai_number);
      // console.log("Is this even valid? try2", getAvailableNumbers(aiPlayer));
      setAiNumber(getAvailableNumbers(aiPlayer));
      // console.log("AI Number 2: ", ai_number);
      handleAIPlay();
    }
  }, [currentPlayer, winner]);

  const getAvailableNumbers = (playerType) => {
    return playerType === "odd" ? [1, 3, 5, 7, 9] : [0, 2, 4, 6, 8];
  };

  // Check for a winner or tie
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

  // Update the grid and check for a winner after a move
  const updateGridAndCheckWinner = (newGrid, numberToRemove) => {
    const result = checkForWinner(newGrid);
    setGrid(newGrid);

    if (result) {
      setWinner(result);
      setError(result === "tie" ? "It's a tie!" : null);
      onGameEnd(result);
      navigate("/end");
    } else {
      setCurrentPlayer(currentPlayer === "odd" ? "even" : "odd");
      setAvailableNumbers((prevNumbers) =>
        prevNumbers.filter((num) => num !== numberToRemove)
      );
    }
  };

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (
      winner ||
      grid[row][col] !== null ||
      currentPlayer !== playerChoice ||
      isProcessing
    ) {
      setError("Invalid action!");
      return;
    }

    const number = availableNumbers[0];
    if (
      (currentPlayer === "even" && number % 2 === 1) ||
      (currentPlayer === "odd" && number % 2 === 0)
    ) {
      setError("It's not your turn!");
      setTimeout(() => setError(null), 5000);
      return;
    }

    const newGrid = grid.map((r) => r.slice());
    newGrid[row][col] = number;
    updateGridAndCheckWinner(newGrid, number);
  };

  // Handle cell drop event
  const handleCellDrop = (row, col, e) => {
    e.preventDefault();
    const draggedNumber = parseInt(e.dataTransfer.getData("text/plain"), 10);

    if (
      winner ||
      isNaN(draggedNumber) ||
      draggedNumber < 0 ||
      draggedNumber > 9 ||
      isProcessing
    ) {
      setError("Invalid move!");
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (grid[row][col] !== null && draggedNumber !== 0) {
      setError("Cell already occupied!");
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (
      (currentPlayer === "even" && draggedNumber % 2 === 1) ||
      (currentPlayer === "odd" && draggedNumber % 2 === 0)
    ) {
      setError("It's not your turn!");
      setTimeout(() => setError(null), 5000);
      return;
    }

    const newGrid = grid.map((r) => r.slice());
    newGrid[row][col] = draggedNumber;
    updateGridAndCheckWinner(newGrid, draggedNumber);
  };

  const handleCellDragOver = (e) => e.preventDefault();

  async function handleAIPlay() {
    if (
      !grid ||
      !Array.isArray(availableNumbers) ||
      currentPlayer === undefined
    ) {
      console.error(
        "Invalid state for AI play. Check grid, availableNumbers, or currentPlayer."
      );
      return;
    }

    console.log("AI Turn");

    // Function to handle the AI move after a delay
    const processAIMove = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/ai-move", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            grid: grid,
            available_numbers: ai_number,
            currentPlayer: currentPlayer,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(
            "Error in AI move:",
            errorData.error || "Unknown error"
          );
          return;
        }

        const data = await response.json();

        // Check if the response contains valid data
        const { row, col, number } = data;
        if (row === undefined || col === undefined || number === undefined) {
          console.error("Invalid AI move response:", data);
          return;
        }

        // Create a new grid with the AI's move
        const newGrid = grid.map((r) => r.slice());
        newGrid[row][col] = number;

        // Update the grid and the current player
        setGrid(newGrid);
        setCurrentPlayer(currentPlayer === "odd" ? "even" : "odd");

        // Remove the number used by the AI from available numbers
        setAvailableNumbers((prevNumbers) =>
          prevNumbers.filter((num) => num !== number)
        );
        setAiNumber((prevNumbers) =>
          prevNumbers.filter((num) => num !== number)
        );
      } catch (error) {
        console.error("Failed to fetch AI move:", error);
      }
    };

    // Determine random delay between 5 and 30 seconds
    const delay = Math.random() * (3000 - 500) + 500;

    // Set a timeout to simulate AI thinking time
    setTimeout(() => {
      processAIMove();
    }, delay);
  }

  return (
    <div className='GameBoard'>
      <GameStatus
        winner={winner}
        onRestart={() => navigate("/start")}
        currentPlayer={currentPlayer}
      />
      <Numbers
        availableNumbers={availableNumbers}
        onNumberClick={handleCellClick}
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
      {error && <div className='error'>{error}</div>}
    </div>
  );
}
