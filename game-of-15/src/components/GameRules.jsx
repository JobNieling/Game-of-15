import React, { useState } from "react";
import GameBoard from "./GameBoard";
import "./GameRules.css";

export default function GameRules() {
  const [choice, setChoice] = useState(null);
  const [playerChoice, setPlayerChoice] = useState(null);

  const startGame = (playerChoice) => {
    setPlayerChoice(playerChoice);
    setChoice("game");
  };

  const restartGame = () => {
    setChoice(null);
    setPlayerChoice(null);
  };

  return (
    <div className='GameRules'>
      {choice === null ? (
        <div>
          <h1>Choose Your Side</h1>
          <button onClick={() => startGame("odd")}>Start as Odd</button>
          <button onClick={() => startGame("even")}>Start as Even</button>
        </div>
      ) : choice === "game" ? (
        <GameBoard playerChoice={playerChoice} onRestart={restartGame} />
      ) : (
        <div>
          <h1>Game Over</h1>
          <button onClick={restartGame}>Play Again</button>
        </div>
      )}
    </div>
  );
}
