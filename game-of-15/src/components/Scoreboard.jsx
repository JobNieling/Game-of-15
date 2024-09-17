// components/Scoreboard.jsx
import React from "react";
import "./Scoreboard.css";

export default function Scoreboard({ score }) {
  return (
    <div className="Scoreboard">
      <h3>Scoreboard</h3>
      <p>Odd Wins: {score.odd}</p>
      <p>Even Wins: {score.even}</p>
    </div>
  );
}
