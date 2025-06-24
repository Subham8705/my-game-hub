import React, { useState, useEffect } from 'react';
import { TicTacToeBoard, TicTacToeCell } from '../../types/games';
import { useGameState } from '../../hooks/useGameState';
import { getTicTacToeAIMove, checkTicTacToeWinner } from '../../utils/aiLogic';
import { ArrowLeft, RotateCcw, Users, Bot } from 'lucide-react';

interface TicTacToeProps {
  onBack: () => void;
}

export function TicTacToe({ onBack }: TicTacToeProps) {
  const { gameState, startGame, endGame, switchPlayer, resetGame } = useGameState();
  const [board, setBoard] = useState<TicTacToeBoard>(() => 
    Array(3).fill(null).map(() => Array(3).fill(null))
  );

  const initializeGame = () => {
    setBoard(Array(3).fill(null).map(() => Array(3).fill(null)));
  };

  const handleCellClick = (row: number, col: number) => {
    if (!gameState.isPlaying || board[row][col] || gameState.winner) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = gameState.currentPlayer === 'Player 1' ? 'X' : 'O';
    setBoard(newBoard);

    const winner = checkTicTacToeWinner(newBoard);
    if (winner) {
      endGame(winner === 'X' ? 'Player 1' : gameState.gameMode === 'computer' ? 'Computer' : 'Player 2');
      return;
    }

    // Check for draw
    const isFull = newBoard.every(row => row.every(cell => cell !== null));
    if (isFull) {
      endGame(null);
      return;
    }

    switchPlayer();
  };

  // AI move effect
  useEffect(() => {
    if (gameState.isPlaying && 
        gameState.gameMode === 'computer' && 
        gameState.currentPlayer === 'Computer' && 
        !gameState.winner) {
      
      const timer = setTimeout(() => {
        const aiMove = getTicTacToeAIMove(board);
        if (aiMove) {
          const [row, col] = aiMove;
          const newBoard = board.map(r => [...r]);
          newBoard[row][col] = 'O';
          setBoard(newBoard);

          const winner = checkTicTacToeWinner(newBoard);
          if (winner) {
            endGame('Computer');
            return;
          }

          const isFull = newBoard.every(row => row.every(cell => cell !== null));
          if (isFull) {
            endGame(null);
            return;
          }

          switchPlayer();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.isPlaying, board]);

  const handleNewGame = (mode: 'multiplayer' | 'computer') => {
    initializeGame();
    startGame(mode);
  };

  const handleReset = () => {
    initializeGame();
    resetGame();
  };

  const getCellSymbol = (cell: TicTacToeCell) => {
    if (cell === 'X') return '❌';
    if (cell === 'O') return '⭕';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Tic Tac Toe</h1>
          <div className="w-32" />
        </div>

        {/* Game Mode Selection */}
        {!gameState.isPlaying && !gameState.winner && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">Choose Game Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleNewGame('multiplayer')}
                className="flex items-center justify-center gap-3 p-6 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all transform hover:scale-105"
              >
                <Users size={24} className="text-blue-600" />
                <span className="font-semibold text-blue-800">Two Players</span>
              </button>
              <button
                onClick={() => handleNewGame('computer')}
                className="flex items-center justify-center gap-3 p-6 bg-purple-100 hover:bg-purple-200 rounded-xl transition-all transform hover:scale-105"
              >
                <Bot size={24} className="text-purple-600" />
                <span className="font-semibold text-purple-800">vs Computer</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Status */}
        {gameState.isPlaying && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="text-center">
              <p className="text-lg text-gray-600">
                Current Player: <span className="font-bold text-blue-600">{gameState.currentPlayer}</span>
              </p>
              {gameState.gameMode === 'computer' && gameState.currentPlayer === 'Computer' && (
                <p className="text-sm text-purple-600 animate-pulse">AI is thinking...</p>
              )}
            </div>
          </div>
        )}

        {/* Winner Display */}
        {gameState.winner && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              {gameState.winner} Wins! 🎉
            </h2>
          </div>
        )}

        {/* Draw Display */}
        {!gameState.isPlaying && !gameState.winner && board.some(row => row.some(cell => cell !== null)) && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-yellow-600 mb-2">
              It's a Draw! 🤝
            </h2>
          </div>
        )}

        {/* Game Board */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className="w-20 h-20 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-2xl font-bold transition-all transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  disabled={!gameState.isPlaying || cell !== null || gameState.winner !== null}
                >
                  {getCellSymbol(cell)}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Game Controls */}
        {(gameState.winner || !gameState.isPlaying) && (
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