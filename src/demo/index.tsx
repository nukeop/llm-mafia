import React from 'react';
import { render } from 'ink';
import { ActionType } from '../game/GameLog';
import { initGameState } from '../game/GameState';
import { Game } from '../ui/Game';
import { range } from 'lodash';

(async () => {
  const gameState = initGameState(10);
  const players = gameState.machinePlayers;

  range(10).forEach(() => {
    players.forEach((player) => {
      gameState.log.addPlayerAction(player, 'test', ActionType.Speech);
    });
  });
  gameState.log.addPlayerAction(
    players[0],
    players[1].name,
    ActionType.Vote,
    '1',
  );

  render(<Game gameState={gameState} />);
})();
