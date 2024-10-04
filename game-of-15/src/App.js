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
import GameBoardStart from "./components/GameBoardStart";

const Navigation = ({ playerChoice, setPlayerChoice, winner, setWinner }) => {
  const navigate = useNavigate();

  // Player starts the game
  const handleStartGame = (choice) => {
    setPlayerChoice({ choice, playerStarts: true });
    navigate("/playing");
    console.log("Redirecting to /playing. Player starts, choice:", choice);
  };

  // AI vs Player - player starts
  const handleAIPlay = (choice) => {
    setPlayerChoice({ choice, playerStarts: true });
    navigate("/AIPlaying");
    console.log(
      "Redirecting to /AIPlaying. Player starts, choice:",
      playerChoice
    );
  };

  const handleAIStartGame = (choice) => {
    setPlayerChoice(choice);
    navigate("/StartAIPlaying"); // Navigates to the /StartAIPlaying route
    console.log(
      "Redirecting to /StartAIPlaying. AI starts, player is: ",
      choice
    );
  };

  const handleEndGame = (result) => {
    setWinner(result);
  };

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
              onAIStartGame={handleAIStartGame} // Add new button to start with AI first
            />
          }
        />
        <Route
          path='/start'
          element={
            <StartScreen
              onStartGame={handleStartGame}
              onPlayWithAI={handleAIPlay}
              onAIStartGame={handleAIStartGame} // Button to start with AI first
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
            />
          }
        />
        <Route
          path='/StartAIPlaying'
          element={
            <GameBoardStart
              playerChoice={playerChoice}
              playerStarts={false} // AI starts the game
              onGameEnd={handleEndGame}
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
