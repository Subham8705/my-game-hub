import React, { useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { ArrowLeft, RotateCcw, Users } from 'lucide-react';

interface DotsAndBoxesProps {
  onBack: () => void;
}

interface Line {
  id: string;
  isDrawn: boolean;
  player: string | null;
}

interface Box {
  id: string;
  completedBy: string | null;
  lines: string[];
}

export function DotsAndBoxes({ onBack }: DotsAndBoxesProps) {
  const { gameState, startGame, endGame, switchPlayer, resetGame } = useGameState();
  const gridSize = 4; // 4x4 grid of boxes
  
  const [lines, setLines] = useState<Record<string, Line>>({});
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const [scores, setScores] = useState({ 'Player 1': 0, 'Player 2': 0 });

  const initializeGame = () => {
    const newLines: Record<string, Line> = {};
    const newBoxes: Record<string, Box> = {};

    // Create horizontal lines
    for (let row = 0; row <= gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const id = `h-${row}-${col}`;
        newLines[id] = { id, isDrawn: false, player: null };
      }
    }

    // Create vertical lines
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col <= gridSize; col++) {
        const id = `v-${row}-${col}`;
        newLines[id] = { id, isDrawn: false, player: null };
      }
    }

    // Create boxes
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const id = `box-${row}-${col}`;
        newBoxes[id] = {
          id,
          completedBy: null,
          lines: [
            `h-${row}-${col}`,      // top
            `h-${row + 1}-${col}`,  // bottom
            `v-${row}-${col}`,      // left
            `v-${row}-${col + 1}`   // right
          ]
        };
      }
    }

    setLines(newLines);
    setBoxes(newBoxes);
    setScores({ 'Player 1': 0, 'Player 2': 0 });
  };

  const handleLineClick = (lineId: string) => {
    if (!gameState.isPlaying || lines[lineId]?.isDrawn || gameState.winner) return;

    const newLines = { ...lines };
    newLines[lineId] = { ...newLines[lineId], isDrawn: true, player: gameState.currentPlayer };
    setLines(newLines);

    // Check for completed boxes
    const newBoxes = { ...boxes };
    let completedBoxes = 0;
    
    Object.values(newBoxes).forEach(box => {
      if (!box.completedBy) {
        const allLinesDrawn = box.lines.every(lineId => newLines[lineId]?.isDrawn);
        if (allLinesDrawn) {
          box.completedBy = gameState.currentPlayer;
          completedBoxes++;
        }
      }
    });

    setBoxes(newBoxes);

    // Update scores
    if (completedBoxes > 0) {
      setScores(prev => ({
        ...prev,
        [gameState.currentPlayer]: prev[gameState.currentPlayer] + completedBoxes
      }));
    }

    // Check if game is over
    const totalBoxes = gridSize * gridSize;
    const completedBoxCount = Object.values(newBoxes).filter(box => box.completedBy).length;
    
    if (completedBoxCount === totalBoxes) {
      const winner = scores['Player 1'] > scores['Player 2'] ? 'Player 1' : 
                    scores['Player 2'] > scores['Player 1'] ? 'Player 2' : null;
      endGame(winner);
    } else if (completedBoxes === 0) {
      // Only switch player if no boxes were completed
      switchPlayer();
    }
    // If boxes were completed, current player gets another turn
  };

  const handleNewGame = () => {
    initializeGame();
    startGame('multiplayer');
  };

  const handleReset = () => {
    initializeGame();
    resetGame();
  };

  const getPlayerColor = (player: string | null) => {
    if (player === 'Player 1') return 'bg-blue-500';
    if (player === 'Player 2') return 'bg-red-500';
    return 'bg-gray-300';
  };

  const getBoxColor = (player: string | null) => {
    if (player === 'Player 1') return 'bg-blue-100 border-blue-500';
    if (player === 'Player 2') return 'bg-red-100 border-red-500';
    return 'bg-transparent';
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
          <h1 className="text-3xl font-bold text-gray-900">Dots and Boxes</h1>
          <div className="w-32" />
        </div>

        {/* Game Mode Selection */}
        {!gameState.isPlaying && !gameState.winner && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">Start New Game</h2>
            <div className="flex justify-center">
              <button
                onClick={handleNewGame}
                className="flex items-center justify-center gap-3 p-6 bg-green-100 hover:bg-green-200 rounded-xl transition-all transform hover:scale-105"
              >
                <Users size={24} className="text-green-600" />
                <span className="font-semibold text-green-800">Two Players</span>
              </button>
            </div>
          </div>
        )}

        {/* Score Display */}
        {gameState.isPlaying && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <h3 className="text-xl font-bold text-blue-600">Player 1</h3>
                <p className="text-3xl font-bold">{scores['Player 1']}</p>
              </div>
              <div className="text-center">
                <p className="text-lg text-gray-600">Current Player</p>
                <p className="text-xl font-bold text-purple-600">{gameState.currentPlayer}</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-red-600">Player 2</h3>
                <p className="text-3xl font-bold">{scores['Player 2']}</p>
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
            <p className="text-gray-600">Final Score: Player 1: {scores['Player 1']}, Player 2: {scores['Player 2']}</p>
          </div>
        )}

        {/* Game Board */}
        {gameState.isPlaying && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="flex justify-center">
              <div className="relative" style={{ width: '400px', height: '400px' }}>
                {/* Dots */}
                {Array.from({ length: gridSize + 1 }).map((_, row) =>
                  Array.from({ length: gridSize + 1 }).map((_, col) => (
                    <div
                      key={`dot-${row}-${col}`}
                      className="absolute w-3 h-3 bg-gray-800 rounded-full"
                      style={{
                        left: `${(col * 80)}px`,
                        top: `${(row * 80)}px`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  ))
                )}

                {/* Horizontal Lines */}
                {Array.from({ length: gridSize + 1 }).map((_, row) =>
                  Array.from({ length: gridSize }).map((_, col) => {
                    const lineId = `h-${row}-${col}`;
                    const line = lines[lineId];
                    return (
                      <button
                        key={lineId}
                        onClick={() => handleLineClick(lineId)}
                        className={`absolute h-1 w-16 rounded transition-all hover:h-2 ${
                          line?.isDrawn ? getPlayerColor(line.player) : 'bg-gray-200 hover:bg-gray-400'
                        }`}
                        style={{
                          left: `${(col * 80) + 6}px`,
                          top: `${(row * 80) - 2}px`
                        }}
                        disabled={line?.isDrawn}
                      />
                    );
                  })
                )}

                {/* Vertical Lines */}
                {Array.from({ length: gridSize }).map((_, row) =>
                  Array.from({ length: gridSize + 1 }).map((_, col) => {
                    const lineId = `v-${row}-${col}`;
                    const line = lines[lineId];
                    return (
                      <button
                        key={lineId}
                        onClick={() => handleLineClick(lineId)}
                        className={`absolute w-1 h-16 rounded transition-all hover:w-2 ${
                          line?.isDrawn ? getPlayerColor(line.player) : 'bg-gray-200 hover:bg-gray-400'
                        }`}
                        style={{
                          left: `${(col * 80) - 2}px`,
                          top: `${(row * 80) + 6}px`
                        }}
                        disabled={line?.isDrawn}
                      />
                    );
                  })
                )}

                {/* Boxes */}
                {Array.from({ length: gridSize }).map((_, row) =>
                  Array.from({ length: gridSize }).map((_, col) => {
                    const boxId = `box-${row}-${col}`;
                    const box = boxes[boxId];
                    return (
                      <div
                        key={boxId}
                        className={`absolute w-16 h-16 border-2 rounded ${getBoxColor(box?.completedBy)} flex items-center justify-center`}
                        style={{
                          left: `${(col * 80) + 6}px`,
                          top: `${(row * 80) + 6}px`
                        }}
                      >
                        {box?.completedBy && (
                          <span className="text-2xl font-bold">
                            {box.completedBy === 'Player 1' ? '1' : '2'}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

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