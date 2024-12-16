import WebSocket from "ws";
import { GameClientI } from "./clientHandler";
import {
  initGames,
  handleShoot,
  saveShips,
  handleReady,
  broadcast,
} from "./gameActions";

const games: Record<string, any> = {};
let activeLobbies: string[] = [];

function start() {
  const wss = new WebSocket.Server({ port: 4000 });

  wss.on("connection", (wsClient: GameClientI) => {
    wsClient.send(
      JSON.stringify({
        type: "activeLobbies",
        payload: activeLobbies,
      })
    );

    wsClient.on("message", (message: { toString: () => string }) => {
      try {
        const req = JSON.parse(message.toString());

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
      } catch (error) {}
    });
  });
}

start();
