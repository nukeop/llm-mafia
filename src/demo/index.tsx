import React from 'react';
import { render, useInput } from 'ink';
import {
  ActionType,
  GameLogProvider,
  useGameLog,
} from '../game/providers/GameLogProvider';
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
  const { messages, addPlayerAction, addAnnouncerMessage, addErrorMessage } =
    useGameLog();
  useInput((input, key) => {
    if (key.downArrow) {
      addPlayerAction(
        sample(gameState.machinePlayers)!,
        lorem,
        ActionType.Speech,
      );
      addPlayerAction(
        sample(gameState.machinePlayers)!,
        'test',
        ActionType.Vote,
      );
      addPlayerAction(
        sample(gameState.machinePlayers)!,
        'test',
        ActionType.Thought,
      );
      addPlayerAction(
        sample(gameState.machinePlayers)!,
        'test',
        ActionType.EndTurn,
      );
      addAnnouncerMessage('This is a short announcement');
      addErrorMessage('This is an error message');
    }
  });

  return <Game players={10} />;
};

(async () => {
  render(
    <GameLogProvider>
      <GameStateProvider>
        <Demo />
      </GameStateProvider>
    </GameLogProvider>,
  );
})();
