import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GameBoard.css";
import Numbers from "./Numbers";
import GameStatus from "./GameStatus";

export default function GameBoardAI({ playerChoice, onGameEnd, playerStart }) {
  const [grid, setGrid] = useState(
    Array(3)
      .fill(null)
      .map(() => Array(3).fill(null))
  );
  const [placementOrder, setPlacementOrder] = useState([]);
  const [availableNumbers, setAvailableNumbers] = useState([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  ]);
  const [aiNumbers, setAiNumbers] = useState([]);
  const [playerNumbers, setPlayerNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(
    playerStart ? playerChoice : playerChoice === "odd" ? "even" : "odd"
  );
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const aiPlayer = playerChoice === "odd" ? "even" : "odd";
  const navigate = useNavigate();

  // Get available numbers based on the current player (odd/even)
  const getAvailableNumbers = (playerType, usedNumbers) => {
    const allNumbers = playerType === "odd" ? [1, 3, 5, 7, 9] : [0, 2, 4, 6, 8];
    return allNumbers.filter((number) => !usedNumbers.includes(number));
  };

  // Get all numbers that have already been used
  const getUsedNumbers = (grid) => {
    return grid.flat().filter((cell) => cell !== null);
  };

  useEffect(() => {
    setAiNumbers(getAvailableNumbers(aiPlayer, getUsedNumbers(grid)));
  }, [grid]);

  useEffect(() => {
    resetGameState();
  }, [playerChoice, playerStart]);

  // Trigger AI move if it's AI's turn and no winner has been decided
  useEffect(() => {
    if (currentPlayer === aiPlayer && !winner) {
      handleAIPlay();
    }
  }, [currentPlayer, winner]);

  // Reset the game state based on player choice and starting player
  const resetGameState = () => {
    setGrid(
      Array(3)
        .fill(null)
        .map(() => Array(3).fill(null))
    );
    setCurrentPlayer(playerStart ? playerChoice : aiPlayer); // Set starting player based on playerStart
    setAvailableNumbers([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    setWinner(null);
    setPlacementOrder([]);
    setIsProcessing(false);
  };

  // Check for a winner based on the grid state
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

  // Handle grid update and winner check after a move
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

  const handleCellClick = async (row, col) => {
    if (isProcessing || winner) return;

    if (grid[row][col] !== null) {
      setError("Cell is already occupied");
      return;
    }

    if (selectedNumber === null) {
      setError("Select a number first");
      return;
    }

    const newGrid = grid.map((r) => r.slice());
    newGrid[row][col] = selectedNumber;

    setPlacementOrder((prevOrder) => [
      ...prevOrder,
      { step: prevOrder.length + 1, number: selectedNumber },
    ]);

    await updateGridAndCheckWinner(newGrid, selectedNumber);
  };

  // Handle game end and notify the parent component
  const handleGameEnd = async (result) => {
    setWinner(result);
    setError(result === "tie" ? "It's a tie!" : null);

    let winner;

    if (result === "tie") {
      winner = "tie";
    } else {
      if (currentPlayer === aiPlayer) {
        winner = aiPlayer === "even" ? "ai_win_even" : "ai_win_odd";
      } else if (currentPlayer === playerChoice) {
        winner =
          currentPlayer === "even" ? "player_win_even" : "player_win_odd";
      } else {
        console.error("Invalid winner");
      }
    }

    await saveGameResult(winner);

    onGameEnd(result);
  };

  // Save the game result to the backend
  const saveGameResult = async (result) => {
    try {
      const response = await fetch("http://localhost:5000/api/save-grid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grid,
          placement_order: placementOrder,
          result,
        }),
      });
      if (!response.ok) throw new Error("Failed to save game result");
    } catch (error) {
      console.error("Error saving game result:", error);
    }
  };

  // Update the list of available numbers after a move
  const updateAvailableNumbers = (numberToRemove) => {
    setAvailableNumbers((prevNumbers) =>
      prevNumbers.filter((num) => num !== numberToRemove)
    );
    setAiNumbers((prevNumbers) =>
      prevNumbers.filter((num) => num !== numberToRemove)
    );
    setPlayerNumbers((prevNumbers) =>
      prevNumbers.filter((num) => num !== numberToRemove)
    );
  };

  // Handle the AI's move
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
          opponent_available_numbers: playerNumbers,
          currentPlayer,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch AI move");

      const { row, col, number } = await response.json();

      if (row !== undefined && col !== undefined && number !== undefined) {
        const newGrid = grid.map((r) => r.slice());
        newGrid[row][col] = number;

        setPlacementOrder((prevOrder) => [
          ...prevOrder,
          { step: prevOrder.length + 1, number },
        ]);

        await updateGridAndCheckWinner(newGrid, number);
      }
    } catch (error) {
      console.error("Error during AI move:", error);
    } finally {
      setIsProcessing(false);
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
        onNumberClick={setSelectedNumber}
        onNumberDragStart={(e, number) => setSelectedNumber(number)}
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
    </div>
  );
}
