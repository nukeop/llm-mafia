import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { ActionType, LogMessage, MessageType } from '../game/GameLog';
import { Speech } from './Speech';
import { SystemText } from './SystemText';
import { ErrorText } from './ErrorText';
import { Vote } from './Vote';

type ChatWindowProps = {
  messages: LogMessage[];
  linesToShow: number;
};

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  linesToShow,
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    setScrollPosition(Math.max(0, messages.length - linesToShow));
  }, [messages, linesToShow]);

  useInput((input, key) => {
    if (key.upArrow) {
      setScrollPosition((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setScrollPosition((prev) =>
        Math.min(messages.length - linesToShow, prev + 1),
      );
    }
  });

  const visibleMessages = messages.slice(
    scrollPosition,
    scrollPosition + linesToShow,
  );

  return (
    <Box flexDirection="column" height={linesToShow + 2}>
      <Box
        borderStyle="round"
        padding={1}
        marginBottom={1}
        flexDirection="column"
        alignItems="flex-end"
      >
        {scrollPosition > 0 && <Text color="gray">▲ Scroll up</Text>}
        {scrollPosition < messages.length - linesToShow && (
          <Text color="gray">▼ Scroll down</Text>
        )}
      </Box>
      {visibleMessages.map((message, index) => {
        switch (message.type) {
          case MessageType.PlayerAction:
            if (message.actionType === ActionType.Speech) {
              return (
                <Speech
                  key={index}
                  player={message.player}
                  content={message.content}
                />
              );
            } else if (message.actionType === ActionType.Vote) {
              return (
                <Vote
                  key={index}
                  player={message.player}
                  content={message.content}
                />
              );
            }
            break;
          case MessageType.System:
            return <SystemText key={index} content={message.content} />;
          case MessageType.Error:
            return <ErrorText key={index} content={message.content} />;
          default:
            return null;
        }
      })}
    </Box>
  );
};
