import React from 'react';
import { render, useInput } from 'ink';
import { ActionType } from '../game/GameLog';
import { initGameState } from '../game/GameState';
import { Game } from '../ui/Game';
import { range, sample } from 'lodash';
import { GameStateProvider } from '../game/providers/GameStateProvider';

const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam porttitor lacus eu risus iaculis tincidunt. Nam feugiat, elit et semper laoreet, quam nulla volutpat dui, non mattis mi sem eget tortor. Sed scelerisque libero odio.';

const Demo: React.FC<{
  gameState: ReturnType<typeof initGameState>;
}> = ({ gameState }) => {
  useInput((input, key) => {
    if (key.downArrow) {
      console.log('Adding player action');
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

  return (
    <GameStateProvider value={gameState}>
      <Game />
    </GameStateProvider>
  );
};

(async () => {
  const gameState = initGameState(10);
  const players = gameState.machinePlayers;

  // range(10).forEach(() => {
  //   players.forEach((player) => {
  //     gameState.log.addPlayerAction(player, lorem, ActionType.Speech);
  //   });
  // });
  // gameState.log.addPlayerAction(
  //   players[0],
  //   players[1].name,
  //   ActionType.Vote,
  //   '1',
  // );

  render(<Demo gameState={gameState} />);
})();
