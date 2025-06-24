import React, { useState, useEffect } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { ArrowLeft, RotateCcw, Users, Zap, Clock } from 'lucide-react';

interface ReactionTimeProps {
  onBack: () => void;
}

export function ReactionTime({ onBack }: ReactionTimeProps) {
  const { gameState, startGame, endGame, resetGame } = useGameState();
  const [gamePhase, setGamePhase] = useState<'waiting' | 'ready' | 'go' | 'clicked' | 'results'>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [player1Times, setPlayer1Times] = useState<number[]>([]);
  const [player2Times, setPlayer2Times] = useState<number[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<'Player 1' | 'Player 2'>('Player 1');
  const [tooEarly, setTooEarly] = useState(false);
  const maxAttempts = 5;

  const getRandomDelay = () => Math.random() * 4000 + 1000; // 1-5 seconds

  const startTest = () => {
    setGamePhase('ready');
    setTooEarly(false);
    
    const delay = getRandomDelay();
    setTimeout(() => {
      if (gamePhase !== 'ready') { // Check if test wasn't cancelled
        setGamePhase('go');
        setStartTime(Date.now());
      }
    }, delay);
  };

  const handleClick = () => {
    if (gamePhase === 'ready') {
      setTooEarly(true);
      setGamePhase('waiting');
      return;
    }

    if (gamePhase === 'go') {
      const endTime = Date.now();
      const reaction = endTime - startTime;
      setReactionTime(reaction);
      setGamePhase('clicked');

      if (gameState.gameMode === 'multiplayer') {
        if (currentPlayer === 'Player 1') {
          setPlayer1Times(prev => [...prev, reaction]);
        } else {
          setPlayer2Times(prev => [...prev, reaction]);
        }
      } else {
        setAttempts(prev => [...prev, reaction]);
      }

      setTimeout(() => {
        const newAttempt = currentAttempt + 1;
        setCurrentAttempt(newAttempt);

        if (gameState.gameMode === 'multiplayer') {
          if (currentPlayer === 'Player 1' && player1Times.length + 1 < maxAttempts) {
            setGamePhase('waiting');
          } else if (currentPlayer === 'Player 1') {
            setCurrentPlayer('Player 2');
            setCurrentAttempt(0);
            setGamePhase('waiting');
          } else if (currentPlayer === 'Player 2' && player2Times.length + 1 < maxAttempts) {
            setGamePhase('waiting');
          } else {
            setGamePhase('results');
            const p1Avg = player1Times.reduce((a, b) => a + b, 0) / player1Times.length;
            const p2Avg = (player2Times.reduce((a, b) => a + b, 0) + reaction) / maxAttempts;
            endGame(p1Avg < p2Avg ? 'Player 1' : p2Avg < p1Avg ? 'Player 2' : null);
          }
        } else {
          if (newAttempt < maxAttempts) {
            setGamePhase('waiting');
          } else {
            setGamePhase('results');
            endGame('Player 1');
          }
        }
      }, 2000);
    }
  };

  const handleNewGame = (mode: 'multiplayer' | 'computer') => {
    setGamePhase('waiting');
    setStartTime(0);
    setReactionTime(0);
    setAttempts([]);
    setCurrentAttempt(0);
    setPlayer1Times([]);
    setPlayer2Times([]);
    setCurrentPlayer('Player 1');
    setTooEarly(false);
    startGame(mode);
  };

  const handleReset = () => {
    setGamePhase('waiting');
    setStartTime(0);
    setReactionTime(0);
    setAttempts([]);
    setCurrentAttempt(0);
    setPlayer1Times([]);
    setPlayer2Times([]);
    setCurrentPlayer('Player 1');
    setTooEarly(false);
    resetGame();
  };

  const getAverageTime = (times: number[]) => {
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  };

  const getBestTime = (times: number[]) => {
    if (times.length === 0) return 0;
    return Math.min(...times);
  };

  const getPhaseColor = () => {
    switch (gamePhase) {
      case 'ready':
        return 'bg-red-500';
      case 'go':
        return 'bg-green-500';
      case 'clicked':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getPhaseText = () => {
    switch (gamePhase) {
      case 'waiting':
        return 'Click to Start';
      case 'ready':
        return 'Wait for Green...';
      case 'go':
        return 'CLICK NOW!';
      case 'clicked':
        return `${reactionTime}ms`;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Reaction Time Test</h1>
          <div className="w-32" />
        </div>

        {/* Game Mode Selection */}
        {!gameState.isPlaying && !gameState.winner && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">Choose Game Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleNewGame('computer')}
                className="flex items-center justify-center gap-3 p-6 bg-green-100 hover:bg-green-200 rounded-xl transition-all transform hover:scale-105"
              >
                <Clock size={24} className="text-green-600" />
                <span className="font-semibold text-green-800">Solo Test</span>
              </button>
              <button
                onClick={() => handleNewGame('multiplayer')}
                className="flex items-center justify-center gap-3 p-6 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all transform hover:scale-105"
              >
                <Users size={24} className="text-blue-600" />
                <span className="font-semibold text-blue-800">Two Players</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Stats */}
        {gameState.isPlaying && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Attempt</p>
                <p className="font-bold text-xl">
                  {gameState.gameMode === 'multiplayer' 
                    ? `${currentPlayer === 'Player 1' ? player1Times.length + 1 : player2Times.length + 1}/${maxAttempts}`
                    : `${currentAttempt + 1}/${maxAttempts}`
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Time</p>
                <p className="font-bold text-xl">{reactionTime > 0 ? `${reactionTime}ms` : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average</p>
                <p className="font-bold text-xl">
                  {gameState.gameMode === 'multiplayer'
                    ? currentPlayer === 'Player 1' 
                      ? player1Times.length > 0 ? `${Math.round(getAverageTime(player1Times))}ms` : '-'
                      : player2Times.length > 0 ? `${Math.round(getAverageTime(player2Times))}ms` : '-'
                    : attempts.length > 0 ? `${Math.round(getAverageTime(attempts))}ms` : '-'
                  }
                </p>
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
            {gameState.gameMode === 'multiplayer' ? (
              <>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  {gameState.winner} Wins! 🎉
                </h2>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="font-bold text-blue-600">Player 1</h4>
                    <p>Avg: {Math.round(getAverageTime(player1Times))}ms</p>
                    <p>Best: {getBestTime(player1Times)}ms</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-red-600">Player 2</h4>
                    <p>Avg: {Math.round(getAverageTime(player2Times))}ms</p>
                    <p>Best: {getBestTime(player2Times)}ms</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-blue-600 mb-2">
                  Test Complete! ⚡
                </h2>
                <p className="text-gray-600">
                  Average Reaction Time: {Math.round(getAverageTime(attempts))}ms <br />
                  Best Reaction Time: {getBestTime(attempts)}ms
                </p>
              </>
            )}
          </div>
        )}


        {/* Game Over Display */}
        {gamePhase === 'results' && !gameState.winner && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-blue-600 mb-2">
              Test Complete! ⚡
            </h2>
            <p className="text-gray-600">
              Average: {Math.round(getAverageTime(attempts))}ms | Best: {getBestTime(attempts)}ms
            </p>
          </div>
        )}

        {/* Test Area */}
        {gameState.isPlaying && gamePhase !== 'results' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="text-center">
              {tooEarly && (
                <div className="mb-6 p-4 bg-red-100 rounded-lg">
                  <p className="text-red-600 font-bold">Too Early! Wait for green.</p>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">
                  {gameState.gameMode === 'multiplayer' ? `${currentPlayer}'s Turn` : 'Your Turn'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {gamePhase === 'waiting' && 'Click the circle when it turns green!'}
                  {gamePhase === 'ready' && 'Wait... it will turn green soon...'}
                  {gamePhase === 'go' && 'Click now!'}
                  {gamePhase === 'clicked' && `Great! Your reaction time: ${reactionTime}ms`}
                </p>
              </div>

              <div
                onClick={gamePhase === 'waiting' ? startTest : handleClick}
                className={`w-64 h-64 mx-auto rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95 select-none ${getPhaseColor()}`}
              >
                <span className="text-white text-2xl font-bold">
                  {getPhaseText()}
                </span>
              </div>

              {gamePhase === 'waiting' && (
                <p className="mt-4 text-sm text-gray-500">
                  Click the circle above to start the test
                </p>
              )}
            </div>
          </div>
        )}

        {/* Attempt History */}
        {(attempts.length > 0 || player1Times.length > 0 || player2Times.length > 0) && gamePhase !== 'results' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h3 className="text-lg font-bold mb-4">Attempt History</h3>
            {gameState.gameMode === 'multiplayer' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">Player 1</h4>
                  <div className="space-y-1">
                    {player1Times.map((time, index) => (
                      <div key={index} className="text-sm bg-blue-50 p-2 rounded">
                        Attempt {index + 1}: {time}ms
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">Player 2</h4>
                  <div className="space-y-1">
                    {player2Times.map((time, index) => (
                      <div key={index} className="text-sm bg-red-50 p-2 rounded">
                        Attempt {index + 1}: {time}ms
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {attempts.map((time, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>Attempt {index + 1}</span>
                    <span className="font-bold">{time}ms</span>
                  </div>
                ))}
              </div>
            )}
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
              New Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
}