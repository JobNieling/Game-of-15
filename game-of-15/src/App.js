import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import StartScreen from "./components/StartScreen";
import GameBoard from "./components/GameBoard";
import EndScreen from "./components/EndScreen";
import "./App.css";

const Navigation = ({ playerChoice, setPlayerChoice, winner, setWinner }) => {
  const navigate = useNavigate();

  const handleStartGame = (choice) => {
    setPlayerChoice(choice);
    navigate("/playing");
    console.log("Redirecting to /playing the user that begins is: ", choice);
  };

  const handleEndGame = (result) => {
    setWinner(result);
    navigate("/end");
  };

  const handleRestart = () => {
    setPlayerChoice(null);
    setWinner(null);
    navigate("/");
  };

  return (
    <>
      <Routes>
        <Route
          path='/'
          element={<StartScreen onStartGame={handleStartGame} />}
        />
        <Route
          path='/playing'
          element={
            <GameBoard playerChoice={playerChoice} onGameEnd={handleEndGame} />
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
