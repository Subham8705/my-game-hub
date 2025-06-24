import React from 'react';
import { GameInfo } from '../types/games';

interface GameCardProps {
  game: GameInfo;
  onSelect: (gameId: string) => void;
}

export function GameCard({ game, onSelect }: GameCardProps) {
  const difficultyColors = {
    Easy: 'text-green-600 bg-green-100',
    Medium: 'text-yellow-600 bg-yellow-100',
    Hard: 'text-red-600 bg-red-100'
  };

  const categoryColors = {
  Strategy: 'text-blue-600 bg-blue-100',
  Luck: 'text-purple-600 bg-purple-100',
  Logic: 'text-indigo-600 bg-indigo-100',
  Skill: 'text-orange-600 bg-orange-100'
};

  return (
    <div 
      onClick={() => onSelect(game.id)}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden border border-gray-100"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-4xl">{game.icon}</div>
          <div className="flex flex-col gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[game.difficulty]}`}>
              {game.difficulty}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[game.category]}`}>
              {game.category}
            </span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {game.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {game.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>👥 {game.minPlayers}-{game.maxPlayers} players</span>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
            →
          </div>
        </div>
      </div>
    </div>
  );
}