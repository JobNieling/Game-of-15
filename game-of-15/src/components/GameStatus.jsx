// components/GameStatus.jsx
import React from "react";
import "./GameStatus.css";

export default function GameStatus({ winner, onRestart }) {
  return (
    <div className="GameStatus">
      {winner === 'tie' ? (
        <h1>It's a Tie!</h1>
      ) : (
        <h1>{winner === null ? 'Game On!' : `${winner.toUpperCase()} Wins!`}</h1>
      )}
      <button onClick={onRestart}>Play Again</button>
    </div>
  );
}
