import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { WebSocketContext } from "../context/WsContext.tsx";

const ActiveLobbiesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ws } = useContext(WebSocketContext);

  const { activeLobbies } = location.state || {};

  const handleJoinLobby = (code) => {
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
    <div>
      <h1>Active Lobbies</h1>
      <ul>
        {activeLobbies ? (
          activeLobbies.map((code) => (
            <li key={code}>
              {code}
              <button onClick={() => handleJoinLobby(code)}>Join</button>
            </li>
          ))
        ) : (
          <p>No active lobbies</p>
        )}
      </ul>
    </div>
  );
};

export default ActiveLobbiesPage;
