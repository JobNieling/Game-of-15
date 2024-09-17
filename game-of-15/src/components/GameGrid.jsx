import React from "react";
import "./GameGrid.css";

export default function GameGrid({
  grid,
  onCellClick,
  onCellDrop,
  onCellDragOver,
  selectedCell,
}) {
  return (
    <table className='GameGrid'>
      <tbody>
        {grid.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td
                key={j}
                className={`cell ${
                  selectedCell &&
                  selectedCell.row === i &&
                  selectedCell.col === j
                    ? "selected"
                    : ""
                }`}
                onClick={() => onCellClick(i, j)}
                onDragOver={onCellDragOver}
                onDrop={(e) => onCellDrop(i, j, e)}
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
