import WebSocket from "ws";
import { GameClientI } from "./clientHandler";
import {
  initGames,
  handleShoot,
  saveShips,
  handleReady,
  broadcast,
  getGameHistory,
} from "./gameActions";

const games: Record<string, any> = {};
let activeLobbies: string[] = [];

function start() {
  const wss = new WebSocket.Server({ port: 4000 });

  wss.on("connection", (wsClient: GameClientI) => {
    wsClient.on("message", async (message: { toString: () => string }) => {
      try {
        const req = JSON.parse(message.toString());

        if (req.event === "getGameHistory") {
          const { page, itemsPerPage } = req.payload;

          const { history, totalPages } = await getGameHistory(
            page,
            itemsPerPage
          );

          wsClient.send(
            JSON.stringify({
              event: "gameHistory",
              payload: {
                history,
                totalPages,
                currentPage: page,
              },
            })
          );
        }

        if (req.event === "getActiveLobbies") {
          const { page, itemsPerPage } = req.payload;

          const totalLobbies = activeLobbies.length;
          const totalPages = Math.ceil(totalLobbies / itemsPerPage);
          const startIndex = (page - 1) * itemsPerPage;
          const lobbiesToSend = activeLobbies.slice(
            startIndex,
            startIndex + itemsPerPage
          );

          wsClient.send(
            JSON.stringify({
              event: "activeLobbies",
              payload: {
                lobbies: lobbiesToSend,
                totalPages,
                currentPage: page,
              },
            })
          );
        }

        if (req.event === "connect") {
          wsClient.nickname = req.payload.username;
          initGames(wsClient, req.payload.gameId, games);
        } else if (req.event === "placeShip") {
          saveShips(req.payload, wsClient, req.payload.gameId, games);
        } else if (req.event === "shoot") {
          handleShoot(req.payload, wsClient, req.payload.gameId, games);
        } else if (req.event === "HIT" || req.event === "MISS") {
          broadcast(req, games);
        } else if (req.event === "ready") {
          handleReady(req.payload, wsClient, req.payload.gameId, games);
        } else if (req.event === "createLobby") {
          const code = req.payload.lobbyCode;
          activeLobbies.push(code);

          broadcast(
            {
              event: "activeLobbiesUpdate",
              payload: { activeLobbies },
            },
            games
          );
        }

        broadcast(req, games);
      } catch (error) {
        wsClient.send(
          JSON.stringify({
            event: "error",
            payload: { message: "Internal server error" },
          })
        );
      }
    });
  });
}

start();
