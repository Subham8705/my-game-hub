import { useState, useCallback } from 'react';
import { GameState, GameMode, PlayerStats } from '../types/games';

export function useGameState(initialPlayer: string = 'Player 1') {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    currentPlayer: initialPlayer,
    winner: null,
    gameMode: 'multiplayer'
  });

  const [stats, setStats] = useState<Record<string, PlayerStats>>({
    'Player 1': { wins: 0, losses: 0, draws: 0 },
    'Player 2': { wins: 0, losses: 0, draws: 0 },
    'Computer': { wins: 0, losses: 0, draws: 0 }
  });

  const startGame = useCallback((mode: GameMode) => {
    setGameState({
      isPlaying: true,
      currentPlayer: 'Player 1',
      winner: null,
      gameMode: mode
    });
  }, []);

  const endGame = useCallback((winner: string | null) => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      winner
    }));

    // Update stats in a single functional update
    setStats(currentStats => {
      const updatedStats = { ...currentStats };

      if (winner) {
        // Update winner's wins
        updatedStats[winner] = {
          ...updatedStats[winner],
          wins: updatedStats[winner].wins + 1
        };

        // Update losses for other players
        Object.keys(updatedStats).forEach(player => {
          if (player !== winner) {
            updatedStats[player] = {
              ...updatedStats[player],
              losses: updatedStats[player].losses + 1
            };
          }
        });
      } else {
        // Draw - update all players
        Object.keys(updatedStats).forEach(player => {
          updatedStats[player] = {
            ...updatedStats[player],
            draws: updatedStats[player].draws + 1
          };
        });
      }

      return updatedStats;
    });
  }, []);

  const switchPlayer = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentPlayer: prev.gameMode === 'multiplayer' 
        ? (prev.currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1')
        : (prev.currentPlayer === 'Player 1' ? 'Computer' : 'Player 1')
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      currentPlayer: 'Player 1',
      winner: null
    }));
  }, []);

  return {
    gameState,
    stats,
    startGame,
    endGame,
    switchPlayer,
    resetGame,
    setGameState
  };
}