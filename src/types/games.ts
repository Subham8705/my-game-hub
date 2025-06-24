export type GameMode = 'multiplayer' | 'computer';

export interface GameState {
  isPlaying: boolean;
  currentPlayer: string;
  winner: string | null;
  gameMode: GameMode;
}

export interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
}

export interface GameInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  minPlayers: number;
  maxPlayers: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Strategy' | 'Luck' | 'Logic';
}

// Tic Tac Toe types
export type TicTacToeCell = 'X' | 'O' | null;
export type TicTacToeBoard = TicTacToeCell[][];

// Rock Paper Scissors types
export type RPSChoice = 'rock' | 'paper' | 'scissors';

// Connect Four types
export type ConnectFourCell = 'red' | 'yellow' | null;
export type ConnectFourBoard = ConnectFourCell[][];

// Minesweeper types
export interface MinesweeperCell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
}
export type MinesweeperBoard = MinesweeperCell[][];

// Dots and Boxes types
export interface Line {
  id: string;
  isDrawn: boolean;
  player: string | null;
}

export interface Box {
  id: string;
  completedBy: string | null;
  lines: string[];
}