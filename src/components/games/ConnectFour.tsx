import React, { useState, useEffect } from 'react';
import { ConnectFourBoard } from '../../types/games';
import { useGameState } from '../../hooks/useGameState';
import { getConnectFourAIMove, checkConnectFourWinner, isValidConnectFourMove, getLowestEmptyRow } from '../../utils/aiLogic';
import { ArrowLeft, RotateCcw, Users, Bot } from 'lucide-react';

interface ConnectFourProps {
  onBack: () => void;
}

export function ConnectFour({ onBack }: ConnectFourProps) {
  const { gameState, startGame, endGame, switchPlayer, resetGame } = useGameState();
  const [board, setBoard] = useState<ConnectFourBoard>(() => 
    Array(6).fill(null).map(() => Array(7).fill(null))
  );

  const initializeGame = () => {
    setBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
  };

  const handleColumnClick = (col: number) => {
    if (!gameState.isPlaying || !isValidConnectFourMove(board, col) || gameState.winner) return;

    const newBoard = board.map(row => [...row]);
    const row = getLowestEmptyRow(newBoard, col);
    
    if (row !== -1) {
      newBoard[row][col] = gameState.currentPlayer === 'Player 1' ? 'red' : 'yellow';
      setBoard(newBoard);

      const winner = checkConnectFourWinner(newBoard);
      if (winner) {
        endGame(winner === 'red' ? 'Player 1' : gameState.gameMode === 'computer' ? 'Computer' : 'Player 2');
        return;
      }

      // Check for draw
      const isFull = newBoard[0].every(cell => cell !== null);
      if (isFull) {
        endGame(null);
        return;
      }

      switchPlayer();
    }
  };

  // AI move effect
  useEffect(() => {
    if (gameState.isPlaying && 
        gameState.gameMode === 'computer' && 
        gameState.currentPlayer === 'Computer' && 
        !gameState.winner) {
      
      const timer = setTimeout(() => {
        const aiCol = getConnectFourAIMove(board);
        const newBoard = board.map(row => [...row]);
        const row = getLowestEmptyRow(newBoard, aiCol);
        
        if (row !== -1) {
          newBoard[row][aiCol] = 'yellow';
          setBoard(newBoard);

          const winner = checkConnectFourWinner(newBoard);
          if (winner) {
            endGame('Computer');
            return;
          }

          const isFull = newBoard[0].every(cell => cell !== null);
          if (isFull) {
            endGame(null);
            return;
          }

          switchPlayer();
        }
      }, 800);

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

  const getCellColor = (cell: string | null) => {
    if (cell === 'red') return 'bg-red-500';
    if (cell === 'yellow') return 'bg-yellow-500';
    return 'bg-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft size={20} />
            Back to Games
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Connect Four</h1>
          <div className="w-32" />
        </div>

        {/* Game Mode Selection */}
        {!gameState.isPlaying && !gameState.winner && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">Choose Game Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleNewGame('multiplayer')}
                className="flex items-center justify-center gap-3 p-6 bg-red-100 hover:bg-red-200 rounded-xl transition-all transform hover:scale-105"
              >
                <Users size={24} className="text-red-600" />
                <span className="font-semibold text-red-800">Two Players</span>
              </button>
              <button
                onClick={() => handleNewGame('computer')}
                className="flex items-center justify-center gap-3 p-6 bg-yellow-100 hover:bg-yellow-200 rounded-xl transition-all transform hover:scale-105"
              >
                <Bot size={24} className="text-yellow-600" />
                <span className="font-semibold text-yellow-800">vs Computer</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Status */}
        {gameState.isPlaying && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="flex justify-center items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full ${gameState.currentPlayer === 'Player 1' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <span className="font-bold text-lg">
                  {gameState.currentPlayer === 'Player 1' ? 'Red Player' : 
                   gameState.gameMode === 'computer' ? 'Computer (Yellow)' : 'Yellow Player'}
                </span>
              </div>
              {gameState.gameMode === 'computer' && gameState.currentPlayer === 'Computer' && (
                <span className="text-sm text-purple-600 animate-pulse">AI is thinking...</span>
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
        {!gameState.isPlaying && !gameState.winner && board[0].some(cell => cell !== null) && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-yellow-600 mb-2">
              It's a Draw! 🤝
            </h2>
          </div>
        )}

        {/* Game Board */}
        <div className="bg-blue-600 rounded-2xl p-4 shadow-lg mb-8 max-w-2xl mx-auto">
          <div className="grid grid-cols-7 gap-2">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleColumnClick(colIndex)}
                  className={`w-12 h-12 rounded-full border-2 border-blue-400 transition-all transform hover:scale-110 ${getCellColor(cell)} ${
                    gameState.isPlaying && isValidConnectFourMove(board, colIndex) && !gameState.winner
                      ? 'hover:shadow-lg cursor-pointer' 
                      : 'cursor-not-allowed'
                  }`}
                  disabled={!gameState.isPlaying || !isValidConnectFourMove(board, colIndex) || gameState.winner !== null}
                />
              ))
            )}
          </div>
          
          {/* Column indicators */}
          {gameState.isPlaying && (
            <div className="grid grid-cols-7 gap-2 mt-2">
              {Array(7).fill(null).map((_, colIndex) => (
                <div 
                  key={colIndex}
                  className={`h-2 rounded-full transition-all ${
                    isValidConnectFourMove(board, colIndex) && !gameState.winner
                      ? 'bg-white opacity-50 hover:opacity-100' 
                      : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          )}
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