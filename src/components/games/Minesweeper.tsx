import React, { useState, useEffect } from 'react';
import { MinesweeperBoard, MinesweeperCell } from '../../types/games';
import { useGameState } from '../../hooks/useGameState';
import { ArrowLeft, RotateCcw, Flag, Bomb } from 'lucide-react';

interface MinesweeperProps {
  onBack: () => void;
}

export function Minesweeper({ onBack }: MinesweeperProps) {
  const { gameState, startGame, endGame, resetGame } = useGameState();
  const [board, setBoard] = useState<MinesweeperBoard>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [mineCount, setMineCount] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const boardSize = 9;
  const totalMines = 10;

  const initializeBoard = (): MinesweeperBoard => {
    return Array(boardSize).fill(null).map(() =>
      Array(boardSize).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborCount: 0
      }))
    );
  };

  const placeMines = (board: MinesweeperBoard, firstClickRow: number, firstClickCol: number): MinesweeperBoard => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    let minesPlaced = 0;

    while (minesPlaced < totalMines) {
      const row = Math.floor(Math.random() * boardSize);
      const col = Math.floor(Math.random() * boardSize);
      
      // Don't place mine on first click or if already has mine
      if (!newBoard[row][col].isMine && !(row === firstClickRow && col === firstClickCol)) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor counts
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
              if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && newBoard[r][c].isMine) {
                count++;
              }
            }
          }
          newBoard[row][col].neighborCount = count;
        }
      }
    }

    return newBoard;
  };

  const revealCell = (board: MinesweeperBoard, row: number, col: number): MinesweeperBoard => {
    const newBoard = board.map(r => r.map(cell => ({ ...cell })));
    
    if (newBoard[row][col].isRevealed || newBoard[row][col].isFlagged) {
      return newBoard;
    }

    newBoard[row][col].isRevealed = true;

    // If it's an empty cell (no neighboring mines), reveal all neighbors
    if (newBoard[row][col].neighborCount === 0 && !newBoard[row][col].isMine) {
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && !newBoard[r][c].isRevealed) {
            return revealCell(newBoard, r, c);
          }
        }
      }
    }

    return newBoard;
  };

  const handleCellClick = (row: number, col: number) => {
    if (!gameState.isPlaying || board[row][col].isRevealed || board[row][col].isFlagged) return;

    if (!gameStarted) {
      const newBoard = placeMines(initializeBoard(), row, col);
      setBoard(newBoard);
      setGameStarted(true);
      const revealedBoard = revealCell(newBoard, row, col);
      setBoard(revealedBoard);
    } else {
      const newBoard = revealCell(board, row, col);
      setBoard(newBoard);

      // Check if clicked on mine
      if (board[row][col].isMine) {
        // Reveal all mines
        const gameOverBoard = newBoard.map(r => r.map(cell => 
          cell.isMine ? { ...cell, isRevealed: true } : cell
        ));
        setBoard(gameOverBoard);
        endGame(null); // Game lost
        return;
      }

      // Check for win condition
      const unrevealedCells = newBoard.flat().filter(cell => !cell.isRevealed).length;
      if (unrevealedCells === totalMines) {
        endGame('Player 1'); // Game won
      }
    }
  };

  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (!gameState.isPlaying || board[row][col].isRevealed) return;

    const newBoard = board.map(r => r.map(cell => ({ ...cell })));
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
    setFlagCount(prev => newBoard[row][col].isFlagged ? prev + 1 : prev - 1);
  };

  const handleNewGame = () => {
    const newBoard = initializeBoard();
    setBoard(newBoard);
    setGameStarted(false);
    setMineCount(totalMines);
    setFlagCount(0);
    setTimeElapsed(0);
    startGame('multiplayer');
  };

  const handleReset = () => {
    const newBoard = initializeBoard();
    setBoard(newBoard);
    setGameStarted(false);
    setMineCount(totalMines);
    setFlagCount(0);
    setTimeElapsed(0);
    resetGame();
  };

  // Timer effect
  useEffect(() => {
    let interval: number;
    if (gameState.isPlaying && gameStarted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameStarted]);

  const getCellContent = (cell: MinesweeperCell) => {
    if (cell.isFlagged) return <Flag size={16} className="text-red-500" />;
    if (!cell.isRevealed) return '';
    if (cell.isMine) return <Bomb size={16} className="text-red-600" />;
    if (cell.neighborCount === 0) return '';
    return cell.neighborCount.toString();
  };

  const getCellColor = (cell: MinesweeperCell) => {
    if (cell.isFlagged) return 'bg-yellow-200';
    if (!cell.isRevealed) return 'bg-gray-300 hover:bg-gray-400';
    if (cell.isMine) return 'bg-red-500';
    if (cell.neighborCount === 0) return 'bg-gray-100';
    
    const colors = [
      '', 'text-blue-600', 'text-green-600', 'text-red-600', 
      'text-purple-600', 'text-yellow-600', 'text-pink-600', 
      'text-black', 'text-gray-600'
    ];
    return `bg-gray-100 ${colors[cell.neighborCount]}`;
  };

  // Initialize board on component mount
  useEffect(() => {
    setBoard(initializeBoard());
    setMineCount(totalMines);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft size={20} />
            Back to Games
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Minesweeper</h1>
          <div className="w-32" />
        </div>

        {/* Game Start */}
        {!gameState.isPlaying && !gameState.winner && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">Start New Game</h2>
            <div className="flex justify-center">
              <button
                onClick={handleNewGame}
                className="flex items-center justify-center gap-3 p-6 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all transform hover:scale-105"
              >
                <Bomb size={24} className="text-slate-600" />
                <span className="font-semibold text-slate-800">Start Minesweeper</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Stats */}
        {gameState.isPlaying && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Bomb className="mx-auto mb-2 text-red-600" size={24} />
                <p className="text-sm text-gray-600">Mines Left</p>
                <p className="font-bold text-xl">{totalMines - flagCount}</p>
              </div>
              <div>
                <Flag className="mx-auto mb-2 text-yellow-600" size={24} />
                <p className="text-sm text-gray-600">Flags Used</p>
                <p className="font-bold text-xl">{flagCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-bold text-xl">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Winner Display */}
        {gameState.winner && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Congratulations! You Won! 🎉
            </h2>
            <p className="text-gray-600">Time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</p>
          </div>
        )}

        {/* Game Over Display */}
        {!gameState.isPlaying && !gameState.winner && gameStarted && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Game Over! 💥
            </h2>
            <p className="text-gray-600">Better luck next time!</p>
          </div>
        )}

        {/* Game Board */}
        {board.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="grid grid-cols-9 gap-1 max-w-md mx-auto">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
                    className={`w-8 h-8 border border-gray-400 text-xs font-bold flex items-center justify-center transition-all ${getCellColor(cell)} ${
                      !cell.isRevealed ? 'hover:scale-105' : ''
                    }`}
                    disabled={!gameState.isPlaying}
                  >
                    {getCellContent(cell)}
                  </button>
                ))
              )}
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              Left click to reveal • Right click to flag
            </p>
          </div>
        )}

        {/* Game Controls */}
        {(gameState.winner || (!gameState.isPlaying && gameStarted)) && (
          <div className="flex justify-center gap-4">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all transform hover:scale-105"
            >
              <RotateCcw size={20} />
              New Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}