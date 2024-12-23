import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WebSocketContext } from "../context/WsContext.tsx";
import { Button } from "@mui/material";

const ActiveLobbiesPage = () => {
  const navigate = useNavigate();
  const { ws } = useContext(WebSocketContext);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [totalPages, setTotalPages] = useState(1);
  const [lobbies, setLobbies] = useState<string[]>([]);

  useEffect(() => {
    if (ws) {
      ws.send(
        JSON.stringify({
          event: "getActiveLobbies",
          payload: { page: currentPage, itemsPerPage },
        })
      );
    }
  }, [currentPage, ws]);

  useEffect(() => {
    const handleMessage = (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.event === "activeLobbies") {
          setLobbies(data.payload.lobbies);
          setTotalPages(data.payload.totalPages);
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

  const handleJoinLobby = (code: string) => {
    if (code && ws) {
      ws.send(
        JSON.stringify({
          event: "connect",
          payload: { username: "playerName", gameId: code },
        })
      );
      navigate("/game/" + code, {
        state: { gameStarted: true, lobbyCode: code },
      });
    }
  };

  const previousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="lobbies-page">
      <h1>Active Lobbies</h1>
      {lobbies.length > 0 ? (
        <div className="result-items">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Lobby Code</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {lobbies.map((code) => (
                <tr key={code}>
                  <td>{code}</td>
                  <td>
                    <span
                      onClick={() => handleJoinLobby(code)}
                      className="join-action"
                    >
                      Join the game
                    </span>
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
        <p>No active lobbies</p>
      )}
    </div>
  );
};

export default ActiveLobbiesPage;
