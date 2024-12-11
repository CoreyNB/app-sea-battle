import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";

interface WebSocketContextType {
  ws: WebSocket | null;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isReady, setIsReady] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:4000/");
    // const socket = new WebSocket("https://3bba-146-120-165-243.ngrok-free.app");
    socket.onopen = () => {
      const message = { payload: " " };
      socket.send(JSON.stringify(message));
      setIsReady(true);
    };

    socket.onclose = () => {
      setIsReady(false);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "connectPlay":
            break;
          case "readPlay":
            break;
          case "afterShoot":
            break;
          case "isHit":
            break;
          default:
        }
      } catch (error) {}
    };

    ws.current = socket;

    return () => {
      if (socket.readyState === 1) {
        socket.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ ws: ws.current }}>
      {isReady && children}
    </WebSocketContext.Provider>
  );
};
