import React, { useState } from 'react';
import { GameCard } from './components/GameCard';
import { TicTacToe } from './components/games/TicTacToe';
import { RockPaperScissors } from './components/games/RockPaperScissors';
import { ConnectFour } from './components/games/ConnectFour';
import { DotsAndBoxes } from './components/games/DotsAndBoxes';
import { GuessTheNumber } from './components/games/GuessTheNumber';
import { Minesweeper } from './components/games/Minesweeper';
import { Hangman } from './components/games/Hangman';
import { Game2048 } from './components/games/Game2048';
import { SpeedClicking } from './components/games/SpeedClicking';
import { ReactionTime } from './components/games/ReactionTime';
import { GameInfo } from './types/games';
import { Gamepad2, Trophy, Users } from 'lucide-react';
import { useVisitorCount } from "./hooks/useVisitorCount";

const games: GameInfo[] = [
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description: 'Classic 3x3 grid game where players take turns marking X\'s and O\'s to get three in a row.',
    icon: '⭕',
    minPlayers: 2,
    maxPlayers: 2,
    difficulty: 'Easy',
    category: 'Strategy'
  },
  {
    id: 'rock-paper-scissors',
    name: 'Rock Paper Scissors',
    description: 'The timeless hand game where rock crushes scissors, scissors cuts paper, and paper covers rock.',
    icon: '✂️',
    minPlayers: 2,
    maxPlayers: 2,
    difficulty: 'Easy',
    category: 'Luck'
  },
  {
    id: 'connect-four',
    name: 'Connect Four',
    description: 'Drop colored discs and be the first to connect four pieces vertically, horizontally, or diagonally.',
    icon: '🔴',
    minPlayers: 2,
    maxPlayers: 2,
    difficulty: 'Medium',
    category: 'Strategy'
  },
  {
    id: 'dots-and-boxes',
    name: 'Dots and Boxes',
    description: 'Draw lines between dots to form boxes. The player who completes the most boxes wins the game.',
    icon: '📦',
    minPlayers: 2,
    maxPlayers: 2,
    difficulty: 'Medium',
    category: 'Strategy'
  },
  {
    id: 'guess-the-number',
    name: 'Guess the Number',
    description: 'Try to guess the secret number with helpful hints. Use strategy and logic to win in fewer attempts.',
    icon: '🎯',
    minPlayers: 1,
    maxPlayers: 2,
    difficulty: 'Easy',
    category: 'Logic'
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    description: 'Navigate through a minefield using number clues. Flag the mines and reveal all safe squares to win.',
    icon: '💣',
    minPlayers: 1,
    maxPlayers: 1,
    difficulty: 'Hard',
    category: 'Logic'
  },
  {
    id: 'hangman',
    name: 'Hangman',
    description: 'Guess the hidden word letter by letter before the drawing is complete. Classic word guessing game.',
    icon: '🎪',
    minPlayers: 1,
    maxPlayers: 2,
    difficulty: 'Medium',
    category: 'Logic'
  },
  {
    id: '2048',
    name: '2048',
    description: 'Slide numbered tiles to combine them and reach the 2048 tile. Strategic puzzle game with endless possibilities.',
    icon: '🔢',
    minPlayers: 1,
    maxPlayers: 1,
    difficulty: 'Hard',
    category: 'Logic'
  },
  {
    id: 'speed-clicking',
    name: 'Speed Clicking',
    description: 'Test your clicking speed! See how many clicks you can make in a limited time. Challenge your reflexes.',
    icon: '⚡',
    minPlayers: 1,
    maxPlayers: 2,
    difficulty: 'Easy',
    category: 'Skill'
  },
  {
    id: 'reaction-time',
    name: 'Reaction Time Test',
    description: 'Measure your reaction time with precision. Click as soon as the color changes and see how fast you are.',
    icon: '⏱️',
    minPlayers: 1,
    maxPlayers: 2,
    difficulty: 'Easy',
    category: 'Skill'
  }
];

function App() {
  
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const visitors = useVisitorCount();

  const renderGame = () => {
    const onBack = () => setSelectedGame(null);
    
    switch (selectedGame) {
      case 'tic-tac-toe':
        return <TicTacToe onBack={onBack} />;
      case 'rock-paper-scissors':
        return <RockPaperScissors onBack={onBack} />;
      case 'connect-four':
        return <ConnectFour onBack={onBack} />;
      case 'dots-and-boxes':
        return <DotsAndBoxes onBack={onBack} />;
      case 'guess-the-number':
        return <GuessTheNumber onBack={onBack} />;
      case 'minesweeper':
        return <Minesweeper onBack={onBack} />;
      case 'hangman':
        return <Hangman onBack={onBack} />;
      case '2048':
        return <Game2048 onBack={onBack} />;
      case 'speed-clicking':
        return <SpeedClicking onBack={onBack} />;
      case 'reaction-time':
        return <ReactionTime onBack={onBack} />;
      default:
        return null;
    }
  };

  if (selectedGame) {
    return renderGame();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="p-4 bg-white bg-opacity-20 rounded-full">
                <Gamepad2 size={48} />
              </div>
              <img
                src="https://res.cloudinary.com/dpa0sb1tm/image/upload/c_crop,w_149,h_178/v1750759481/logobg_hu36yx.webp"
                alt="Logo"
                className="h-16 w-auto rounded-xl shadow-md"
              />
            </div>
            <h1 className="text-5xl font-bold mb-4">Subham Game Hub</h1>
            <p className="text-blue-100 text-sm">
              👀 Visitors: {visitors !== null ? visitors + 3 : 'loading...'}
            </p>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Challenge your friends or test your skills against intelligent computer 
              in our collection of classic games
            </p>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Multiplayer Fun</h3>
              <p className="text-gray-600">Play with friends locally or challenge yourself against smart computer</p>
            </div>
            {/* <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Track Progress</h3>
              <p className="text-gray-600">Monitor your wins, losses, and improvement across all games</p>
            </div> */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Classic Games</h3>
              <p className="text-gray-600">Enjoy timeless games with modern, beautiful interfaces</p>
            </div>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Game</h2>
            <p className="text-lg text-gray-600">Select from our collection of beloved classic games</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {games.map(game => (
              <GameCard 
                key={game.id} 
                game={game} 
                onSelect={setSelectedGame}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Gamepad2 size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Subham Game Hub</h3>
            {/* <p className="text-gray-400">
              Bringing classic games to life with modern design and intelligent AI
            </p> */}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;