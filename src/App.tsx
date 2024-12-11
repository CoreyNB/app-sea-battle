import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import GamePage from "./pages/GamePage.tsx";
import LobbyPage from "./pages/LobbyPage.tsx";
import store from "./redux/Store.ts";
import { WebSocketProvider } from "./context/WsContext.tsx";

function App() {
  return (
    <Provider store={store}>
      <WebSocketProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/game/:id" element={<GamePage />} />
              <Route path="/" element={<LobbyPage />} />
            </Routes>
          </div>
        </Router>
      </WebSocketProvider>
    </Provider>
  );
}

export default App;
