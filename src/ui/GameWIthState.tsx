import React, { useEffect } from 'react';
import { useGameState } from '../game/hooks/useGameState';
import { Game } from './Game';

export const GameWithState: React.FC = () => {
  const gameState = useGameState(3);

  useEffect(() => {
    gameState.log.addSystemMessage(
      'Welcome to the LLM Mafia! You are the human player. The goal is to blend in while the machines try to eliminate you. Good luck!',
    );
    gameState.log.addSystemMessage(
      `The machine players are:\n ${gameState.machinePlayers.map((player) => player.name).join('\n ')}.`,
    );
    gameState.log.addSystemMessage(`You are ${gameState.humanPlayer.name}.`);
  }, []);

  return <Game gameState={gameState} />;
};
