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
  render(<Game gameState={gameState} />);
})();
