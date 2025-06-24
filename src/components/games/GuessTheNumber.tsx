import React, { useState, useEffect } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { getNumberGuess } from '../../utils/aiLogic';
import { ArrowLeft, RotateCcw, Users, Bot, Target, Zap } from 'lucide-react';

interface GuessTheNumberProps {
  onBack: () => void;
}

export function GuessTheNumber({ onBack }: GuessTheNumberProps) {
  const { gameState, startGame, endGame, resetGame } = useGameState();
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [guess, setGuess] = useState<string>('');
  const [guesses, setGuesses] = useState<{number: number, hint: string, player: string}[]>([]);
  const [range, setRange] = useState({ min: 1, max: 100 });
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 10;

  const generateTargetNumber = () => {
    const num = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    setTargetNumber(num);
  };

  const initializeGame = () => {
    generateTargetNumber();
    setGuess('');
    setGuesses([]);
    setAttempts(0);
  };

  const getHint = (guessNum: number, target: number): string => {
    const diff = Math.abs(guessNum - target);
    if (guessNum === target) return 'Correct! 🎉';
    if (diff <= 5) return guessNum < target ? 'Very close! Go higher 📈' : 'Very close! Go lower 📉';
    if (diff <= 15) return guessNum < target ? 'Close! Go higher ⬆️' : 'Close! Go lower ⬇️';
    return guessNum < target ? 'Too low! 🔺' : 'Too high! 🔻';
  };

  const handleGuess = () => {
    const guessNum = parseInt(guess);
    if (isNaN(guessNum) || guessNum < range.min || guessNum > range.max) return;

    const hint = getHint(guessNum, targetNumber);
    const newGuess = { number: guessNum, hint, player: gameState.currentPlayer };
    setGuesses(prev => [...prev, newGuess]);
    setAttempts(prev => prev + 1);

    if (guessNum === targetNumber) {
      endGame(gameState.currentPlayer);
    } else if (attempts + 1 >= maxAttempts) {
      endGame(null); // No winner, ran out of attempts
    } else {
      setGuess('');
    }
  };

  useEffect(() => {
    if (gameState.isPlaying && 
        gameState.gameMode === 'computer' && 
        gameState.currentPlayer === 'Computer' && 
        !gameState.winner && 
        attempts < maxAttempts) {
      
      const timer = setTimeout(() => {
        const previousGuesses = guesses.map(g => g.number);
        const aiGuess = getNumberGuess(range.min, range.max, previousGuesses);
        
        const hint = getHint(aiGuess, targetNumber);
        const newGuess = { number: aiGuess, hint, player: 'Computer' };
        setGuesses(prev => [...prev, newGuess]);
        setAttempts(prev => prev + 1);

        if (aiGuess === targetNumber) {
          endGame('Computer');
        } else if (attempts + 1 >= maxAttempts) {
          endGame(null);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.isPlaying, attempts]);

  const handleNewGame = (mode: 'multiplayer' | 'computer') => {
    initializeGame();
    startGame(mode);
  };

  const handleReset = () => {
    initializeGame();
    resetGame();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGuess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Guess the Number</h1>
          <div className="w-32" />
        </div>

        {/* Game Mode Selection */}
        {!gameState.isPlaying && !gameState.winner && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">Choose Game Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleNewGame('multiplayer')}
                className="flex items-center justify-center gap-3 p-6 bg-purple-100 hover:bg-purple-200 rounded-xl transition-all transform hover:scale-105"
              >
                <Users size={24} className="text-purple-600" />
                <span className="font-semibold text-purple-800">Take Turns</span>
              </button>
              <button
                onClick={() => handleNewGame('computer')}
                className="flex items-center justify-center gap-3 p-6 bg-yellow-100 hover:bg-yellow-200 rounded-xl transition-all transform hover:scale-105"
              >
                <Zap size={24} className="text-yellow-600" />
                <span className="font-semibold text-pink-800">Solo Challange</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Info */}
        {gameState.isPlaying && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <Target className="mx-auto mb-2 text-purple-600" size={24} />
                <p className="text-sm text-gray-600">Range</p>
                <p className="font-bold">{range.min} - {range.max}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Attempts Left</p>
                <p className="font-bold text-2xl">{maxAttempts - attempts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Player</p>
                <p className="font-bold text-purple-600">{gameState.currentPlayer}</p>
              </div>
            </div>
          </div>
        )}

        {/* Winner Display */}
        {gameState.winner && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              {gameState.winner} Wins! 🎉
            </h2>
            <p className="text-gray-600">The number was: {targetNumber}</p>
          </div>
        )}

        {/* Game Over Display */}
        {!gameState.isPlaying && !gameState.winner && attempts > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-orange-600 mb-2">
              Game Over! 😅
            </h2>
            <p className="text-gray-600">The number was: {targetNumber}</p>
          </div>
        )}

        {/* Input Section */}
        {gameState.isPlaying && gameState.currentPlayer === 'Player 1' && !gameState.winner && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your guess ({range.min}-{range.max}):
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyPress={handleKeyPress}
                  min={range.min}
                  max={range.max}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={`${range.min}-${range.max}`}
                />
                <button
                  onClick={handleGuess}
                  disabled={!guess || parseInt(guess) < range.min || parseInt(guess) > range.max}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-all"
                >
                  Guess
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState.isPlaying && gameState.gameMode === 'computer' && gameState.currentPlayer === 'Computer' && !gameState.winner && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="text-center">
              <div className="animate-pulse">
                <Bot size={48} className="mx-auto mb-4 text-pink-600" />
                <p className="text-lg font-semibold">Computer is thinking...</p>
              </div>
            </div>
          </div>
        )}

        {/* Guess History */}
        {guesses.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h3 className="text-xl font-bold mb-4">Guess History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {guesses.map((g, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold">{g.player}</span>
                  <span className="text-lg font-bold">{g.number}</span>
                  <span className="text-sm">{g.hint}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Controls */}
        {(gameState.winner || (!gameState.isPlaying && attempts > 0)) && (
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