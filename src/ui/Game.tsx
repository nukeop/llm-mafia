import { Box, Spacer, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';

import { GameState } from '../game/GameState';
import React, { useState } from 'react';
import { ActionType } from '../game/GameLog';
import { ChatBox } from './ChatBox';
import Logger from '../logger';
import { ChatWindow } from './ChatWindow';

type GameProps = {
  gameState: GameState;
};
export const Game: React.FC<GameProps> = ({ gameState }) => {
  const [isLoading, setLoading] = useState(false);
  const { exit } = useApp();
  useInput(async (input, key) => {
    if (!gameState.stage.isHumanTurn() && key.return) {
      setLoading(true);
      await gameState.advance();
      setLoading(false);
    }
  });

  return (
    <Box padding={2} flexGrow={1} flexDirection="column">
      <Box flexDirection="column" flexGrow={1}>
        <ChatWindow messages={gameState.log.messages} linesToShow={10} />
      </Box>
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
