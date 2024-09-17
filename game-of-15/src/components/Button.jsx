// Button.js
import React from "react";
import "./Button.css";

export default function Button({ label, onClick }) {
  return (
    <button className="Button" onClick={onClick}>
      {label}
    </button>
  );
}
