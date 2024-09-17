// components/Scoreboard.jsx
import React from "react";
import "./Scoreboard.css";

export default function Scoreboard({ score }) {
  return (
    <div className='Scoreboard'>
      <h2>Scoreboard</h2>
      <p>Odd: {score.odd}</p>
      <p>Even: {score.even}</p>
    </div>
  );
}
