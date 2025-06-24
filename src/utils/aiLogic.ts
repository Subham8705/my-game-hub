import { TicTacToeBoard, RPSChoice, ConnectFourBoard } from '../types/games';

// Tic Tac Toe AI
export function getTicTacToeAIMove(board: TicTacToeBoard): [number, number] | null {
  // Check for winning move
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === null) {
        board[i][j] = 'O';
        if (checkTicTacToeWinner(board) === 'O') {
          board[i][j] = null;
          return [i, j];
        }
        board[i][j] = null;
      }
    }
  }

  // Block player's winning move
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === null) {
        board[i][j] = 'X';
        if (checkTicTacToeWinner(board) === 'X') {
          board[i][j] = null;
          return [i, j];
        }
        board[i][j] = null;
      }
    }
  }

  // Take center if available
  if (board[1][1] === null) {
    return [1, 1];
  }

  // Take corners
  const corners = [[0, 0], [0, 2], [2, 0], [2, 2]];
  const availableCorners = corners.filter(([i, j]) => board[i][j] === null);
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)] as [number, number];
  }

  // Take any available spot
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === null) {
        return [i, j];
      }
    }
  }

  return null;
}

export function checkTicTacToeWinner(board: TicTacToeBoard): string | null {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
      return board[i][0];
    }
  }

  // Check columns
  for (let j = 0; j < 3; j++) {
    if (board[0][j] && board[0][j] === board[1][j] && board[0][j] === board[2][j]) {
      return board[0][j];
    }
  }

  // Check diagonals
  if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
    return board[0][0];
  }
  if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
    return board[0][2];
  }

  return null;
}

// Rock Paper Scissors AI
export function getRPSAIChoice(): RPSChoice {
  const choices: RPSChoice[] = ['rock', 'paper', 'scissors'];
  return choices[Math.floor(Math.random() * choices.length)];
}

export function getRPSWinner(player1: RPSChoice, player2: RPSChoice): string | null {
  if (player1 === player2) return null;
  
  if (
    (player1 === 'rock' && player2 === 'scissors') ||
    (player1 === 'paper' && player2 === 'rock') ||
    (player1 === 'scissors' && player2 === 'paper')
  ) {
    return 'Player 1';
  }
  
  return 'Player 2';
}

// Connect Four AI
export function getConnectFourAIMove(board: ConnectFourBoard): number {
  // Simple AI - try to win, then block, then random
  const rows = board.length;
  const cols = board[0].length;

  // Check for winning move
  for (let col = 0; col < cols; col++) {
    if (isValidConnectFourMove(board, col)) {
      const tempBoard = board.map(row => [...row]);
      const row = getLowestEmptyRow(tempBoard, col);
      if (row !== -1) {
        tempBoard[row][col] = 'yellow';
        if (checkConnectFourWinner(tempBoard) === 'yellow') {
          return col;
        }
      }
    }
  }

  // Check for blocking move
  for (let col = 0; col < cols; col++) {
    if (isValidConnectFourMove(board, col)) {
      const tempBoard = board.map(row => [...row]);
      const row = getLowestEmptyRow(tempBoard, col);
      if (row !== -1) {
        tempBoard[row][col] = 'red';
        if (checkConnectFourWinner(tempBoard) === 'red') {
          return col;
        }
      }
    }
  }

  // Random valid move
  const validMoves = [];
  for (let col = 0; col < cols; col++) {
    if (isValidConnectFourMove(board, col)) {
      validMoves.push(col);
    }
  }

  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

export function isValidConnectFourMove(board: ConnectFourBoard, col: number): boolean {
  return board[0][col] === null;
}

export function getLowestEmptyRow(board: ConnectFourBoard, col: number): number {
  for (let row = board.length - 1; row >= 0; row--) {
    if (board[row][col] === null) {
      return row;
    }
  }
  return -1;
}

export function checkConnectFourWinner(board: ConnectFourBoard): string | null {
  const rows = board.length;
  const cols = board[0].length;

  // Check horizontal
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols - 3; col++) {
      if (board[row][col] && 
          board[row][col] === board[row][col + 1] &&
          board[row][col] === board[row][col + 2] &&
          board[row][col] === board[row][col + 3]) {
        return board[row][col];
      }
    }
  }

  // Check vertical
  for (let row = 0; row < rows - 3; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col] && 
          board[row][col] === board[row + 1][col] &&
          board[row][col] === board[row + 2][col] &&
          board[row][col] === board[row + 3][col]) {
        return board[row][col];
      }
    }
  }

  // Check diagonal (top-left to bottom-right)
  for (let row = 0; row < rows - 3; row++) {
    for (let col = 0; col < cols - 3; col++) {
      if (board[row][col] && 
          board[row][col] === board[row + 1][col + 1] &&
          board[row][col] === board[row + 2][col + 2] &&
          board[row][col] === board[row + 3][col + 3]) {
        return board[row][col];
      }
    }
  }

  // Check diagonal (top-right to bottom-left)
  for (let row = 0; row < rows - 3; row++) {
    for (let col = 3; col < cols; col++) {
      if (board[row][col] && 
          board[row][col] === board[row + 1][col - 1] &&
          board[row][col] === board[row + 2][col - 2] &&
          board[row][col] === board[row + 3][col - 3]) {
        return board[row][col];
      }
    }
  }

  return null;
}

// Guess the Number AI
export function getNumberGuess(min: number, max: number, previousGuesses: number[]): number {
  // Binary search approach for optimal guessing
  let availableNumbers = [];
  for (let i = min; i <= max; i++) {
    if (!previousGuesses.includes(i)) {
      availableNumbers.push(i);
    }
  }
  
  if (availableNumbers.length === 0) {
    return Math.floor((min + max) / 2);
  }
  
  // Return middle number for binary search
  const middleIndex = Math.floor(availableNumbers.length / 2);
  return availableNumbers[middleIndex];
}