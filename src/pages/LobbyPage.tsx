import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { WebSocketContext } from "../context/WsContext.tsx";
import { Button, TextField, Typography, Container, Box } from "@mui/material";

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
    setLobbyUrl(`http://192.168.88.249:3000`);

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
    <Container maxWidth="sm" sx={{ padding: 4 }}>
      <Typography
        variant="h1"
        sx={{
          color: "primary.main",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "4rem",
          letterSpacing: "1px",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
          marginBottom: 4,
        }}
      >
        Sea Battle
      </Typography>

      {!isLoggedIn && (
        <>
          <TextField
            label="Name"
            variant="outlined"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleLogin}
            disabled={!playerName}
            fullWidth
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </>
      )}

      {isLoggedIn && (
        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={handleCreateLobby}
            fullWidth
            sx={{ mb: 2 }}
          >
            Create Lobby
          </Button>

          {lobbyUrl && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h4"
                sx={{
                  color: "primary.main",
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                  letterSpacing: "1px",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                URL: {lobbyUrl}
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 2 }}>
            <span className="link" onClick={goToActiveLobbiesPage}>
              Active Lobbies
            </span>
          </Box>
          <Box sx={{ mb: 2 }}>
            <span className="link" onClick={() => navigate("/history")}>
              Game Results
            </span>
          </Box>

          <Typography variant="h5" sx={{ mb: 2 }}>
            Connect Code
          </Typography>
          <TextField
            label="Lobby Code"
            variant="outlined"
            value={createdLobbyCode || lobbyCode}
            onChange={(e) => setLobbyCode(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleJoinLobby}
            disabled={!lobbyCode}
            fullWidth
            sx={{ mb: 2 }}
          >
            Connect
          </Button>
          <Button
            variant="outlined"
            onClick={handleExit}
            fullWidth
            sx={{ mb: 2 }}
          >
            Exit
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default LobbyPage;
