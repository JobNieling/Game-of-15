// components/GameStatus.jsx
import React from "react";

export default function GameStatus({ winner, onRestart, currentPlayer }) {
  if (winner) {
    return (
      <div className='game-status'>
        {winner === "tie" ? <h2>It's a Tie!</h2> : <h2>{winner} Wins!</h2>}
        <button onClick={onRestart}>Play Again</button>
      </div>
    );
  }

  return <h2>Current Player: {currentPlayer}</h2>;
}
