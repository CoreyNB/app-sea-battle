import React from "react";
import BoardComponent from "./BoardComponent.tsx";

const BattleBoard = ({ board, shoot, placeShip, removeShip, canShoot }) => {
  const boardClass = ["board", canShoot ? "shoot-active" : ""].join(" ");

  const handleAction = (x, y, cell) => {
    if (canShoot) {
      shoot(x, y, true);
    } else if (cell?.label?.name === "ship") {
      removeShip(x, y);
    } else if (placeShip) {
      placeShip(x, y);
    }
  };

  const columnLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  return (
    <>
      <div style={{ display: "flex", marginLeft: "30px", marginBottom: "4px" }}>
        {columnLetters.map((letter, index) => (
          <div style={{ fontWeight: "600", marginRight: "19px" }} key={index}>
            {letter}
          </div>
        ))}
      </div>
      <div style={{ display: "flex" }}>
        <div className="board-header">
          {Array.from({ length: 10 }, (_, index) => (
            <div
              style={{ marginBottom: "12px", fontWeight: "600" }}
              key={index}
            >
              {index + 1}
            </div>
          ))}
        </div>

        <div className={boardClass}>
          {board.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((cell, colIndex) => (
                <BoardComponent
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  handleAction={() => handleAction(rowIndex, colIndex, cell)}
                  canShoot={canShoot}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

export default BattleBoard;
