import React from "react";
import Scoreboard from "./Scoreboard";
import "./EndScreen.css";

export default function EndScreen({ winner, onRestart }) {
  return (
    <div className='end-screen'>
      <h1>{winner === "tie" ? "It's a Tie!" : `${winner} Wins!`}</h1>
      <Scoreboard />
      <button onClick={onRestart}>Play Again</button>
    </div>
  );
}
