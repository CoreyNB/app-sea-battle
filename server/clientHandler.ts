export interface GameClientI {
  on: (event: string, callback: (message: any) => void) => void;
  nickname: string;
  send: (data: string) => void;
}
