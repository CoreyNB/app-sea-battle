import React from "react";

interface LobbyListProps {
  activeLobbies: string[];
  onJoin: (code: string) => void;
}

const LobbyList: React.FC<LobbyListProps> = ({ activeLobbies, onJoin }) => {
  return (
    <ul>
      {activeLobbies.map((code) => (
        <li key={code}>
          {code}
          <button onClick={() => onJoin(code)}>Join</button>
        </li>
      ))}
    </ul>
  );
};

export default LobbyList;
