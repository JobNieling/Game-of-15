import React, { useState } from "react";
import "./StartScreen.css";

export default function StartScreen({ onStartGame, onPlayWithAI }) {
  const [playerChoice, setPlayerChoice] = useState("");

  const handleStartClick = () => {
    if (playerChoice) {
      onStartGame(playerChoice);
    }
  };

  const handleAIPlay = () => {
    if (playerChoice) {
      onPlayWithAI(playerChoice, true);
    }
  };

  return (
    <div className='start-screen'>
      <h1>Game of 15</h1>
      <div className='choice-buttons'>
        <button
          className={`choice-button ${
            playerChoice === "odd" ? "selected" : ""
          }`}
          onClick={() => setPlayerChoice("odd")}
        >
          Odd
        </button>
        <button
          className={`choice-button ${
            playerChoice === "even" ? "selected" : ""
          }`}
          onClick={() => setPlayerChoice("even")}
        >
          Even
        </button>
      </div>
      <button
        className='start-button'
        onClick={handleStartClick}
        disabled={!playerChoice}
      >
        Start Game
      </button>
      <button
        className='start-button'
        onClick={handleAIPlay}
        disabled={!playerChoice}
        style={{ marginTop: "10px" }}
      >
        Play with AI
      </button>
    </div>
  );
}
