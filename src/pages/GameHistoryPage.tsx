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
      if (wins > maxWins && wins >= 2) {
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
            <span className="leader">Best Player</span>: {bestPlayer} (Wins:{" "}
            {playerStats[bestPlayer]})
          </span>
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
              {Object.entries(playerStats).map(([player, wins], index) => (
                <tr key={player}>
                  <td>{index + 1}</td>
                  <td>{player}</td>
                  <td>{wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
