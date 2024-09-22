const saveGameState = async (grid, result) => {
  try {
    const response = await fetch("http://localhost:5000/api/save-game-state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ grid, result }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to save game state");
    }

    console.log("Game state saved:", data);
  } catch (error) {
    console.error("Error saving game state:", error);
  }
};

// Call this function when the game ends
// Example of calling saveGameState based on game outcome
const grid = [
  [1, 2, null],
  [null, 5, 8],
  [null, null, 4],
];
const result = "TIE"; // Or 'WIN AI', 'LOSE AI'

saveGameState(grid, result);
