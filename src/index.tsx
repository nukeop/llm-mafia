import dotenv from 'dotenv';
import React from 'react';
import { render } from 'ink';
import { PlayerText } from './ui/PlayerText';
import { initGameState } from './game/GameState';
import { Container } from './ui/Container';
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

  render(<Game gameState={gameState} />);
})();
