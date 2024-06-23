import { Box, Spacer, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';

import { GameState } from '../game/GameState';
import React, { useState } from 'react';
import { PlayerText } from './PlayerText';
import { SystemText } from './SystemText';
import { isPlayerMessage } from '../game/GameLog';
import { ChatBox } from './ChatBox';

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
      <Box
        borderStyle="round"
        borderColor="green"
        padding={1}
        flexDirection="column"
        flexGrow={1}
      >
        {gameState.log.messages.map((message, index) =>
          isPlayerMessage(message) ? (
            !message.thought && (
              <PlayerText
                key={index}
                name={message.player.name}
                content={message.content}
              />
            )
          ) : (
            <SystemText key={index} content={message.content} />
          ),
        )}
      </Box>
      <Spacer />
      {gameState.stage.isHumanTurn() && (
        <ChatBox
          onSend={async (message) => {
            gameState.log.addPlayerMessage(
              gameState.stage.actingPlayer,
              false,
              message,
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
