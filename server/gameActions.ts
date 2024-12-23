import { GameClientI } from "./clientHandler";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface GameState {
  clients: GameClientI[];
  roles: string[];
  ships: Record<string, any>;
  shoots: Record<string, { x: number; y: number; hit: boolean }[]>;
  currentPlayer: number;
  gameHistory: {
    winner: string;
    date: string;
    stats: Record<string, { games: number; wins: number }>;
  }[];
}

export function initGames(
  ws: GameClientI,
  gameId: string,
  games: Record<string, GameState>
) {
  if (!games[gameId]) {
    games[gameId] = {
      clients: [],
      roles: [],
      ships: {},
      shoots: {},
      currentPlayer: 0,
      gameHistory: [],
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

export function saveShips(
  payload: { ships: any },
  ws: GameClientI,
  gameId: string,
  games: Record<string, GameState>
) {
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

export function handleReady(
  payload: { ready: boolean },
  ws: GameClientI,
  gameId: string,
  games: Record<string, GameState>
) {
  const game = games[gameId];
  if (!game) return;

  const clientIndex = game.clients.indexOf(ws);
  if (clientIndex === -1) return;

  //   const playerRole = game.roles[clientIndex];

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

export async function saveGameHistory(
  winner: string,
  gameStats: Record<string, { games: number; wins: number }>
) {
  const gameHistory = await prisma.gameHistory.create({
    data: {
      winner,
      stats: gameStats,
      playerStats: {
        create: Object.entries(gameStats).map(([player, stats]) => ({
          player,
          games: stats.games,
          wins: stats.wins,
        })),
      },
    },
  });

  return gameHistory;
}

export async function handleShoot(
  payload: { x: number; y: number; isOpponent: boolean },
  ws: GameClientI,
  gameId: string,
  games: Record<string, GameState>
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

    const gameHistory = game.gameHistory || (game.gameHistory = []);
    const winner = ws.nickname;

    const stats =
      gameHistory.find((entry) => entry.winner === winner)?.stats || {};

    if (stats[winner]) {
      stats[winner].wins += 1;
    } else {
      stats[winner] = { games: 1, wins: 1 };
    }

    gameHistory.push({
      winner,
      date: new Date().toISOString(),
      stats,
    });

    await saveGameHistory(winner, stats);

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

    const opponent = game.clients[opponentIndex];
    if (opponent) {
      opponent.send(
        JSON.stringify({
          event: "alert",
          payload: { message: "Your turn" },
        })
      );
    }
  }
}

export async function getGameHistory(page: number, itemsPerPage: number) {
  const gameHistory = await prisma.gameHistory.findMany({
    skip: (page - 1) * itemsPerPage,
    take: itemsPerPage,
    include: {
      playerStats: true,
    },
  });

  const totalGames = await prisma.gameHistory.count();

  return {
    history: gameHistory,
    totalPages: Math.ceil(totalGames / itemsPerPage),
  };
}

export function broadcast(
  params: { event: string; payload: any },
  games: Record<string, GameState>
) {
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
