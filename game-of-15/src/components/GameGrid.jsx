import React from "react";
import "./GameGrid.css";

export default function GameGrid({ grid, onCellClick, selectedCell }) {
  return (
    <table className='GameGrid'>
      <tbody>
        {grid.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td
                key={j}
                className={`cell ${
                  selectedCell === i && selectedCell === j ? "selected" : ""
                } ${cell !== null ? "occupied" : ""}`}
                onClick={() => onCellClick(i, j)}
              >
                {cell !== null ? (
                  <span className='cell-number'>{cell}</span>
                ) : (
                  ""
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
