import React, { useState, useEffect } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { ArrowLeft, RotateCcw, Users, Bot } from 'lucide-react';

interface HangmanProps {
  onBack: () => void;
}

const WORDS = [
  'JAVASCRIPT', 'PYTHON', 'COMPUTER', 'PROGRAMMING', 'DEVELOPER', 'WEBSITE', 'FUNCTION',
  'VARIABLE', 'ALGORITHM', 'DATABASE', 'FRAMEWORK', 'LIBRARY', 'COMPONENT', 'INTERFACE',
  'BACKEND', 'FRONTEND', 'DEBUGGING', 'TESTING', 'DEPLOYMENT', 'REPOSITORY'
];

const HANGMAN_PARTS = [
  '  +---+',
  '  |   |',
  '  |   O',
  '  |   |',
  '  |  /|\\',
  '  |  / \\',
  '  |',
  '__|__'
];

export function Hangman({ onBack }: HangmanProps) {
  const { gameState, startGame, endGame, resetGame } = useGameState();
  const [currentWord, setCurrentWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [inputLetter, setInputLetter] = useState('');
  const maxWrongGuesses = 6;

  const initializeGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(randomWord);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setInputLetter('');
  };

  const handleGuess = (letter: string) => {
    const upperLetter = letter.toUpperCase();
    
    if (guessedLetters.includes(upperLetter) || !upperLetter.match(/[A-Z]/)) {
      return;
    }

    const newGuessedLetters = [...guessedLetters, upperLetter];
    setGuessedLetters(newGuessedLetters);

    if (!currentWord.includes(upperLetter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      
      if (newWrongGuesses >= maxWrongGuesses) {
        endGame(null); // Game lost
      }
    } else {
      // Check if word is complete
      const isComplete = currentWord.split('').every(letter => 
        newGuessedLetters.includes(letter)
      );
      
      if (isComplete) {
        endGame('Player 1'); // Game won
      }
    }

    setInputLetter('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGuess(inputLetter);
    }
  };

  const handleNewGame = () => {
    initializeGame();
    startGame('multiplayer');
  };

  const handleReset = () => {
    initializeGame();
    resetGame();
  };

  const getDisplayWord = () => {
    return currentWord
      .split('')
      .map(letter => guessedLetters.includes(letter) ? letter : '_')
      .join(' ');
  };

  const getHangmanDrawing = () => {
    const lines = [];
    for (let i = 0; i < Math.min(wrongGuesses + 2, HANGMAN_PARTS.length); i++) {
      lines.push(HANGMAN_PARTS[i]);
    }
    return lines.join('\n');
  };

  const getAlphabetButtons = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return alphabet.map(letter => (
      <button
        key={letter}
        onClick={() => handleGuess(letter)}
        disabled={guessedLetters.includes(letter) || !gameState.isPlaying}
        className={`w-10 h-10 rounded-lg font-bold transition-all ${
          guessedLetters.includes(letter)
            ? currentWord.includes(letter)
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        } ${!gameState.isPlaying ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
      >
        {letter}
      </button>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Hangman</h1>
          <div className="w-32" />
        </div>

        {/* Game Start */}
        {!gameState.isPlaying && !gameState.winner && !currentWord && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">Start New Game</h2>
            <div className="flex justify-center">
              <button
                onClick={handleNewGame}
                className="flex items-center justify-center gap-3 p-6 bg-yellow-100 hover:bg-yellow-200 rounded-xl transition-all transform hover:scale-105"
              >
                <span className="text-2xl">🎪</span>
                <span className="font-semibold text-yellow-800">Start Hangman</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Status */}
        {gameState.isPlaying && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Wrong Guesses</p>
                <p className="font-bold text-2xl text-red-600">{wrongGuesses} / {maxWrongGuesses}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Letters Guessed</p>
                <p className="font-bold text-lg">{guessedLetters.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Word Length</p>
                <p className="font-bold text-lg">{currentWord.length} letters</p>
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
            <p className="text-gray-600">The word was: <span className="font-bold">{currentWord}</span></p>
          </div>
        )}

        {/* Game Over Display */}
        {!gameState.isPlaying && !gameState.winner && currentWord && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Game Over! 💀
            </h2>
            <p className="text-gray-600">The word was: <span className="font-bold">{currentWord}</span></p>
          </div>
        )}

        {/* Game Board */}
        {currentWord && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Hangman Drawing */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-center">Hangman</h3>
              <div className="bg-gray-100 rounded-lg p-6">
                <pre className="text-center font-mono text-lg leading-tight">
                  {getHangmanDrawing()}
                </pre>
              </div>
            </div>

            {/* Word Display */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-center">Word</h3>
              <div className="text-center">
                <p className="text-4xl font-mono font-bold tracking-wider mb-6">
                  {getDisplayWord()}
                </p>
                
                {/* Input for manual guess */}
                {gameState.isPlaying && (
                  <div className="mb-6">
                    <div className="flex justify-center gap-2">
                      <input
                        type="text"
                        value={inputLetter}
                        onChange={(e) => setInputLetter(e.target.value.toUpperCase())}
                        onKeyPress={handleKeyPress}
                        maxLength={1}
                        className="w-16 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                        placeholder="?"
                      />
                      <button
                        onClick={() => handleGuess(inputLetter)}
                        disabled={!inputLetter || guessedLetters.includes(inputLetter)}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg transition-all"
                      >
                        Guess
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alphabet Grid */}
        {gameState.isPlaying && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h3 className="text-xl font-bold mb-4 text-center">Alphabet</h3>
            <div className="grid grid-cols-6 md:grid-cols-9 lg:grid-cols-13 gap-2 max-w-4xl mx-auto">
              {getAlphabetButtons()}
            </div>
          </div>
        )}

        {/* Guessed Letters */}
        {guessedLetters.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h3 className="text-lg font-bold mb-3">Guessed Letters</h3>
            <div className="flex flex-wrap gap-2">
              {guessedLetters.map(letter => (
                <span
                  key={letter}
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    currentWord.includes(letter)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Game Controls */}
        {(gameState.winner || (!gameState.isPlaying && currentWord)) && (
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