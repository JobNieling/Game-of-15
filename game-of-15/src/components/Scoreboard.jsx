import React from "react";
import useScoreboard from "../hooks/useScoreboard";
import "./Scoreboard.css";

const Scoreboard = () => {
  const { score, fetchScoreboard } = useScoreboard();

  const resetScoreboard = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/reset-scoreboard",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to reset scoreboard");
      console.log("Scoreboard reset:", await response.json());
      fetchScoreboard();
    } catch (error) {
      console.error("Error resetting scoreboard:", error);
    }
  };

  return (
    <div className='scoreboard-container'>
      <div className='scoreboard'>
        <h3>Scoreboard</h3>
        <div className='score'>
          <p>Odd: {score.odd}</p>
          <p>Even: {score.even}</p>
          <p>Tie: {score.tie}</p>
        </div>
      </div>
      <button className='reset-button' onClick={resetScoreboard}>
        Reset Scoreboard
      </button>
    </div>
  );
};

export default Scoreboard;
