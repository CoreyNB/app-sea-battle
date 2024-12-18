import { useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { WebSocketContext } from "../context/WsContext.tsx";

const useGameSocket = (
  playerName: string,
  currentPlayer: number,
  setGameOngoing: React.Dispatch<React.SetStateAction<boolean>>,
  setWinnerMessage: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const dispatch = useDispatch();
  const { ws } = useContext(WebSocketContext);

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
            alert(`"${data.payload.username}" ready game!`);
          }
        } else if (data.event === "win") {
          const winnerName = data.payload.winner;
          setWinnerMessage(`"${winnerName}" WINNER`);
          const history = JSON.parse(
            localStorage.getItem("gameHistory") || "[]"
          );
          const gameResult = {
            winner: winnerName,
          };
          history.push(gameResult);
          localStorage.setItem("gameHistory", JSON.stringify(history));
        }
      };
    }
  }, [
    ws,
    playerName,
    currentPlayer,
    dispatch,
    setGameOngoing,
    setWinnerMessage,
  ]);
};

export default useGameSocket;
