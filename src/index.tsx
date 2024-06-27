import dotenv from 'dotenv';
import React from 'react';
import { render } from 'ink';
import { Game } from './ui/Game';
import { GameStateProvider } from './game/providers/GameStateProvider';

(async () => {
  dotenv.config();
  render(
    <GameStateProvider>
      <Game />
    </GameStateProvider>,
  );
})();
