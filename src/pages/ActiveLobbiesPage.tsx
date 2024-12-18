import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { WebSocketContext } from "../context/WsContext.tsx";

const ActiveLobbiesPage = () => {
  const navigate = useNavigate();
  const { ws, activeLobbies } = useContext(WebSocketContext);

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
              {activeLobbies.map((code) => (
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
        </div>
      ) : (
        <p>No active lobbies</p>
      )}
    </div>
  );
};

export default ActiveLobbiesPage;
