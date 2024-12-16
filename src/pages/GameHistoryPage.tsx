import React, { useEffect, useState } from "react";

const HistoryPage = () => {
  const [history, setHistory] = useState<{ date?: string; winner: string }[]>(
    []
  );
  const [playerStats, setPlayerStats] = useState<Record<string, number>>({});
  const [bestPlayer, setBestPlayer] = useState<string | null>(null);

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
      if (wins > maxWins) {
        maxWins = wins;
        topPlayer = player;
      }
    }
    setBestPlayer(topPlayer);
  }, []);

  const totalGames = history.length;

  return (
    <div className="history-page">
      <h1>Game Results</h1>
      {bestPlayer && (
        <div>
          <span>
            <span className="lider">Best Player</span>: {bestPlayer} (Wins:{" "}
            {playerStats[bestPlayer]})
          </span>
        </div>
      )}
      {totalGames === 0 ? (
        <p>No games played!</p>
      ) : (
        <div className="result-items">
          <p>Total Games: {totalGames}</p>
          <div>
            {Object.entries(playerStats).map(([player, wins]) => (
              <span key={player}>
                <p>Winner</p>
                <p>
                  Name: {player} (Wins: {wins})
                </p>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
