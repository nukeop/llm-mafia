import { Box, Spacer, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';

import { Container } from './Container';
import { GameState } from '../game/GameState';
import React, { useState } from 'react';
import { PlayerText } from './PlayerText';
import { SystemText } from './SystemText';
import { isPlayerMessage } from '../game/GameLog';

type GameProps = {
  gameState: GameState;
};
export const Game: React.FC<GameProps> = ({ gameState }) => {
  const [isLoading, setLoading] = useState(false);
  const { exit } = useApp();
  useInput(async (input, key) => {
    if (input === 'q') {
      exit();
    }

    if (key.return) {
      setLoading(true);
      await gameState.advance();
      setLoading(false);
    }
  });

  return (
    <Container>
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
      <Spacer />
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
    </Container>
  );
};
