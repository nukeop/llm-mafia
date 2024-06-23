import dotenv from 'dotenv';
import React from 'react';
import { render } from 'ink';
import { initGameState } from './game/GameState';
import { Game } from './ui/Game';

(async () => {
  dotenv.config();
  const gameState = initGameState(3);
  gameState.log.addSystemMessage(
    'Welcome to the LLM Mafia! You are the human player. The goal is to blend in while the machines try to eliminate you. Good luck!',
  );
  gameState.log.addSystemMessage(
    `The machine players are:\n ${gameState.machinePlayers.map((player) => player.name).join('\n ')}.`,
  );
  gameState.log.addSystemMessage(`You are ${gameState.humanPlayer.name}.`);

  render(<Game gameState={gameState} />);
})();
