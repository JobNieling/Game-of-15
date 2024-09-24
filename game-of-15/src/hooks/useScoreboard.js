// hooks/useScoreboard.js
import { useState, useCallback, useEffect } from "react";

const useScoreboard = () => {
  const [score, setScore] = useState({ odd: 0, even: 0, tie: 0 });

  const fetchScoreboard = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/scoreboard");
      if (!response.ok) throw new Error("Network response was not ok.");
      const data = await response.json();
      setScore(data);
    } catch (error) {
      console.error("Error fetching scoreboard:", error);
    }
  }, []);

  useEffect(() => {
    fetchScoreboard();
  }, [fetchScoreboard]);

  return { score, fetchScoreboard };
};

export default useScoreboard;
