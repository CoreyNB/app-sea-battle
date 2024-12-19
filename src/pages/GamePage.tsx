import React, { useEffect, useState, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import BattleBoard from "../components/BattleBoard.tsx";
import { useNavigate } from "react-router-dom";
import * as GameActions from "../actions/GamePageActions.tsx";
import { Ship } from "../interface/ShipInterface.tsx";
import { WebSocketContext } from "../context/WsContext.tsx";
import useGameSocket from "../hooks/useGameSocket.tsx";
import { removeShip } from "../utils/shipUtils.tsx";
import { shoot } from "../utils/shootUtils.tsx";
import ShipButtons from "../components/ShipButtons.tsx";
import { placeShip } from "../utils/shipActions.tsx";
import { handleButtonClick } from "../utils/gamePageUtils.tsx";
import { Button, Typography } from "@mui/material";

const GamePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    playerName,
    opponentName,
    gameStarted,
    myBoard,
    opponentBoard,
    currentPlayer,
    placedShipsCount,
    ready,
    winner,
  } = useSelector((state) => state.game);

  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
    "horizontal"
  );
  const { ws } = useContext(WebSocketContext);
  const [gameOngoing, setGameOngoing] = useState(false);
  const [isOrientation, setIsOrientation] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);
  const canShoot = gameStarted && currentPlayer !== 0;
  const [hasShot, setHasShot] = useState(false);

  useGameSocket(playerName, currentPlayer, setGameOngoing, setWinnerMessage);

  useEffect(() => {
    GameActions.initializeBoards(dispatch, myBoard, opponentBoard);
  }, [dispatch, myBoard, opponentBoard]);

  const toggleOrientation = () => {
    setOrientation((prev) =>
      prev === "horizontal" ? "vertical" : "horizontal"
    );
    setIsOrientation((prev) => !prev);
  };

  const handleBackToLobby = () => {
    dispatch(GameActions.resetGame());
    navigate("/");
  };

  return (
    <div>
      <Typography variant="h3" gutterBottom color="primary.main" align="center">
        Sea Battle
      </Typography>
      {winnerMessage && (
        <div className="game-over-message">
          <Typography variant="h4">{winnerMessage}</Typography>
        </div>
      )}

      <div className="game-boards" style={{ display: "flex" }}>
        <div className="my-board" style={{ marginRight: "20px" }}>
          <Typography variant="h5">
            "{playerName}" {currentPlayer === 1 && " (Shoots first)"}
          </Typography>
          {myBoard && (
            <BattleBoard
              board={myBoard}
              shoot={null}
              placeShip={(x, y) =>
                placeShip(
                  x,
                  y,
                  selectedShip,
                  orientation,
                  myBoard,
                  dispatch,
                  placedShipsCount,
                  winnerMessage,
                  ws
                )
              }
              removeShip={(x, y) =>
                removeShip(
                  x,
                  y,
                  myBoard,
                  placedShipsCount,
                  dispatch,
                  winnerMessage,
                  hasShot
                )
              }
              canShoot={false}
            />
          )}
          {!ready && !gameOngoing && !winner && (
            <div>
              <ShipButtons
                placedShipsCount={placedShipsCount}
                setSelectedShip={setSelectedShip}
                orientation={orientation}
                gameStarted={gameStarted}
                winner={winner}
              />
              <Button
                variant="outlined"
                onClick={toggleOrientation}
                style={{
                  fontSize: "10px",
                  backgroundColor: isOrientation
                    ? "rgb(194, 194, 224)"
                    : "white",
                  marginTop: "5px",
                }}
              >
                🔄
              </Button>
            </div>
          )}
        </div>

        <div className="opponent-board">
          <Typography variant="h5">
            "{opponentName || "Opponent"}"
            {currentPlayer === 2 && " (Shoots first)"}
          </Typography>
          {opponentBoard && (
            <BattleBoard
              board={opponentBoard}
              shoot={(x, y) =>
                shoot(
                  x,
                  y,
                  canShoot,
                  opponentBoard,
                  currentPlayer,
                  winnerMessage,
                  ws,
                  setHasShot
                )
              }
              placeShip={null}
              removeShip={null}
              canShoot={canShoot}
            />
          )}
        </div>
      </div>

      {!winner && (
        <Button
          variant="contained"
          onClick={() =>
            handleButtonClick(
              gameStarted,
              ready,
              currentPlayer,
              dispatch,
              placedShipsCount,
              ws,
              setGameOngoing
            )
          }
          disabled={hasShot || winner}
          style={{
            marginTop: "30px",
            display: "block",
            width: "100px",
            margin: "auto",
          }}
        >
          START
        </Button>
      )}

      {winnerMessage && (
        <Button
          variant="outlined"
          onClick={handleBackToLobby}
          style={{
            marginTop: "10px",
            display: "block",
            width: "200px",
            margin: "auto",
          }}
        >
          Lobby
        </Button>
      )}
    </div>
  );
};

export default GamePage;
