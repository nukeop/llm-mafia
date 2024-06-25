import React from 'react';
import { render } from 'ink';
import { ActionType } from '../game/GameLog';
import { initGameState } from '../game/GameState';
import { Game } from '../ui/Game';
import { range } from 'lodash';

const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam porttitor lacus eu risus iaculis tincidunt. Nam feugiat, elit et semper laoreet, quam nulla volutpat dui, non mattis mi sem eget tortor. Sed scelerisque libero odio.';

(async () => {
  const gameState = initGameState(10);
  const players = gameState.machinePlayers;

  range(10).forEach(() => {
    players.forEach((player) => {
      gameState.log.addPlayerAction(player, lorem, ActionType.Speech);
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
