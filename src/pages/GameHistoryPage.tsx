import React, { useEffect, useState } from "react";
import { Typography, Button } from "@mui/material";

const HistoryPage = () => {
  const [history, setHistory] = useState<{ date?: string; winner: string }[]>(
    []
  );
  const [playerStats, setPlayerStats] = useState<Record<string, number>>({});
  const [bestPlayer, setBestPlayer] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const storedHistory = JSON.parse(
      localStorage.getItem("gameHistory") || "[]"
    );
    setHistory(storedHistory);

    const stats: Record<string, number> = {};
    storedHistory.forEach((game: { winner: string }) => {
      stats[game.winner] = (stats[game.winner] || 0) + 1;
    });
    setPlayerStats(stats);
    let topPlayer: string | null = null;
    let maxWins = 0;
    for (const [player, wins] of Object.entries(stats)) {
      if (wins > maxWins && wins >= 2) {
        maxWins = wins;
        topPlayer = player;
      }
    }
    setBestPlayer(topPlayer);
  }, []);

  const totalGames = history.length;
  const totalPages = Math.ceil(
    Object.entries(playerStats).length / itemsPerPage
  );

  const currentStats = Object.entries(playerStats).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const PreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const NextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="history-page">
      <Typography
        sx={{
          color: "primary.main",
          fontWeight: "bold",
          fontSize: "2rem",
          letterSpacing: "1px",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
          marginBottom: 4,
        }}
      >
        Game Results
      </Typography>
      {bestPlayer && (
        <div>
          <Typography
            sx={{
              color: "primary.main",
              fontSize: "2rem",
              marginBottom: 4,
            }}
          >
            Best Player: {bestPlayer} (Wins: {playerStats[bestPlayer]})
          </Typography>
        </div>
      )}
      {totalGames === 0 ? (
        <p>No games played!</p>
      ) : (
        <div className="result-items">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Game</th>
                <th>Winner</th>
                <th>Wins</th>
              </tr>
            </thead>
            <tbody>
              {currentStats.map(([player, wins], index) => (
                <tr key={player}>
                  <td>{index + 1}</td>
                  <td>{player}</td>
                  <td>{wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <Button
              onClick={PreviousPage}
              disabled={currentPage === 1}
              sx={{ mb: 2 }}
            >
              Previous
            </Button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <Button
              onClick={NextPage}
              disabled={currentPage === totalPages}
              sx={{ mb: 2 }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
