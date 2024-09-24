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

const Navigation = ({ playerChoice, setPlayerChoice, winner, setWinner }) => {
  const navigate = useNavigate();

  const handleStartGame = (choice) => {
    setPlayerChoice(choice);
    navigate("/playing");
    console.log("Redirecting to /playing the user that begins is: ", choice);
  };

  const handleAIPlay = (choice) => {
    setPlayerChoice(!choice);
    navigate("/AIPlaying"); // Use navigate to redirect to the game screen
    console.log(
      "Redirecting to /AIPlaying the user that begins is: ",
      playerChoice
    );
  };

  const handleEndGame = (result) => {
    setWinner(result);
    // navigate("/end"); // Use navigate to redirect to the end screen
  };

  const handleRestart = () => {
    setPlayerChoice(null);
    setWinner(null);
    navigate("/"); // Use navigate to redirect to the start screen
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
            />
          }
        />
        <Route
          path='/start'
          element={
            <StartScreen
              onStartGame={handleStartGame}
              onPlayWithAI={handleAIPlay}
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
