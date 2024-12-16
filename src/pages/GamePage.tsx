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
    navigate("/");
  };

  return (
    <div>
      <h1>Sea Battle</h1>
      {winnerMessage && (
        <div className="game-over-message">
          <h2>{winnerMessage}</h2>
        </div>
      )}

      <div className="game-boards">
        <div className="my-board">
          <h3>
            "{playerName}"{currentPlayer === 1 && " (Shoots first)"}
          </h3>
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
              <button
                onClick={toggleOrientation}
                style={{
                  fontSize: "20px",
                  backgroundColor: isOrientation
                    ? "rgb(194, 194, 224)"
                    : "white",
                }}
              >
                🔄
              </button>
            </div>
          )}
        </div>

        <div className="opponent-board">
          <h3>
            "{opponentName || "Opponent"}"
            {currentPlayer === 2 && " (Shoots first)"}
          </h3>
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
        <button
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
        >
          START
        </button>
      )}

      {winnerMessage && <button onClick={handleBackToLobby}>Lobby</button>}
    </div>
  );
};
export default GamePage;
