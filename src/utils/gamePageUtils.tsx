import { Dispatch } from "redux";
import * as GameActions from "../actions/GamePageActions.tsx";
import { WebSocket } from "ws";

export const handleButtonClick = (
  gameStarted: boolean,
  ready: boolean,
  currentPlayer: number,
  dispatch: Dispatch,
  placedShipsCount: any,
  ws: WebSocket | null,
  setGameOngoing: (value: boolean) => void
) => {
  const anyShipPlaced = () => {
    return Object.values(placedShipsCount.myShips).some(
      (count: number) => count > 0
    );
  };

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

  GameActions.handleButtonClick(
    gameStarted,
    ready,
    currentPlayer,
    dispatch,
    placedShipsCount
  );
};
