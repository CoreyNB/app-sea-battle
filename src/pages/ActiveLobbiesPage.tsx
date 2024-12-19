import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WebSocketContext } from "../context/WsContext.tsx";
import { Button } from "@mui/material";

const ActiveLobbiesPage = () => {
  const navigate = useNavigate();
  const { ws, activeLobbies } = useContext(WebSocketContext);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const totalLobbies = activeLobbies.length;
  const totalPages = Math.ceil(totalLobbies / itemsPerPage);

  const currentLobbies = activeLobbies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      {activeLobbies && activeLobbies.length > 0 ? (
        <div className="result-items">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Lobby Code</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentLobbies.map((code) => (
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
