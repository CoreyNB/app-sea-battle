import React from "react";

const BoardComponent = ({ cell, handleAction, canShoot }) => {
  const handleClick = () => {
    handleAction();
  };

  return (
    <div
      className={`cell ${cell.label?.name}`}
      onClick={handleClick}
      style={{ backgroundColor: cell.label ? cell.label.color : "white" }}
    >
      {cell.label?.logo ? (
        <div>{cell.label?.logo}</div>
      ) : (
        <div>
          {cell.label?.name === "miss"
            ? "💣"
            : cell.label?.name === "hit"
            ? "💥"
            : ""}
        </div>
      )}
    </div>
  );
};

export default BoardComponent;
