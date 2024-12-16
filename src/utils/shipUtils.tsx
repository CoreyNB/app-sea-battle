export const getFullShipCells = (board: any[], x: number, y: number) => {
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

export const removeShip = (
  x: number,
  y: number,
  myBoard: any[],
  placedShipsCount: any,
  dispatch: any,
  winnerMessage: string | null,
  hasShot: boolean
) => {
  if (winnerMessage) {
    alert("GAME OVER");
    return;
  }
  if (hasShot) {
    alert("The game is on");
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
