import React from "react";
import "./Numbers.css";

export default function Numbers({
  availableNumbers,
  onNumberClick,
  onNumberDragStart,
}) {
  const handleDragStart = (number, e) => {
    e.dataTransfer.setData("text/plain", number); // Set data for drag
  };

  return (
    <div className='Numbers'>
      <div className='Numbers-row'>
        <h2>Odd</h2>
        <div className='numbers-list'>
          {availableNumbers
            .filter((n) => n % 2 === 1)
            .map((n) => (
              <div
                key={n}
                className={`number ${
                  n === 0 ? "" : !availableNumbers.includes(n) ? "disabled" : ""
                }`}
                onClick={() => onNumberClick(n)}
                draggable={availableNumbers.includes(n)}
                onDragStart={(e) => handleDragStart(n, e)}
              >
                {n}
              </div>
            ))}
        </div>
      </div>

      <div className='Numbers-row'>
        <h2>Even</h2>
        <div className='numbers-list'>
          {availableNumbers
            .filter((n) => n % 2 === 0)
            .map((n) => (
              <div
                key={n}
                className={`number ${
                  n === 0 ? "" : !availableNumbers.includes(n) ? "disabled" : ""
                }`}
                onClick={() => onNumberClick(n)}
                draggable={availableNumbers.includes(n)}
                onDragStart={(e) => handleDragStart(n, e)}
              >
                {n}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
