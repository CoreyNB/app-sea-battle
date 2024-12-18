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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ws } = useContext(WebSocketContext);

  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");

    if (storedName && storedIsLoggedIn === "true") {
      setPlayerName(storedName);
      setIsLoggedIn(true);
      dispatch({ type: "SET_PLAYER_NAME", payload: storedName });
    }
  }, [dispatch]);

  const handleCreateLobby = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCreatedLobbyCode(code);
    setLobbyCode(code);
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
      localStorage.setItem("playerName", playerName);
      localStorage.setItem("isLoggedIn", "true");
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

  const handleExit = () => {
    setIsLoggedIn(false);
    setPlayerName("");
    setLobbyCode("");
    setLobbyUrl("");
    setCreatedLobbyCode("");
    localStorage.removeItem("playerName");
    localStorage.removeItem("isLoggedIn");
  };

  const goToActiveLobbiesPage = () => {
    navigate("/active-lobbies");
  };

  return (
    <div className="main-lobby-container">
      <h1>🚢 Sea Battle</h1>
      {!isLoggedIn && (
        <>
          <input
            type="text"
            placeholder="Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={handleLogin} disabled={!playerName}>
            Login
          </button>
        </>
      )}

      {isLoggedIn && (
        <div className="button-items">
          <button onClick={handleCreateLobby}>Create Lobby</button>
          {lobbyUrl && (
            <div className="item-lobby">
              <p> URL: {lobbyUrl}</p>
            </div>
          )}

          <span className="link-lobby" onClick={goToActiveLobbiesPage}>
            Active Lobbies
          </span>
          <span className="link-lobby" onClick={() => navigate("/history")}>
            Game Results
          </span>

          <h3>Connect Code</h3>
          <input
            type="text"
            value={createdLobbyCode || lobbyCode}
            onChange={(e) => setLobbyCode(e.target.value)}
          />
          <button onClick={handleJoinLobby} disabled={!lobbyCode}>
            Connect
          </button>
          <button onClick={handleExit} className="exit-button">
            Exit
          </button>
        </div>
      )}
    </div>
  );
};

export default LobbyPage;
