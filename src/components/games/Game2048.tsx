import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { ArrowLeft, RotateCcw, ArrowUp, ArrowDown, ArrowLeftIcon, ArrowRight } from 'lucide-react';

interface Game2048Props {
  onBack: () => void;
}

type Board = number[][];

export function Game2048({ onBack }: Game2048Props) {
  const { gameState, startGame, endGame, resetGame } = useGameState();
  const [board, setBoard] = useState<Board>(() => 
    Array(4).fill(null).map(() => Array(4).fill(0))
  );
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('2048-best-score');
    return saved ? parseInt(saved) : 0;
  });

  const initializeGame = () => {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
  };

  const addRandomTile = (board: Board) => {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const moveLeft = (board: Board): { newBoard: Board; moved: boolean; scoreGained: number } => {
    const newBoard = board.map(row => [...row]);
    let moved = false;
    let scoreGained = 0;

    for (let i = 0; i < 4; i++) {
      const row = newBoard[i].filter(cell => cell !== 0);
      
      // Merge tiles
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          scoreGained += row[j];
          row[j + 1] = 0;
        }
      }
      
      // Remove zeros and pad with zeros
      const filteredRow = row.filter(cell => cell !== 0);
      while (filteredRow.length < 4) {
        filteredRow.push(0);
      }
      
      // Check if row changed
      for (let j = 0; j < 4; j++) {
        if (newBoard[i][j] !== filteredRow[j]) {
          moved = true;
        }
        newBoard[i][j] = filteredRow[j];
      }
    }

    return { newBoard, moved, scoreGained };
  };

  const rotateBoard = (board: Board): Board => {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        newBoard[j][3 - i] = board[i][j];
      }
    }
    return newBoard;
  };

  const move = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!gameState.isPlaying) return;

    let currentBoard = board.map(row => [...row]);
    let rotations = 0;

    // Rotate board to make all moves equivalent to left move
    switch (direction) {
      case 'right':
        rotations = 2;
        break;
      case 'up':
        rotations = 3;
        break;
      case 'down':
        rotations = 1;
        break;
    }

    for (let i = 0; i < rotations; i++) {
      currentBoard = rotateBoard(currentBoard);
    }

    const { newBoard, moved, scoreGained } = moveLeft(currentBoard);

    // Rotate back
    let finalBoard = newBoard;
    for (let i = 0; i < (4 - rotations) % 4; i++) {
      finalBoard = rotateBoard(finalBoard);
    }

    if (moved) {
      addRandomTile(finalBoard);
      setBoard(finalBoard);
      const newScore = score + scoreGained;
      setScore(newScore);
      
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('2048-best-score', newScore.toString());
      }

      // Check for win (2048 tile)
      const hasWon = finalBoard.some(row => row.some(cell => cell === 2048));
      if (hasWon) {
        endGame('Player 1');
        return;
      }

      // Check for game over
      if (isGameOver(finalBoard)) {
        endGame(null);
      }
    }
  };

  const isGameOver = (board: Board): boolean => {
    // Check for empty cells
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return false;
      }
    }

    // Check for possible merges
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = board[i][j];
        if (
          (i < 3 && board[i + 1][j] === current) ||
          (j < 3 && board[i][j + 1] === current)
        ) {
          return false;
        }
      }
    }

    return true;
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        move('left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        move('right');
        break;
      case 'ArrowUp':
        e.preventDefault();
        move('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        move('down');
        break;
    }
  }, [gameState.isPlaying, board, score]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleNewGame = () => {
    initializeGame();
    startGame('multiplayer');
  };

  const handleReset = () => {
    initializeGame();
    resetGame();
  };

  const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
      0: 'bg-gray-200',
      2: 'bg-yellow-100 text-gray-800',
      4: 'bg-yellow-200 text-gray-800',
      8: 'bg-orange-300 text-white',
      16: 'bg-orange-400 text-white',
      32: 'bg-red-400 text-white',
      64: 'bg-red-500 text-white',
      128: 'bg-yellow-400 text-white',
      256: 'bg-yellow-500 text-white',
      512: 'bg-yellow-600 text-white',
      1024: 'bg-purple-500 text-white',
      2048: 'bg-purple-600 text-white'
    };
    return colors[value] || 'bg-purple-700 text-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
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
          <h1 className="text-3xl font-bold text-gray-900">2048</h1>
          <div className="w-32" />
        </div>

        {/* Game Start */}
        {!gameState.isPlaying && !gameState.winner && board.every(row => row.every(cell => cell === 0)) && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">Start New Game</h2>
            <div className="flex justify-center">
              <button
                onClick={handleNewGame}
                className="flex items-center justify-center gap-3 p-6 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all transform hover:scale-105"
              >
                <span className="text-2xl">🔢</span>
                <span className="font-semibold text-blue-800">Start 2048</span>
              </button>
            </div>
          </div>
        )}

        {/* Score Display */}
        {gameState.isPlaying && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="font-bold text-3xl text-blue-600">{score}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Best</p>
                <p className="font-bold text-3xl text-purple-600">{bestScore}</p>
              </div>
            </div>
          </div>
        )}

        {/* Winner Display */}
        {gameState.winner && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              You Reached 2048! 🎉
            </h2>
            <p className="text-gray-600">Final Score: {score}</p>
          </div>
        )}

        {/* Game Over Display */}
        {!gameState.isPlaying && !gameState.winner && board.some(row => row.some(cell => cell > 0)) && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Game Over! 😔
            </h2>
            <p className="text-gray-600">Final Score: {score}</p>
          </div>
        )}

        {/* Game Board */}
        {board.some(row => row.some(cell => cell > 0)) && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-lg transition-all duration-200 ${getTileColor(cell)}`}
                  >
                    {cell > 0 ? cell : ''}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        {gameState.isPlaying && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h3 className="text-lg font-bold mb-4 text-center">Controls</h3>
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              <div></div>
              <button
                onClick={() => move('up')}
                className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-all"
              >
                <ArrowUp size={20} />
              </button>
              <div></div>
              <button
                onClick={() => move('left')}
                className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-all"
              >
                <ArrowLeftIcon size={20} />
              </button>
              <button
                onClick={() => move('down')}
                className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-all"
              >
                <ArrowDown size={20} />
              </button>
              <button
                onClick={() => move('right')}
                className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-all"
              >
                <ArrowRight size={20} />
              </button>
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              Use arrow keys or buttons to move tiles
            </p>
          </div>
        )}

        {/* Game Controls */}
        {(gameState.winner || (!gameState.isPlaying && board.some(row => row.some(cell => cell > 0)))) && (
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