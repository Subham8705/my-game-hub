import React, { useState, useEffect } from 'react';
import { RPSChoice } from '../../types/games';
import { useGameState } from '../../hooks/useGameState';
import { getRPSAIChoice, getRPSWinner } from '../../utils/aiLogic';
import { ArrowLeft, RotateCcw, Users, Bot, EyeOff, Eye } from 'lucide-react';

interface RockPaperScissorsProps {
  onBack: () => void;
}

export function RockPaperScissors({ onBack }: RockPaperScissorsProps) {
  const { gameState, startGame, endGame, switchPlayer, resetGame } = useGameState();
  const [player1Choice, setPlayer1Choice] = useState<RPSChoice | null>(null);
  const [player2Choice, setPlayer2Choice] = useState<RPSChoice | null>(null);
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [showResult, setShowResult] = useState(false);
  const [player1ChoiceHidden, setPlayer1ChoiceHidden] = useState(false);
  const [waitingForHide, setWaitingForHide] = useState(false);

  const choices: { value: RPSChoice; emoji: string; name: string }[] = [
    { value: 'rock', emoji: '🪨', name: 'Rock' },
    { value: 'paper', emoji: '📄', name: 'Paper' },
    { value: 'scissors', emoji: '✂️', name: 'Scissors' }
  ];

  const handleChoice = (choice: RPSChoice) => {
    if (!gameState.isPlaying) return;

    if (gameState.gameMode === 'computer') {
      // Computer mode - player vs AI
      setPlayer1Choice(choice);
      const aiChoice = getRPSAIChoice();
      setPlayer2Choice(aiChoice);
      resolveRound(choice, aiChoice);
    } else {
      // Multiplayer mode - two players take turns
      if (gameState.currentPlayer === 'Player 1' && !player1Choice) {
        setPlayer1Choice(choice);
        setWaitingForHide(true);
      } else if (gameState.currentPlayer === 'Player 2' && !player2Choice && player1ChoiceHidden) {
        setPlayer2Choice(choice);
        resolveRound(player1Choice!, choice);
      }
    }
  };

  const handleHideChoice = () => {
    setPlayer1ChoiceHidden(true);
    setWaitingForHide(false);
    switchPlayer();
  };

  const handleContinueVisible = () => {
    setWaitingForHide(false);
    switchPlayer();
  };

  const resolveRound = (p1Choice: RPSChoice, p2Choice: RPSChoice) => {
    setShowResult(true);
    
    setTimeout(() => {
      const winner = getRPSWinner(p1Choice, p2Choice);
      const newScores = { ...scores };
      
      if (winner === 'Player 1') {
        newScores.player1++;
      } else if (winner === 'Player 2') {
        newScores.player2++;
      }
      
      setScores(newScores);
      setRound(prev => prev + 1);
      
      // Check if game should end (best of 5)
      if (newScores.player1 === 3 || newScores.player2 === 3) {
        endGame(newScores.player1 > newScores.player2 ? 'Player 1' : 
                gameState.gameMode === 'computer' ? 'Computer' : 'Player 2');
      } else {
        // Reset for next round
        setTimeout(() => {
          setPlayer1Choice(null);
          setPlayer2Choice(null);
          setShowResult(false);
          setPlayer1ChoiceHidden(false);
          setWaitingForHide(false);
          // Reset to Player 1's turn for multiplayer
          if (gameState.gameMode === 'multiplayer') {
            switchPlayer(); // This will set it back to Player 1
          }
        }, 2000);
      }
    }, 1000);
  };

  const handleNewGame = (mode: 'multiplayer' | 'computer') => {
    setPlayer1Choice(null);
    setPlayer2Choice(null);
    setRound(0);
    setScores({ player1: 0, player2: 0 });
    setShowResult(false);
    setPlayer1ChoiceHidden(false);
    setWaitingForHide(false);
    startGame(mode);
  };

  const handleReset = () => {
    setPlayer1Choice(null);
    setPlayer2Choice(null);
    setRound(0);
    setScores({ player1: 0, player2: 0 });
    setShowResult(false);
    setPlayer1ChoiceHidden(false);
    setWaitingForHide(false);
    resetGame();
  };

  const getChoiceEmoji = (choice: RPSChoice | null) => {
    if (!choice) return '❓';
    return choices.find(c => c.value === choice)?.emoji || '❓';
  };

  const getCurrentPlayerDisplay = () => {
    if (gameState.gameMode === 'computer') {
      return 'Your Turn';
    }
    if (waitingForHide) {
      return 'Player 1: Hide your choice?';
    }
    return gameState.currentPlayer + '\'s Turn';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Rock Paper Scissors</h1>
          <div className="w-32" />
        </div>

        {/* Game Mode Selection */}
        {!gameState.isPlaying && !gameState.winner && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">Choose Game Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleNewGame('multiplayer')}
                className="flex items-center justify-center gap-3 p-6 bg-orange-100 hover:bg-orange-200 rounded-xl transition-all transform hover:scale-105"
              >
                <Users size={24} className="text-orange-600" />
                <span className="font-semibold text-orange-800">Two Players</span>
              </button>
              <button
                onClick={() => handleNewGame('computer')}
                className="flex items-center justify-center gap-3 p-6 bg-red-100 hover:bg-red-200 rounded-xl transition-all transform hover:scale-105"
              >
                <Bot size={24} className="text-red-600" />
                <span className="font-semibold text-red-800">vs Computer</span>
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
                <p className="text-3xl font-bold">{scores.player1}</p>
              </div>
              <div className="text-center">
                <p className="text-lg text-gray-600">Round {round + 1} - Best of 5</p>
                <p className="text-sm text-gray-500">First to 3 wins!</p>
                <p className="text-sm font-semibold text-purple-600 mt-2">
                  {getCurrentPlayerDisplay()}
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-red-600">
                  {gameState.gameMode === 'computer' ? 'Computer' : 'Player 2'}
                </h3>
                <p className="text-3xl font-bold">{scores.player2}</p>
              </div>
            </div>
          </div>
        )}

        {/* Winner Display */}
        {gameState.winner && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              {gameState.winner} Wins the Match! 🎉
            </h2>
            <p className="text-gray-600">Final Score: {scores.player1} - {scores.player2}</p>
          </div>
        )}

        {/* Game Arena */}
        {gameState.isPlaying && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            {/* Choices Display */}
            <div className="flex justify-between items-center mb-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Player 1</h3>
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl">
                  {player1ChoiceHidden && !showResult ? '🤫' : getChoiceEmoji(player1Choice)}
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-6xl animate-bounce">⚔️</p>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">
                  {gameState.gameMode === 'computer' ? 'Computer' : 'Player 2'}
                </h3>
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-4xl">
                  {(gameState.gameMode === 'computer' || showResult) 
                    ? getChoiceEmoji(player2Choice) : '❓'}
                </div>
              </div>
            </div>

            {/* Round Result */}
            {showResult && player1Choice && player2Choice && (
              <div className="text-center mb-6">
                <p className="text-lg font-semibold">
                  {getRPSWinner(player1Choice, player2Choice) === 'Player 1' ? 'Player 1 Wins This Round!' :
                   getRPSWinner(player1Choice, player2Choice) === 'Player 2' ? 
                     (gameState.gameMode === 'computer' ? 'Computer Wins This Round!' : 'Player 2 Wins This Round!') :
                   'It\'s a Tie!'}
                </p>
              </div>
            )}

            {/* Hide/Continue Buttons */}
            {waitingForHide && gameState.gameMode === 'multiplayer' && (
              <div className="text-center mb-6">
                <p className="text-lg font-semibold mb-4">Player 1, do you want to hide your choice?</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleHideChoice}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all transform hover:scale-105"
                  >
                    <EyeOff size={20} />
                    Hide Choice
                  </button>
                  <button
                    onClick={handleContinueVisible}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all transform hover:scale-105"
                  >
                    <Eye size={20} />
                    Continue Visible
                  </button>
                </div>
              </div>
            )}

            {/* Choice Buttons */}
            {!showResult && !waitingForHide && (
              <div>
                {gameState.gameMode === 'computer' && !player1Choice && (
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                    {choices.map(choice => (
                      <button
                        key={choice.value}
                        onClick={() => handleChoice(choice.value)}
                        className="p-6 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all transform hover:scale-105 text-center"
                      >
                        <div className="text-4xl mb-2">{choice.emoji}</div>
                        <p className="font-semibold">{choice.name}</p>
                      </button>
                    ))}
                  </div>
                )}

                {gameState.gameMode === 'multiplayer' && (
                  <div>
                    {gameState.currentPlayer === 'Player 1' && !player1Choice && (
                      <div>
                        <p className="text-center text-lg font-semibold mb-4">Player 1, make your choice:</p>
                        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                          {choices.map(choice => (
                            <button
                              key={choice.value}
                              onClick={() => handleChoice(choice.value)}
                              className="p-6 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all transform hover:scale-105 text-center"
                            >
                              <div className="text-4xl mb-2">{choice.emoji}</div>
                              <p className="font-semibold">{choice.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {gameState.currentPlayer === 'Player 2' && player1Choice && !player2Choice && (
                      <div>
                        <p className="text-center text-lg font-semibold mb-4">Player 2, make your choice:</p>
                        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                          {choices.map(choice => (
                            <button
                              key={choice.value}
                              onClick={() => handleChoice(choice.value)}
                              className="p-6 bg-red-100 hover:bg-red-200 rounded-xl transition-all transform hover:scale-105 text-center"
                            >
                              <div className="text-4xl mb-2">{choice.emoji}</div>
                              <p className="font-semibold">{choice.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {player1Choice && !player2Choice && !player1ChoiceHidden && gameState.currentPlayer === 'Player 2' && (
                      <div className="text-center">
                        <p className="text-lg text-gray-600">Player 2, make your choice above!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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