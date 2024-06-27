import { Box, Spacer, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';

import React, { useEffect, useState } from 'react';
import { ActionType } from '../game/GameLog';
import { ChatBox } from './ChatBox';
import { ChatWindow } from './ChatWindow';
import { useGameState } from '../game/providers/GameStateProvider';

type GameProps = { players: number };

export const Game: React.FC<GameProps> = ({ players }) => {
  const [isLoading, setLoading] = useState(false);
  const { exit } = useApp();
  const { log, actingPlayer, isHumanTurn, advance, initGameState } =
    useGameState();
  useInput(async (input, key) => {
    if (!isHumanTurn() && key.return) {
      setLoading(true);
      await advance();
      setLoading(false);
    }
  });

  useEffect(() => {
    initGameState(players);
  }, [players]);

  return (
    <Box padding={2} flexGrow={1} flexDirection="column">
      <ChatWindow messages={log.messages} linesToShow={10} />
      <Spacer />
      {isHumanTurn() && (
        <ChatBox
          onSend={async (message) => {
            log.addPlayerAction(actingPlayer, message, ActionType.Speech);
            setLoading(true);
            await advance();
            setLoading(false);
          }}
        />
      )}
      {!isHumanTurn() && (
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
