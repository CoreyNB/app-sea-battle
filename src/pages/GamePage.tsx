import React, { useEffect, useState, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import BattleBoard from "../components/BattleBoard.tsx";
import { useNavigate } from "react-router-dom";
import * as GameActions from "../actions/GamePageActions.tsx";
import { Ship, ships } from "../interface/ShipInterface.tsx";
import { WebSocketContext } from "../context/WsContext.tsx";

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

  // const bothPlayersReady = ready && opponentReady;

  useEffect(() => {
    if (ws) {
      ws.send(
        JSON.stringify({
          event: "connect",
          payload: { username: playerName },
        })
      );

      ws.onmessage = (message) => {
        const data = JSON.parse(message.data);

        if (data.type === "currentPlayer") {
          dispatch({
            type: "SET_CURRENT_PLAYER",
            payload: data.payload.activePlayer,
          });
        }

        if (data.type === "SET_OPPONENT") {
          dispatch({
            type: "SET_OPPONENT_NAME",
            payload: data.payload.opponentName,
          });
        } else if (data.type === "gameShoot") {
          const { result, x, y, shooter } = data.payload;

          const isOpponentShoot = shooter !== playerName;

          if (result === "hit") {
            dispatch({
              type: "HIT",
              payload: {
                x,
                y,
                isOpponent: isOpponentShoot,
              },
            });
          } else if (result === "miss") {
            dispatch({
              type: "MISS",
              payload: {
                x,
                y,
                isOpponent: isOpponentShoot,
              },
            });
          }
        } else if (data.type === "rolePlayer") {
          dispatch({
            type: "SET_CURRENT_PLAYER",
            payload: parseInt(data.payload.role.split(" ", 2)[1]),
          });
        } else if (data.type === "gameStatus") {
          const { gameStarted, opponentReady } = data.payload;

          if (gameStarted) {
            setGameOngoing(true);
          }

          dispatch({
            type: "SET_OPPONENT_READY",
            payload: opponentReady,
          });
        } else if (data.event === "ready") {
          if (data.payload.ready) {
            // setOpponentReadyMessage(`"${data.payload.username}" ready game`);
            alert(`"${data.payload.username}" ready game!`);
          }
        } else if (data.event === "win") {
          setWinnerMessage(`${data.payload.winner} WINNER`);
        }
      };
    }
  }, [ws, playerName, currentPlayer, dispatch]);

  useEffect(() => {
    GameActions.initializeBoards(dispatch, myBoard, opponentBoard);
  }, [dispatch, myBoard, opponentBoard]);

  const toggleOrientation = () => {
    setOrientation((prev) =>
      prev === "horizontal" ? "vertical" : "horizontal"
    );
    setIsOrientation((prev) => !prev);
  };

  const placeShip = (x: number, y: number) => {
    if (winnerMessage) {
      alert("GAME OVER");
      return;
    }
    if (!selectedShip) return;

    const success = GameActions.placeShip(
      x,
      y,
      selectedShip,
      orientation,
      myBoard,
      dispatch,
      placedShipsCount,
      false
    );

    if (success && ws) {
      ws.send(
        JSON.stringify({
          event: "placeShip",
          payload: {
            ships: myBoard,
          },
        })
      );
    }
  };

  const removeShip = (x, y) => {
    if (winnerMessage) {
      alert("GAME OVER");
      return;
    }

    const cells = getFullShipCells(myBoard, x, y);

    if (cells.length === 0) {
      return;
    }

    cells.forEach((cell) => {
      myBoard[cell.status.y][cell.status.x].label = null;
    });

    dispatch({
      type: "PLACE_SHIP",
      payload: {
        board: myBoard,
        placedShipsCount: {
          ...placedShipsCount,
          myShips: {
            ...placedShipsCount.myShips,
            [cells.length]: placedShipsCount.myShips[cells.length] - 1,
          },
        },
      },
    });
  };

  const getFullShipCells = (board, x, y) => {
    const cells = [];

    const direction =
      (x > 0 && board[x - 1]?.[y]?.label?.name === "ship") ||
      (x < board.length - 1 && board[x + 1]?.[y]?.label?.name === "ship")
        ? "vertical"
        : "horizontal";

    if (direction === "vertical") {
      let i = x;
      while (i >= 0 && board[i][y]?.label?.name === "ship") {
        cells.push(board[i][y]);
        i--;
      }
      i = x + 1;
      while (i < board.length && board[i][y]?.label?.name === "ship") {
        cells.push(board[i][y]);
        i++;
      }
    }

    if (direction === "horizontal") {
      let j = y;
      while (j >= 0 && board[x][j]?.label?.name === "ship") {
        cells.push(board[x][j]);
        j--;
      }
      j = y + 1;
      while (j < board[x]?.length && board[x][j]?.label?.name === "ship") {
        cells.push(board[x][j]);
        j++;
      }
    }

    return cells;
  };

  const shoot = (x: number, y: number) => {
    if (winnerMessage) {
      alert("GAME OVER");
      return;
    }

    if (!canShoot) {
      return;
    }

    const hasAlreadyShot =
      opponentBoard[x][y].status === "hit" ||
      opponentBoard[x][y].status === "miss";

    if (hasAlreadyShot) {
      alert("The shot was fired");
      return;
    }

    if (currentPlayer === 2) {
      return;
    }

    if (ws) {
      ws.send(
        JSON.stringify({
          event: "shoot",
          payload: { x, y, isOpponent: true },
        })
      );
    }
    setHasShot(true);
  };

  const handleButtonClick = () => {
    if (anyShipPlaced() && !ready) {
      setGameOngoing(true);
    }

    if (ws) {
      ws.send(
        JSON.stringify({
          event: "ready",
          payload: { ready: !ready },
        })
      );
    }

    // if (anyShipPlaced() && !opponentReady) {
    //   ws.send(
    //     JSON.stringify({
    //       event: "ready",
    //       payload: { ready: !ready },
    //     })
    //   );
    // }

    GameActions.handleButtonClick(
      gameStarted,
      ready,
      currentPlayer,
      dispatch,
      placedShipsCount
    );
  };

  const anyShipPlaced = () => {
    return Object.values(placedShipsCount.myShips).some((count) => count > 0);
  };

  const renderShipButtons = () => {
    return ships.map((ship) => (
      <button
        key={ship.size}
        onClick={() =>
          placedShipsCount.myShips[ship.size] < ship.count &&
          setSelectedShip({ size: ship.size, coordinates: [], orientation })
        }
        disabled={
          !gameStarted ||
          placedShipsCount.myShips[ship.size] >= ship.count ||
          !!winner
        }
      >
        {ship.size} 🚢 {placedShipsCount.myShips[ship.size]} / {ship.count}
      </button>
    ));
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
            "{playerName}"{currentPlayer === 1 && "Shoots first"}
          </h3>
          {myBoard && (
            <BattleBoard
              board={myBoard}
              shoot={null}
              placeShip={(x, y) => placeShip(x, y)}
              removeShip={(x, y) => removeShip(x, y)}
              canShoot={false}
            />
          )}
          {!ready && !gameOngoing && !winner && (
            <div>
              {renderShipButtons()}
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
            {currentPlayer === 2 && "Shoots first"}
          </h3>
          {opponentBoard && (
            <BattleBoard
              board={opponentBoard}
              shoot={(x, y) => shoot(x, y)}
              placeShip={null}
              removeShip={null}
              canShoot={canShoot}
            />
          )}
          {/* {opponentReadyMessage && (
            <div className="opponent-ready-message">
              <h2>{opponentReadyMessage}</h2>
            </div>
          )} */}
        </div>
      </div>

      {!winner && (
        <button onClick={handleButtonClick} disabled={hasShot || winner}>
          START
        </button>
      )}

      {winnerMessage && <button onClick={handleBackToLobby}>Lobby</button>}
    </div>
  );
};
export default GamePage;
