import React from "react";
import { Ship, ships } from "../interface/ShipInterface.tsx";
import { Button } from "@mui/material";

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
        <Button
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
          variant="outlined"
          color="primary"
          sx={{
            display: "flex",
            marginTop: "10px",
            marginBottom: "8px",
            width: "50%",
            textAlign: "center",
            borderRadius: "8px",
            fontWeight: "bold",
            textTransform: "none",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
              backgroundColor: "rgba(0, 123, 255, 0.1)",
            },
          }}
        >
          {ship.size} 🚢 {placedShipsCount.myShips[ship.size]} / {ship.count}
        </Button>
      ))}
    </div>
  );
};

export default ShipButtons;
