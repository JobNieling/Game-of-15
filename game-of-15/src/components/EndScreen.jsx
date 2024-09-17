import React from "react";
import Scoreboard from "./Scoreboard";
import "./EndScreen.css";

export default function EndScreen({ winner, onRestart, score }) {
  return (
    <div className='EndScreen'>
      <h1>{winner === "tie" ? "It's a Tie!" : `${winner} Wins!`}</h1>
      <Scoreboard score={score} />
      <button onClick={onRestart}>Play Again</button>
    </div>
  );
}
