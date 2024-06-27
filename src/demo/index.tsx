import React from 'react';
import { render, useInput } from 'ink';
import { ActionType } from '../game/GameLog';
import { Game } from '../ui/Game';
import { sample } from 'lodash';
import {
  GameStateProvider,
  useGameState,
} from '../game/providers/GameStateProvider';

const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam porttitor lacus eu risus iaculis tincidunt. Nam feugiat, elit et semper laoreet, quam nulla volutpat dui, non mattis mi sem eget tortor. Sed scelerisque libero odio.';

const Demo: React.FC = ({}) => {
  const gameState = useGameState();
  useInput((input, key) => {
    if (key.downArrow) {
      console.log(gameState.log.messages);
      gameState.log.addPlayerAction(
        sample(gameState.machinePlayers)!,
        lorem,
        ActionType.Speech,
      );
      gameState.log.addPlayerAction(
        sample(gameState.machinePlayers)!,
        lorem,
        ActionType.Vote,
      );
    }
  });

  return <Game players={10} />;
};

(async () => {
  render(
    <GameStateProvider>
      <Demo />
    </GameStateProvider>,
  );
})();
