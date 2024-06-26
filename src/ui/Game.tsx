import { Box, Spacer, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';

import { GameState } from '../game/GameState';
import React, { useState } from 'react';
import { ActionType } from '../game/GameLog';
import { ChatBox } from './ChatBox';
import { ChatWindow } from './ChatWindow';
import { useGameState } from '../game/providers/GameStateProvider';

type GameProps = {};
export const Game: React.FC<GameProps> = () => {
  const [isLoading, setLoading] = useState(false);
  const { exit } = useApp();
  const gameState = useGameState();
  useInput(async (input, key) => {
    if (!gameState.stage.isHumanTurn() && key.return) {
      setLoading(true);
      await gameState.advance();
      setLoading(false);
    }
  });

  return (
    <Box padding={2} flexGrow={1} flexDirection="column">
      <ChatWindow messages={gameState.log.messages} linesToShow={10} />
      <Spacer />
      {gameState.stage.isHumanTurn() && (
        <ChatBox
          onSend={async (message) => {
            gameState.log.addPlayerAction(
              gameState.stage.actingPlayer,
              message,
              ActionType.Speech,
            );
            setLoading(true);
            await gameState.advance();
            setLoading(false);
          }}
        />
      )}
      {!gameState.stage.isHumanTurn() && (
        <Box borderStyle="round" borderColor="green">
          {isLoading && (
            <Box>
              <Spinner />
            </Box>
          )}
          {!isLoading && (
            <Box>
              <Text color="yellow">Press</Text>
              <Text color="green"> {`<Enter>`} </Text>
              <Text color="yellow">to advance...</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
