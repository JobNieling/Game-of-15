// components/GameRules.js
import React, { useState } from "react";
import GameBoard from "./GameBoard";
import Scoreboard from "./Scoreboard";
import "./GameRules.css";

export default function GameRules() {
  const [choice, setChoice] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [score, setScore] = useState({ odd: 0, even: 0 });

  const startGame = (playerChoice) => {
    setChoice(playerChoice);
    setGameEnded(false); // Reset game end status when starting a new game
  };

  const handleRestart = () => {
    setChoice(null);
    setGameEnded(false);
  };

  const handleEndGame = (winner) => {
    if (winner === "odd") {
      setScore((prevScore) => ({ ...prevScore, odd: prevScore.odd + 1 }));
    } else if (winner === "even") {
      setScore((prevScore) => ({ ...prevScore, even: prevScore.even + 1 }));
    }
    setGameEnded(true);
  };

  return (
    <div className='GameRules'>
      {choice === null ? (
        <div>
          <h1>Choose Your Side</h1>
          <button onClick={() => startGame("odd")}>Start as Odd</button>
          <button onClick={() => startGame("even")}>Start as Even</button>
        </div>
      ) : gameEnded ? (
        <div>
          <GameBoard playerChoice={choice} onEndGame={handleEndGame} />
          <Scoreboard score={score} />
          <button onClick={handleRestart}>Choose Starting Player Again</button>
        </div>
      ) : (
        <GameBoard playerChoice={choice} onEndGame={handleEndGame} />
      )}
    </div>
  );
}
