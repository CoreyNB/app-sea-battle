import React from "react";
import { Ship, ships } from "../interface/ShipInterface.tsx";

interface ShipButtonsProps {
  placedShipsCount: any;
  setSelectedShip: React.Dispatch<React.SetStateAction<Ship | null>>;
  orientation: "horizontal" | "vertical";
  gameStarted: boolean;
  winner: string | null;
}

const ShipButtons: React.FC<ShipButtonsProps> = ({
  placedShipsCount,
  setSelectedShip,
  orientation,
  gameStarted,
  winner,
}) => {
  return (
    <div>
      {ships.map((ship) => (
        <button
          key={ship.size}
          onClick={() =>
            placedShipsCount.myShips[ship.size] < ship.count &&
            setSelectedShip({ size: ship.size, coordinates: [], orientation })
          }
          disabled={
            !gameStarted ||
            placedShipsCount.myShips[ship.size] >= ship.count ||
            !!winner
          }
        >
          {ship.size} 🚢 {placedShipsCount.myShips[ship.size]} / {ship.count}
        </button>
      ))}
    </div>
  );
};

export default ShipButtons;
