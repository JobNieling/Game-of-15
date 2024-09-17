// App.js
import React, { useState } from "react";
import GameBoard from "./components/GameBoard";
import StartScreen from "./components/StartScreen";

function App() {
  const [gameState, setGameState] = useState("start"); // start, playing, or end
  const [playerChoice, setPlayerChoice] = useState(null);

  const handleStart = (choice) => {
    setPlayerChoice(choice);
    setGameState("playing");
  };

  const handleEnd = () => {
    setGameState("end");
  };

  const handlePlayAgain = () => {
    setGameState("start");
  };

  return (
    <div className='App'>
      {gameState === "start" && <StartScreen onStartGame={handleStart} />}
      {gameState === "playing" && (
        <GameBoard playerChoice={playerChoice} onGameEnd={handleEnd} />
      )}
      {gameState === "end" && <StartScreen onStartGame={handlePlayAgain} />}
    </div>
  );
}

export default App;
