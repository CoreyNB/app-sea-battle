import * as GameActions from "../actions/GamePageActions.tsx";
import { Ship } from "../interface/ShipInterface.tsx";

export const placeShip = (
  x: number,
  y: number,
  selectedShip: Ship | null,
  orientation: "horizontal" | "vertical",
  myBoard: any,
  dispatch: any,
  placedShipsCount: any,
  winnerMessage: string | null,
  ws: WebSocket | null
) => {
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
