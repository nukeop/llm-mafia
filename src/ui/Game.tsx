import { Box, Spacer, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';

import { GameState } from '../game/GameState';
import React, { useState } from 'react';
import { SystemText } from './SystemText';
import { ActionType, MessageType, isPlayerAction } from '../game/GameLog';
import { ChatBox } from './ChatBox';
import { ErrorText } from './ErrorText';
import { Speech } from './Speech';
import Logger from '../logger';

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

  Logger.info(JSON.stringify(gameState.log.messages, null, 2));

  return (
    <Box padding={2} flexGrow={1} flexDirection="column">
      <Box
        borderStyle="round"
        borderColor="green"
        padding={1}
        flexDirection="column"
        flexGrow={1}
      >
        {gameState.log.messages.map((message, index) => {
          switch (message.type) {
            case MessageType.PlayerAction: {
              if (message.actionType === ActionType.Speech)
                return (
                  <Speech
                    key={index}
                    player={message.player}
                    content={message.content}
                  />
                );
            }
            case MessageType.System: {
              return <SystemText key={index} content={message.content} />;
            }
            case MessageType.Error: {
              return <ErrorText key={index} content={message.content} />;
            }
            default:
              return null;
          }
        })}
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
