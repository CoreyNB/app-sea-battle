import { ActionTypesEnum } from "../../enums/actionTypes.enum.ts";

interface GameState {
  myBoard: Array<Array<{ status: any }>>;
  opponentBoard: Array<Array<{ status: any }>>;
  gameStarted: boolean;
  currentPlayer: number;
  placedShipsCount: {
    myShips: { [key: number]: number };
    opponentShips: { [key: number]: number };
  };
  ready: boolean;
  opponentReady: boolean;
  playerName: string;
  opponentName: string;
  winner: string | null;
  lobbyCode: string;
  lastShoot: {
    x: number;
    y: number;
    result: "hit" | "miss" | null;
  } | null;
  myHits: number;
  opponentHits: number;
}

const initialState: GameState = {
  myBoard: Array.from({ length: 10 }, (_, rowIndex) =>
    Array.from({ length: 10 }, (_, colIndex) => ({
      status: { x: colIndex, y: rowIndex },
    }))
  ),

  opponentBoard: Array.from({ length: 10 }, (_, rowIndex) =>
    Array.from({ length: 10 }, (_, colIndex) => ({
      status: { x: colIndex, y: rowIndex },
    }))
  ),
  gameStarted: false,
  currentPlayer: 0,
  placedShipsCount: {
    myShips: { 1: 0, 2: 0, 3: 0, 4: 0 },
    opponentShips: { 1: 0, 2: 0, 3: 0, 4: 0 },
  },
  ready: false,
  opponentReady: false,
  playerName: "",
  opponentName: "",
  winner: null,
  lobbyCode: "",
  lastShoot: null,
  myHits: 0,
  opponentHits: 0,
};

const gameReducer = (state = initialState, action: any): GameState => {
  switch (action.type) {
    case ActionTypesEnum.START_GAME:
      return { ...state, gameStarted: true };

    case ActionTypesEnum.PLACE_SHIP:
      const { board, placedShipsCount } = action.payload;
      const updatedBoard = Array.isArray(board)
        ? board.map((row) =>
            row.map((cell) => ({
              ...cell,
              status: cell.status || "ship",
            }))
          )
        : state.myBoard;
      return {
        ...state,
        myBoard: updatedBoard,
        placedShipsCount,
      };

    case ActionTypesEnum.RESET_GAME:
      return { ...initialState };

    case ActionTypesEnum.SET_MY_BOARD:
      return { ...state, myBoard: action.payload };

    case ActionTypesEnum.SET_PLAYER_NAME:
      return { ...state, playerName: action.payload };

    case ActionTypesEnum.SET_OPPONENT_NAME:
      return { ...state, opponentName: action.payload };

    case ActionTypesEnum.SET_OPPONENT_BOARD:
      return { ...state, opponentBoard: action.payload };

    case ActionTypesEnum.SET_LOBBY_CODE:
      return { ...state, lobbyCode: action.payload };

    case ActionTypesEnum.HIT:
      return {
        ...state,
        [action.payload.isOpponent ? "myBoard" : "opponentBoard"]: state[
          action.payload.isOpponent ? "myBoard" : "opponentBoard"
        ].map((row, rowIndex) =>
          row.map((cell, colIndex) =>
            rowIndex === action.payload.x && colIndex === action.payload.y
              ? { ...cell, status: "hit", label: { name: "hit", logo: "❌" } }
              : cell
          )
        ),
      };

    case ActionTypesEnum.MISS:
      return {
        ...state,
        [action.payload.isOpponent ? "myBoard" : "opponentBoard"]: state[
          action.payload.isOpponent ? "myBoard" : "opponentBoard"
        ].map((row, rowIndex) =>
          row.map((cell, colIndex) =>
            rowIndex === action.payload.x && colIndex === action.payload.y
              ? { ...cell, status: "miss", label: { name: "miss", logo: "💣" } }
              : cell
          )
        ),
      };

    case ActionTypesEnum.SET_READY:
      return { ...state, ready: action.payload };

    case ActionTypesEnum.SET_CURRENT_PLAYER:
      return {
        ...state,
        currentPlayer: action.payload,
      };

    case ActionTypesEnum.SET_OPPONENT_READY:
      return { ...state, opponentReady: action.payload };

    case ActionTypesEnum.SET_WINNER:
      return { ...state, winner: action.payload };

    default:
      return state;
  }
};

export default gameReducer;
