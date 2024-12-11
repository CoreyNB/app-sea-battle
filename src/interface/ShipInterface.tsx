export interface Ship {
  size: number;
  coordinates: { x: number; y: number }[];
  orientation: "horizontal" | "vertical";
}

export const ships = [
  { size: 4, count: 1 },
  { size: 3, count: 2 },
  { size: 2, count: 3 },
  { size: 1, count: 4 },
];
