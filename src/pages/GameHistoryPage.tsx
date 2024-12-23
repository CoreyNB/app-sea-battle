import React, { useContext, useState, useEffect } from "react";
import { WebSocketContext } from "../context/WsContext.tsx";
import { Button } from "@mui/material";

const HistoryPage = () => {
  const { ws } = useContext(WebSocketContext);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);
  const [history, setHistory] = useState<any[]>([]);
  const [bestPlayer, setBestPlayer] = useState<{
    name: string;
    wins: number;
  } | null>(null);

  useEffect(() => {
    if (ws) {
      ws.send(
        JSON.stringify({
          event: "getGameHistory",
          payload: { page: currentPage, itemsPerPage },
        })
      );
    }
  }, [currentPage, ws]);

  useEffect(() => {
    const handleMessage = (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.event === "gameHistory") {
          setHistory(data.payload.history);
          setTotalPages(data.payload.totalPages);

          const playerWins: Record<string, number> = {};

          data.payload.history.forEach((game: any) => {
            Object.entries(game.stats).forEach(
              ([player, stats]: [string, any]) => {
                playerWins[player] = (playerWins[player] || 0) + stats.wins;
              }
            );
          });

          const bestPlayerName = Object.keys(playerWins).reduce(
            (bestPlayer, player) => {
              if (playerWins[player] > (playerWins[bestPlayer] || 0)) {
                return player;
              }
              return bestPlayer;
            },
            ""
          );

          setBestPlayer({
            name: bestPlayerName,
            wins: playerWins[bestPlayerName] || 0,
          });
        }
      } catch (error) {}
    };

    if (ws) {
      ws.onmessage = (event) => handleMessage(event.data);
    }

    return () => {
      if (ws) {
        ws.onmessage = null;
      }
    };
  }, [ws]);

  const previousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="history-page">
      <h1>Game History</h1>
      {bestPlayer && (
        <div className="best-player">
          <h3>
            Best Player: "{bestPlayer.name}" Wins:({bestPlayer.wins})
          </h3>
        </div>
      )}
      {history.length > 0 ? (
        <div className="result-items">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Winner</th>
                <th>Date</th>
                <th>Games Played</th>
                <th>Wins</th>
              </tr>
            </thead>
            <tbody>
              {history.map((game, index) => (
                <tr key={index}>
                  <td>{game.winner}</td>
                  <td>{new Date(game.date).toLocaleString()}</td>
                  <td>
                    {Object.entries(game.stats).map(([player, stats]) => (
                      <div key={player}>
                        <span>{stats.games}</span>
                      </div>
                    ))}
                  </td>
                  <td>
                    {Object.entries(game.stats).map(([player, stats]) => (
                      <div key={player}>
                        <span>{stats.wins}</span>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <Button
              onClick={previousPage}
              disabled={currentPage === 1}
              sx={{ mb: 2 }}
            >
              Previous
            </Button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <Button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              sx={{ mb: 2 }}
            >
              Next
            </Button>
          </div>
        </div>
      ) : (
        <p>No game history</p>
      )}
    </div>
  );
};

export default HistoryPage;
