// components/GameRules.jsx
import React, { useState } from "react";
import GameBoard from "./GameBoard";
import "./GameRules.css";

export default function GameRules() {
  const [choice, setChoice] = useState(null);

  const startGame = (playerChoice) => {
    setChoice(playerChoice);
  };

  return (
    <div className='GameRules'>
      {choice === null ? (
        <div>
          <h1>Choose Your Side</h1>
          <button onClick={() => startGame("odd")}>Start as Odd</button>
          <button onClick={() => startGame("even")}>Start as Even</button>
        </div>
      ) : (
        <GameBoard playerChoice={choice} />
      )}
    </div>
  );
}
