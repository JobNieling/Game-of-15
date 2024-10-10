import React from "react";
import "./GameStatus.css";

export default function GameStatus({ winner, onRestart, currentPlayer }) {
  if (winner) {
    return (
      <div className='game-status'>
        {winner === "tie" ? (
          <h2>It's a Tie!</h2>
        ) : (
          <h2>{winner === "odd" ? "Odd" : "Even"} Wins!</h2>
        )}
        <button onClick={onRestart}>Play Again</button>
      </div>
    );
  }

  return (
    <div className='game-status'>
      <h2>Player: {currentPlayer === "odd" ? "Odd's Turn" : "Even's Turn"}</h2>
    </div>
  );
}
