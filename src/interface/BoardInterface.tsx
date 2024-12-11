export interface Cell {
  cell: { name: string; logo: null };
  x: number;
  y: number;
  label: { name: string; logo: string | null; color: string } | null;
}

export const createBoard = (): { cells: Cell[][] } => {
  const cells: Cell[][] = [];
  for (let i = 0; i < 10; i++) {
    const row: Cell[] = [];
    for (let j = 0; j < 10; j++) {
      row.push({
        cell: { name: "", logo: null },
        x: j,
        y: i,
        label: null,
      });
    }
    cells.push(row);
  }
  return { cells };
};
