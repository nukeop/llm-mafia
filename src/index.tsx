import dotenv from 'dotenv';
import React from 'react';
import { render } from 'ink';
import { Game } from './ui/Game';
import { GameStateProvider } from './game/providers/GameStateProvider';
import { GameLogProvider } from './game/providers/GameLogProvider';

(async () => {
  dotenv.config();
  render(
    <GameLogProvider>
      <GameStateProvider>
        <Game players={4} />
      </GameStateProvider>
    </GameLogProvider>,
  );
})();
