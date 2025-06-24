import React, { useState, useEffect } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { ArrowLeft, RotateCcw, Users, Zap, Timer } from 'lucide-react';

interface SpeedClickingProps {
  onBack: () => void;
}

export function SpeedClicking({ onBack }: SpeedClickingProps) {
  const { gameState, startGame, endGame, resetGame } = useGameState();
  const [timeLeft, setTimeLeft] = useState(10);
  const [clicks, setClicks] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<'Player 1' | 'Player 2'>('Player 1');
  const [gamePhase, setGamePhase] = useState<'waiting' | 'player1' | 'player2' | 'results'>('waiting');

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleTimeUp = () => {
    if (gameState.gameMode === 'multiplayer') {
      if (gamePhase === 'player1') {
        setPlayer1Score(clicks);
        setClicks(0);
        setTimeLeft(10);
        setGamePhase('player2');
        setCurrentPlayer('Player 2');
      } else if (gamePhase === 'player2') {
        setPlayer2Score(clicks);
        setGamePhase('results');
        const winner = player1Score > clicks ? 'Player 1' : clicks > player1Score ? 'Player 2' : null;
        endGame(winner);
      }
    } else {
      endGame('Player 1');
    }
  };

  const handleClick = () => {
    if (isActive) {
      setClicks(prev => prev + 1);
    }
  };

  const startRound = () => {
    setClicks(0);
    setTimeLeft(10);
    setIsActive(true);
    if (gameState.gameMode === 'multiplayer') {
      setGamePhase('player1');
      setCurrentPlayer('Player 1');
    }
  };

  const startPlayer2Turn = () => {
    setClicks(0);
    setTimeLeft(10);
    setIsActive(true);
    setGamePhase('player2');
  };

  const handleNewGame = (mode: 'multiplayer' | 'computer') => {
    setTimeLeft(10);
    setClicks(0);
    setIsActive(false);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setCurrentPlayer('Player 1');
    setGamePhase('waiting');
    startGame(mode);
  };

  const handleReset = () => {
    setTimeLeft(10);
    setClicks(0);
    setIsActive(false);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setCurrentPlayer('Player 1');
    setGamePhase('waiting');
    resetGame();
  };

  const getCPS = () => {
    const elapsed = 10 - timeLeft;
    return elapsed > 0 ? (clicks / elapsed).toFixed(1) : '0.0';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-red-50 p-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Speed Clicking Challenge</h1>
          <div className="w-32" />
        </div>

        {/* Game Mode Selection */}
        {!gameState.isPlaying && !gameState.winner && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">Choose Game Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleNewGame('computer')}
                className="flex items-center justify-center gap-3 p-6 bg-yellow-100 hover:bg-yellow-200 rounded-xl transition-all transform hover:scale-105"
              >
                <Zap size={24} className="text-yellow-600" />
                <span className="font-semibold text-yellow-800">Solo Challenge</span>
              </button>
              <button
                onClick={() => handleNewGame('multiplayer')}
                className="flex items-center justify-center gap-3 p-6 bg-red-100 hover:bg-red-200 rounded-xl transition-all transform hover:scale-105"
              >
                <Users size={24} className="text-red-600" />
                <span className="font-semibold text-red-800">Two Players</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Stats */}
        {gameState.isPlaying && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <Timer className="mx-auto mb-2 text-blue-600" size={24} />
                <p className="text-sm text-gray-600">Time Left</p>
                <p className="font-bold text-2xl text-blue-600">{timeLeft}s</p>
              </div>
              <div>
                <Zap className="mx-auto mb-2 text-green-600" size={24} />
                <p className="text-sm text-gray-600">Clicks</p>
                <p className="font-bold text-2xl text-green-600">{clicks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CPS</p>
                <p className="font-bold text-xl">{getCPS()}</p>
              </div>
              {gameState.gameMode === 'multiplayer' && (
                <div>
                  <p className="text-sm text-gray-600">Current Player</p>
                  <p className="font-bold text-lg text-purple-600">{currentPlayer}</p>
                </div>
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
            {gameState.gameMode === 'multiplayer' && (
              <p className="text-gray-600">
                Player 1: {player1Score} clicks | Player 2: {player2Score} clicks
              </p>
            )}
            {gameState.gameMode === 'computer' && (
              <p className="text-gray-600">
                Final Score: {clicks} clicks in 10 seconds ({getCPS()} CPS)
              </p>
            )}
          </div>
        )}

        {/* Game Over Display */}
        {!gameState.isPlaying && !gameState.winner && (gamePhase === 'results' || clicks > 0) && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-orange-600 mb-2">
              Challenge Complete! ⚡
            </h2>
            <p className="text-gray-600">
              Final Score: {clicks} clicks ({getCPS()} CPS)
            </p>
          </div>
        )}

        {/* Click Area */}
        {gameState.isPlaying && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            {gamePhase === 'waiting' && (
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-6">Ready to Start?</h3>
                <button
                  onClick={startRound}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105"
                >
                  Start Clicking!
                </button>
              </div>
            )}

            {gamePhase === 'player1' && gameState.gameMode === 'multiplayer' && (
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">Player 1's Turn</h3>
                <div
                  onClick={handleClick}
                  className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 rounded-full flex items-center justify-center cursor-pointer transition-all transform hover:scale-105 active:scale-95 select-none"
                >
                  <span className="text-white text-4xl font-bold">CLICK!</span>
                </div>
                <p className="mt-4 text-gray-600">Click as fast as you can!</p>
              </div>
            )}

            {gamePhase === 'player2' && gameState.gameMode === 'multiplayer' && !isActive && (
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">Player 1 scored: {player1Score} clicks</h3>
                <h3 className="text-xl font-bold mb-6">Player 2's Turn</h3>
                <button
                  onClick={startPlayer2Turn}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105"
                >
                  Start Player 2!
                </button>
              </div>
            )}

            {gamePhase === 'player2' && gameState.gameMode === 'multiplayer' && isActive && (
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">Player 2's Turn</h3>
                <div
                  onClick={handleClick}
                  className="w-64 h-64 mx-auto bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 rounded-full flex items-center justify-center cursor-pointer transition-all transform hover:scale-105 active:scale-95 select-none"
                >
                  <span className="text-white text-4xl font-bold">CLICK!</span>
                </div>
                <p className="mt-4 text-gray-600">Click as fast as you can!</p>
              </div>
            )}

            {gameState.gameMode === 'computer' && isActive && (
              <div className="text-center">
                <div
                  onClick={handleClick}
                  className="w-64 h-64 mx-auto bg-gradient-to-br from-yellow-400 to-orange-600 hover:from-yellow-500 hover:to-orange-700 rounded-full flex items-center justify-center cursor-pointer transition-all transform hover:scale-105 active:scale-95 select-none"
                >
                  <span className="text-white text-4xl font-bold">CLICK!</span>
                </div>
                <p className="mt-4 text-gray-600">Click as fast as you can!</p>
              </div>
            )}
          </div>
        )}

        {/* Results for Multiplayer */}
        {gamePhase === 'results' && gameState.gameMode === 'multiplayer' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h3 className="text-2xl font-bold text-center mb-6">Final Results</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <h4 className="text-xl font-bold text-blue-600">Player 1</h4>
                <p className="text-3xl font-bold">{player1Score}</p>
                <p className="text-sm text-gray-600">{(player1Score / 10).toFixed(1)} CPS</p>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold text-red-600">Player 2</h4>
                <p className="text-3xl font-bold">{player2Score}</p>
                <p className="text-sm text-gray-600">{(player2Score / 10).toFixed(1)} CPS</p>
              </div>
            </div>
          </div>
        )}

        {/* Game Controls */}
        {(gameState.winner || gamePhase === 'results') && (
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