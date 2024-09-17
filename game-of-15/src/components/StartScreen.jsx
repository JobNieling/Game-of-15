import React, { useState } from "react";
import "./StartScreen.css";

export default function StartScreen({ onStartGame }) {
  const [playerChoice, setPlayerChoice] = useState("");

  const handleStartClick = () => {
    if (playerChoice) {
      onStartGame(playerChoice);
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
    </div>
  );
}
