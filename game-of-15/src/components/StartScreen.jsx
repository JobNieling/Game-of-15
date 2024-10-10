import React, { useState } from "react";
import "./StartScreen.css";
import { set } from "mongoose";

export default function StartScreen({
  onStartGame,
  onPlayWithAI,
  onPlayerStart,
}) {
  const [playerChoice, setPlayerChoice] = useState("");
  const [playerStart, setPlayerStart] = useState(false);

  const handleStartClick = () => {
    if (playerChoice) {
      onStartGame(playerChoice);
    }
  };

  const handleAIPlay = () => {
    if (playerChoice) {
      onPlayWithAI(playerChoice, true, false);
    }
  };

  const randomChoice = () => {
    const choices = ["odd", "even"];
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
  };

  const handlePlayerStart = () => {
    const choice = randomChoice();
    setPlayerChoice(choice);
    onPlayerStart(choice, true);
    // onPlayWithAI(choice, true, true);
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
      <button
        className='start-button'
        onClick={handlePlayerStart}
        style={{ marginTop: "10px" }}
      >
        Player Start
      </button>

      <div className='instructions-container'>
        <div className='instructions'>
          <h2>Instructions</h2>
          <p>The game is played on a 3x3 grid</p>
          <p>
            The player who makes the sum of the numbers in a row, column, or
            diagonal 15 wins the game.
          </p>
          <p>In this version there is also a special 0.</p>
          <p>
            The 0 can be used in 2 ways, as a normal number or you can overwrite
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
