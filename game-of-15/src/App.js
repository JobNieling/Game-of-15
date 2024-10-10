import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import StartScreen from "./components/StartScreen";
import GameBoard from "./components/GameBoard";
import GameBoardAI from "./components/GameBoardAI";
import EndScreen from "./components/EndScreen";
import "./App.css";
import GameBoardAI2 from "./components/GameBoardPlayerStart";

const Navigation = ({ playerChoice, setPlayerChoice, winner, setWinner }) => {
  const navigate = useNavigate();

  // Start game for human-vs-human gameplay
  const handleStartGame = (choice) => {
    setPlayerChoice(choice);
    navigate("/playing");
    console.log("Redirecting to /playing the user that begins is: ", choice);
  };

  // Start game for human-vs-AI where AI starts
  const handleAIPlay = (choice) => {
    setPlayerChoice(choice);
    navigate("/AIPlaying");
    console.log(
      "Redirecting to /AIPlaying the user that begins is: ",
      playerChoice
    );
  };

  // Start game for human-vs-AI where the player starts
  const handlePlayerStart = () => {
    // Randomly determine if the AI will play as odd or even
    const random = Math.floor(Math.random() * 2);
    console.log("Random number is: ", random);
    const choice = random === 0 ? "odd" : "even";
    console.log("Random choice is: ", choice);
    setPlayerChoice(choice);
    navigate("/AIPlayerStart");
    console.log(
      "Redirecting to /AIPlayerStart the user that begins is: ",
      playerChoice
    );
  };

  // Set winner at the end of the game
  const handleEndGame = (result) => {
    setWinner(result);
    // Commented out to allow viewing of the grid after winning. Uncomment to navigate to end screen.
    // navigate("/end");
  };

  // Restart the game, resetting all states
  const handleRestart = () => {
    setPlayerChoice(null);
    setWinner(null);
    navigate("/"); // Redirect to the start screen
  };

  return (
    <>
      <Routes>
        <Route
          path='/'
          element={
            <StartScreen
              onStartGame={handleStartGame}
              onPlayWithAI={handleAIPlay}
              onPlayerStart={handlePlayerStart}
            />
          }
        />
        <Route
          path='/start'
          element={
            <StartScreen
              onStartGame={handleStartGame}
              onPlayWithAI={handleAIPlay}
              onPlayerStart={handlePlayerStart}
            />
          }
        />
        <Route
          path='/playing'
          element={
            <GameBoard playerChoice={playerChoice} onGameEnd={handleEndGame} />
          }
        />
        <Route
          path='/AIPlaying'
          element={
            <GameBoardAI
              playerChoice={playerChoice}
              onGameEnd={handleEndGame}
              playerStart={false} // AI starts the game
            />
          }
        />
        <Route
          path='/AIPlayerStart'
          element={
            <GameBoardAI2
              playerChoice={playerChoice}
              onGameEnd={handleEndGame}
              playerStart={true} // Player starts the game
            />
          }
        />
        <Route
          path='/end'
          element={<EndScreen winner={winner} onRestart={handleRestart} />}
        />
      </Routes>
    </>
  );
};

function App() {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [winner, setWinner] = useState(null);

  return (
    <Router>
      <div className='App'>
        <main>
          <Navigation
            playerChoice={playerChoice}
            setPlayerChoice={setPlayerChoice}
            winner={winner}
            setWinner={setWinner}
          />
        </main>
      </div>
    </Router>
  );
}

export default App;
