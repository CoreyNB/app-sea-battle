import { createBoard } from "../interface/BoardInterface.tsx";
import { Ship, ships } from "../interface/ShipInterface.tsx";
import { Dispatch } from "redux";

export const initializeBoards = (
  dispatch: Dispatch,
  myBoard: any,
  opponentBoard: any
) => {
  if (!myBoard) dispatch({ type: "SET_MY_BOARD", payload: createBoard() });
  if (!opponentBoard)
    dispatch({ type: "SET_OPPONENT_BOARD", payload: createBoard() });
};

export const toggleShipOrientation = (
  orientation: "horizontal" | "vertical"
) => {
  return orientation === "horizontal" ? "vertical" : "horizontal";
};

export const placeShip = (
  x: number,
  y: number,
  selectedShip: Ship | null,
  orientation: "horizontal" | "vertical",
  myBoard: any,
  dispatch: Dispatch,
  placedShipsCount: any,
  isOpponent: boolean
) => {
  if (!selectedShip || isOpponent) return false;

  const size = selectedShip.size;

  if (
    placedShipsCount.myShips[size] >=
    ships.find((ship) => ship.size === size).count
  ) {
    alert("The game is on");
    return false;
  }

  const cells = getShipCells(y, x, size, orientation, myBoard);

  if (!canPlaceShip(cells, myBoard) || cells.length === 0) {
    alert("The ship can't be placed here");
    return false;
  }

  cells.forEach((cell) => {
    cell.label = { name: "ship", logo: "🚢" };
  });

  updateBoardWithShip(size, myBoard, placedShipsCount, dispatch);
  return true;
};

const getShipCells = (
  x: number,
  y: number,
  size: number,
  orientation: "horizontal" | "vertical",
  myBoard: any
) => {
  const cells: any[] = [];

  if (orientation === "horizontal") {
    if (x + size > myBoard[0].length) return [];
    for (let i = 0; i < size; i++) {
      cells.push(myBoard[y][x + i]);
    }
  } else {
    if (y + size > myBoard.length) return [];
    for (let i = 0; i < size; i++) {
      cells.push(myBoard[y + i][x]);
    }
  }

  return cells;
};

const canPlaceShip = (cells: any[], myBoard: any) => {
  return cells.every(
    (cell) =>
      cell && !cell.label && checkCells(cell.status.x, cell.status.y, myBoard)
  );
};

const checkCells = (x: number, y: number, myBoard: any) => {
  const surroundingOffsets = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  return surroundingOffsets.every(([dx, dy]) => {
    const newX = x + dx;
    const newY = y + dy;
    return (
      newX < 0 ||
      newX >= 10 ||
      newY < 0 ||
      newY >= 10 ||
      !myBoard[newY][newX].label
    );
  });
};

const updateBoardWithShip = (
  size: number,
  myBoard: any,
  placedShipsCount: any,
  dispatch: Dispatch
) => {
  const updatedBoard = myBoard.map((row) => row.map((cell) => ({ ...cell })));

  dispatch({
    type: "PLACE_SHIP",
    payload: {
      board: updatedBoard,
      placedShipsCount: {
        ...placedShipsCount,
        myShips: {
          ...placedShipsCount.myShips,
          [size]: placedShipsCount.myShips[size] + 1,
        },
      },
    },
  });
};

export const shoot = (
  x: number,
  y: number,
  isOpponent: boolean,
  myBoard: any,
  opponentBoard: any,
  dispatch: Dispatch,
  ws: WebSocket | null
) => {
  const targetBoard = isOpponent ? opponentBoard : myBoard;
  const cell = targetBoard?.cells?.[y]?.[x];

  const hit = !!(cell && cell.label && cell.label.name === "ship");

  if (isOpponent) {
    ws?.send(
      JSON.stringify({
        event: hit ? "HIT" : "MISS",
        payload: { x, y },
      })
    );
  }

  const newBoard = updateBoardAfterShoot(targetBoard, x, y, hit);

  dispatch(
    isOpponent
      ? { type: "HIT", payload: { x, y, board: newBoard } }
      : { type: "MISS", payload: { x, y, board: newBoard } }
  );
};

const updateBoardAfterShoot = (
  targetBoard: any,
  x: number,
  y: number,
  isHit: boolean
) => {
  if (!targetBoard || !targetBoard.cells) return targetBoard;
  return {
    ...targetBoard,
    cells: targetBoard.cells.map((row: { x: number; y: number }[]) =>
      row.map((cell: { x: number; y: number }) =>
        cell.x === x && cell.y === y
          ? {
              ...cell,
              label: {
                name: isHit ? "hit" : "miss",
                logo: isHit ? "💥" : "💣",
              },
            }
          : cell
      )
    ),
  };
};

export const handleButtonClick = (
  gameStarted: boolean,
  ready: boolean,
  currentPlayer: number,
  dispatch: Dispatch,
  placedShipsCount: any,
  ws: any,
  setGameOngoing: unknown
) => {
  if (!gameStarted) {
    dispatch({ type: "START_GAME" });
  } else if (!ready && allShipsPlaced(currentPlayer, placedShipsCount)) {
    dispatch({ type: "SET_READY", payload: true });
    if (currentPlayer === 1)
      dispatch({ type: "SET_OPPONENT_READY", payload: true });
  }
};

const allShipsPlaced = (player: number, placedShipsCount: any) => {
  if (
    !placedShipsCount ||
    !placedShipsCount.myShips ||
    !placedShipsCount.opponentShips
  ) {
    return false;
  }

  const countKey = player === 1 ? "myShips" : "opponentShips";

  return ships.every(
    (ship) => placedShipsCount[countKey][ship.size] === ship.count
  );
};
