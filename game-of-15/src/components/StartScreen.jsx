import React, { useState } from "react";
import "./StartScreen.css";

export default function StartScreen({
  onStartGame,
  onPlayWithAI,
  onAIStartGame,
}) {
  const [playerChoice, setPlayerChoice] = useState("");

  // Toggle player choice or reset if the same one is clicked
  const handleChoiceClick = (choice) => {
    setPlayerChoice((prevChoice) => (prevChoice === choice ? "" : choice));
    setPlayerChoice(choice);
  };

  const handleStartClick = () => {
    if (playerChoice) {
      onStartGame(playerChoice);
    }
  };

  const handleAIPlay = () => {
    if (playerChoice) {
      onPlayWithAI(playerChoice); // Player starts vs AI
    }
  };

  const handleAIPlayStart = () => {
    onAIStartGame(playerChoice); // Navigate without choice
  };

  return (
    <div className='start-screen'>
      <h1>Game of 15</h1>
      <div className='choice-buttons'>
        <button
          className={`choice-button ${
            playerChoice === "odd" ? "selected" : ""
          }`}
          onClick={() => handleChoiceClick("odd")}
        >
          Odd
        </button>
        <button
          className={`choice-button ${
            playerChoice === "even" ? "selected" : ""
          }`}
          onClick={() => handleChoiceClick("even")}
        >
          Even
        </button>
      </div>

      <button
        className='start-button'
        onClick={handleStartClick}
        disabled={!playerChoice}
      >
        Start Game (Player vs Player)
      </button>
      <button
        className='start-button'
        onClick={handleAIPlay}
        disabled={!playerChoice}
        style={{ marginTop: "10px" }}
      >
        Play with AI (Player Starts)
      </button>
      <button
        className='start-button'
        onClick={handleAIPlayStart}
        disabled={playerChoice}
        style={{ marginTop: "10px" }}
      >
        Start Play AI (AI Starts)
      </button>

      <div className='instructions-container'>
        <div className='instructions'>
          <h2>Instructions</h2>
          <p>The game is played on a 3x3 grid</p>
          <p>
            The player who makes the sum of the numbers in a row, column, or
            diagonal 15 wins the game.
          </p>
          <p>In this version, there is also a special 0.</p>
          <p>
            The 0 can be used in 2 ways: as a normal number or you can overwrite
            a number once!
          </p>
          <p className='bold'>Used is Used!</p>
        </div>

        <div className='game-modes'>
          <h2 className='bold'>The game can be played in two modes:</h2>
          <ul>
            <li>Player vs Player</li>
            <p>You can play against another player.</p>
            <li>Player vs AI</li>
            <p>You can play against an AI player.</p>
            <p>
              This AI is made in only winning mode, so don't be scared to lose!
            </p>
          </ul>
        </div>
      </div>
    </div>
  );
}
