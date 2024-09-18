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

const Navigation = ({
  playerChoice,
  setPlayerChoice,
  winner,
  setWinner,
  fetchScoreboard,
}) => {
  const navigate = useNavigate(); // useNavigate is now correctly used here

  const handleStartGame = (choice) => {
    setPlayerChoice(choice);
    navigate("/playing"); // Use navigate to redirect to the game screen
    console.log("Redirecting to /playing the user that begins is: ", choice);
  };

  const handleEndGame = (result) => {
    setWinner(result);
    fetchScoreboard();
    navigate("/end"); // Use navigate to redirect to the end screen
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
  const [score, setScore] = useState({ odd: 0, even: 0, tie: 0 });

  const fetchScoreboard = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/scoreboard");
      if (!response.ok) throw new Error("Network response was not ok.");
      const data = await response.json();
      setScore(data);
    } catch (error) {
      console.error("Error fetching scoreboard:", error);
    }
  };

  return (
    <Router>
      <div className='App'>
        <main>
          <Navigation
            playerChoice={playerChoice}
            setPlayerChoice={setPlayerChoice}
            winner={winner}
            setWinner={setWinner}
            fetchScoreboard={fetchScoreboard}
          />
        </main>
      </div>
    </Router>
  );
}

export default App;
