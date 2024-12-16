export const shoot = (
  x: number,
  y: number,
  canShoot: boolean,
  opponentBoard: any,
  currentPlayer: number,
  winnerMessage: string | null,
  ws: WebSocket | null,
  setHasShot: React.Dispatch<React.SetStateAction<boolean>>
) => {
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
