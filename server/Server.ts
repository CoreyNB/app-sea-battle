import WebSocket from "ws";

interface GameClientI {
  on: (event: string, callback: (message: any) => void) => void;
  nickname: string;
  send: (data: string) => void;
}

type Games = {
  [key: string]: {
    clients: GameClientI[];
    roles: string[];
    ships: { [key: string]: any };
    shoots: { [player: string]: { x: number; y: number; hit: boolean }[] };
    currentPlayer: number;
  };
};

const games: Games = {};

function start() {
  const wss = new WebSocket.Server({ port: 4000 });

  wss.on("connection", (wsClient: GameClientI) => {
    wsClient.on("message", (message: { toString: () => string }) => {
      try {
        const req = JSON.parse(message.toString());

        if (req.event === "connect") {
          wsClient.nickname = req.payload.username;
          initGames(wsClient, req.payload.gameId);
        } else if (req.event === "placeShip") {
          saveShips(req.payload, wsClient, req.payload.gameId);
        } else if (req.event === "shoot") {
          handleShoot(req.payload, wsClient, req.payload.gameId);
        } else if (req.event === "HIT" || req.event === "MISS") {
          updateShootResult(
            req.event,
            req.payload,
            wsClient,
            req.payload.gameId
          );
        } else if (req.event === "ready") {
          handleReady(req.payload, wsClient, req.payload.gameId);
        }

        broadcast(req);
      } catch (error) {
        console.error("error", error);
      }
    });
  });
}

function handleReady(
  payload: { ready: boolean },
  ws: GameClientI,
  gameId: string
) {
  const game = games[gameId];
  if (!game) return;

  const clientIndex = game.clients.indexOf(ws);
  if (clientIndex === -1) return;

  const playerRole = game.roles[clientIndex];

  if (clientIndex === 0) {
    game.roles[0] = payload.ready ? "player 1 (ready)" : "player 1 (not ready)";
  } else {
    game.roles[1] = payload.ready ? "player 2 (ready)" : "player 2 (not ready)";
  }

  game.clients.forEach((client) => {
    const opponentReady = game.roles[1 - clientIndex]
      ? game.roles[1 - clientIndex].includes("ready")
      : false;

    client.send(
      JSON.stringify({
        type: "gameStatus",
        payload: {
          opponentReady,
        },
      })
    );

    if (client !== ws) {
      client.send(
        JSON.stringify({
          event: "ready",
          payload: { ready: payload.ready, username: ws.nickname },
        })
      );
    }
  });
}

function initGames(ws: GameClientI, gameId: string) {
  if (!games[gameId]) {
    games[gameId] = {
      clients: [],
      roles: [],
      ships: {},
      shoots: {},
      currentPlayer: 0,
    };
  }

  if (games[gameId].clients.some((client) => client.nickname === ws.nickname)) {
    return;
  }

  if (games[gameId].clients.length >= 2) {
    ws.send(JSON.stringify({ type: "error" }));
    return;
  }

  const playerRole =
    games[gameId].clients.length === 0 ? "player 1" : "player 2";
  games[gameId].clients.push(ws);
  games[gameId].roles.push(playerRole);
  games[gameId].shoots[playerRole] = [];

  ws.send(
    JSON.stringify({ type: "rolePlayer", payload: { role: playerRole } })
  );

  if (games[gameId].clients.length === 2) {
    games[gameId].clients.forEach((client, index) => {
      const opponent = games[gameId].clients[1 - index];
      client.send(
        JSON.stringify({
          type: "SET_OPPONENT",
          payload: { opponentName: opponent.nickname },
        })
      );

      client.send(
        JSON.stringify({
          type: "startGame",
          payload: {
            opponents: games[gameId].clients.map((user) => user.nickname),
          },
        })
      );
    });
  }
}

function saveShips(payload: { ships: any }, ws: GameClientI, gameId: string) {
  if (games[gameId]) {
    const clientIndex = games[gameId].clients.indexOf(ws);

    if (clientIndex === -1) {
      return;
    }

    const playerRole = games[gameId].roles[clientIndex];

    if (!payload.ships || !Array.isArray(payload.ships)) {
      ws.send(JSON.stringify({ type: "error" }));
      return;
    }

    games[gameId].ships[playerRole] = payload.ships;

    ws.send(
      JSON.stringify({
        type: "shipSaved",
        payload: { success: true },
      })
    );
  }
}

function handleShoot(
  payload: { x: number; y: number; isOpponent: boolean },
  ws: GameClientI,
  gameId: string
) {
  const game = games[gameId];
  if (!game) return;

  const playerIndex = game.clients.indexOf(ws);
  if (playerIndex === -1) return;

  const activePlayer = game.roles[playerIndex];
  if (
    game.clients[playerIndex].nickname !==
    game.clients[game.currentPlayer]?.nickname
  ) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "",
      })
    );
    return;
  }

  const opponentIndex = playerIndex === 0 ? 1 : 0;
  const playerRole = game.roles[playerIndex];
  const opponentRole = game.roles[opponentIndex];

  const opponentBoard = game.ships[opponentRole];

  if (
    !opponentBoard ||
    !Array.isArray(opponentBoard) ||
    opponentBoard.length === 0
  ) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Opponent's board not ready",
      })
    );
    return;
  }

  const opponentBoardCell = opponentBoard[payload.x]?.[payload.y];
  const hit = opponentBoardCell && opponentBoardCell.label?.name === "ship";

  if (!game.shoots[playerRole]) {
    game.shoots[playerRole] = [];
  }

  game.shoots[playerRole].push({
    x: payload.x,
    y: payload.y,
    hit: hit,
  });

  game.clients.forEach((client) => {
    client.send(
      JSON.stringify({
        type: "gameShoot",
        payload: {
          shooter: ws.nickname,
          x: payload.x,
          y: payload.y,
          result: hit ? "hit" : "miss",
          isOpponent: client.nickname !== ws.nickname,
        },
      })
    );
  });

  const hits = game.shoots[playerRole].filter((shoot) => shoot.hit).length;
  if (hits >= 20) {
    game.clients.forEach((client) => {
      client.send(
        JSON.stringify({
          event: "win",
          payload: { winner: ws.nickname },
        })
      );
    });
    return;
  }

  if (!hit) {
    game.currentPlayer = opponentIndex;
    game.clients.forEach((client) => {
      client.send(
        JSON.stringify({
          type: "currentPlayer",
          payload: {
            activePlayer: game.clients[game.currentPlayer].nickname,
          },
        })
      );
    });
  }
}

function updateShootResult(
  result: string,
  payload: { x: number; y: number },
  ws: GameClientI,
  gameId: string
) {
  const playerIndex = games[gameId].clients.indexOf(ws);
  const opponentIndex = playerIndex ? 0 : 1;
  const opponentWs = games[gameId].clients[opponentIndex];

  if (opponentWs) {
    opponentWs.send(
      JSON.stringify({
        type: result === "HIT" ? "HIT" : "MISS",
        payload: { x: payload.x, y: payload.y },
      })
    );
  }
}

function broadcast(params: { event: string; payload: any }) {
  const { gameId } = params.payload;

  if (games[gameId]) {
    games[gameId].clients.forEach((client) => {
      let res: { type: string; payload: any };

      switch (params.event) {
        case "connect":
          res = {
            type: "connectPlay",
            payload: {
              success: true,
              opponentName: games[gameId].clients.find(
                (user) => user.nickname !== client.nickname
              )?.nickname,
              username: client.nickname,
            },
          };
          break;
        default:
          res = {
            type: "logout",
            payload: params.payload,
          };
          break;
      }
      client.send(JSON.stringify(res));
    });
  }
}

start();
