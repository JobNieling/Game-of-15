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
  const [placementOrder, setPlacementOrder] = useState([]);
  // const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [availableNumbers, setAvailableNumbers] = useState([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  ]);
  const [aiNumbers, setAiNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(playerChoice);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const aiPlayer = playerChoice === "odd" ? "even" : "odd";
  const navigate = useNavigate();
  const [playerNumbers, setPlayerNumbers] = useState([
    playerChoice === "odd" ? [1, 3, 5, 7, 9] : [0, 2, 4, 6, 8],
  ]);
  const getAvailableNumbers = (playerType, usedNumbers) => {
    const allNumbers = playerType === "odd" ? [1, 3, 5, 7, 9] : [0, 2, 4, 6, 8];
    return allNumbers.filter((number) => !usedNumbers.includes(number));
  };

  const getUsedNumbers = (grid) => {
    return grid.flat().filter((cell) => cell !== null);
  };

  useEffect(() => {
    setAiNumbers(getAvailableNumbers(aiPlayer, getUsedNumbers(grid)));
  }, [grid]);

  useEffect(() => {
    resetGameState();
  }, [playerChoice]);

  useEffect(() => {
    if (currentPlayer === aiPlayer && !winner) {
      handleAIPlay();
    }
  }, [currentPlayer, winner]);

  const resetGameState = () => {
    setGrid(
      Array(3)
        .fill(null)
        .map(() => Array(3).fill(null))
    );
    setCurrentPlayer(aiPlayer);
    setAvailableNumbers([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    setWinner(null);
    setPlacementOrder([]);
    setIsProcessing(false);
  };

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

  const handleGameEnd = async (result) => {
    setWinner(result);
    setError(result === "tie" ? "It's a tie!" : null);

    let winner;

    // Determine winner based on result and current player
    if (result === "tie") {
      winner = "tie";
    } else {
      // Determine if the winner is AI or player
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

  // Save game state and placement order to the backend
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

  const handleNumberClick = (number) => {
    if (isNumberSelectable(number)) {
      setSelectedNumber(number);
    } else {
      setError("You cannot select this number!");
      setTimeout(() => setError(null), 3000);
    }
  };

  const isNumberSelectable = (number) => {
    const isCurrentPlayerOdd = currentPlayer === "odd";
    const isNumberOdd = number % 2 !== 0;
    return (
      (isCurrentPlayerOdd && isNumberOdd) ||
      (!isCurrentPlayerOdd && !isNumberOdd)
    );
  };

  const handleCellClick = (row, col) => {
    if (isProcessing || winner) return;

    const cellValue = grid[row][col];
    if (
      selectedNumber !== null &&
      (cellValue === null || cellValue === selectedNumber)
    ) {
      const newGrid = grid.map((r) => r.slice());
      newGrid[row][col] = selectedNumber;

      // Add the number placement to the placement order
      setPlacementOrder((prevOrder) => [
        ...prevOrder,
        { step: prevOrder.length + 1, number: selectedNumber },
      ]);

      updateGridAndCheckWinner(newGrid, selectedNumber);
      setSelectedNumber(null);
    } else {
      setError("Invalid move!");
      setTimeout(() => setError(null), 3000);
    }

    // setSelectedCell({ row, col });
  };

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

        // Add the AI number placement to the placement order
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

  const handleCellDrop = (row, col, e) => {
    e.preventDefault();
    const draggedNumber = parseInt(e.dataTransfer.getData("text/plain"), 10);

    if (
      winner ||
      isNaN(draggedNumber) ||
      draggedNumber < 0 ||
      draggedNumber > 9
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
                  onDragOver={handleCellDragOver}
                  onDrop={(e) => handleCellDrop(i, j, e)}
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
