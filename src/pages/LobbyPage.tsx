import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { WebSocketContext } from "../context/WsContext.tsx";

const LobbyPage = () => {
  const [playerName, setPlayerName] = useState("");
  const [lobbyUrl, setLobbyUrl] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [createdLobbyCode, setCreatedLobbyCode] = useState("");
  const [activeLobbies, setActiveLobbies] = useState<string[]>([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ws } = useContext(WebSocketContext);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "activeLobbies") {
            setActiveLobbies(message.payload);
          } else if (message.type === "activeLobbiesUpdate") {
            setActiveLobbies(message.payload.activeLobbies);
          }
        } catch (error) {}
      };
    }
  }, [ws]);

  const handleCreateLobby = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCreatedLobbyCode(code);
    setLobbyUrl(`http://192.168.88.244:3000`);
    if (ws) {
      ws.send(
        JSON.stringify({
          event: "createLobby",
          payload: { username: playerName, lobbyCode: code },
        })
      );
    }
  };

  const handleLogin = () => {
    if (playerName) {
      setIsLoggedIn(true);
      dispatch({ type: "SET_PLAYER_NAME", payload: playerName });
    }
  };

  const handleJoinLobby = () => {
    if (lobbyCode) {
      if (ws) {
        ws.send(
          JSON.stringify({
            event: "connect",
            payload: { username: playerName, gameId: lobbyCode },
          })
        );
      }

      navigate("/game/" + lobbyCode, {
        state: { gameStarted: true, lobbyCode },
      });
    }
  };

  const goToActiveLobbiesPage = () => {
    navigate("/active-lobbies", {
      state: { activeLobbies },
    });
  };

  return (
    <div className="main-lobby-container">
      <h1>Sea Battle</h1>
      <input
        type="text"
        placeholder="Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <button onClick={handleLogin} disabled={!playerName}>
        Login
      </button>
      <span className="link-lobby" onClick={() => navigate("/history")}>
        Game Results
      </span>

      {isLoggedIn && (
        <div className="button-items">
          <button onClick={handleCreateLobby}>Create Lobby</button>
          {lobbyUrl && (
            <div className="item-lobby">
              <span>URL</span>
              <p>{lobbyUrl}</p>
              <p>Code:{createdLobbyCode}</p>
            </div>
          )}

          <span className="link-lobby" onClick={goToActiveLobbiesPage}>
            View Active Lobbies
          </span>

          <h3>Connect Code</h3>
          <input
            type="text"
            value={lobbyCode}
            onChange={(e) => setLobbyCode(e.target.value)}
          />
          <button onClick={handleJoinLobby} disabled={!lobbyCode}>
            Connect
          </button>
        </div>
      )}
    </div>
  );
};

export default LobbyPage;
