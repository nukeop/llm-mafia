import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { ActionType, LogMessage, MessageType } from '../game/GameLog';
import { Speech } from './Speech';
import { SystemText } from './SystemText';
import { ErrorText } from './ErrorText';
import { Vote } from './Vote';
import Logger from '../logger';

type ChatWindowProps = {
  messages: LogMessage[];
  linesToShow: number;
};

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  linesToShow,
}) => {
  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: linesToShow,
  });

  useEffect(() => {
    setVisibleRange({
      start: Math.max(0, messages.length - linesToShow),
      end: messages.length,
    });
  }, [messages, linesToShow]);

  useInput((input, key) => {
    if (key.upArrow) {
      setVisibleRange((prev) => ({
        start: Math.max(0, prev.start - 1),
        end: Math.max(linesToShow, prev.end - 1),
      }));
    } else if (key.downArrow) {
      setVisibleRange((prev) => ({
        start: Math.min(messages.length - linesToShow, prev.start + 1),
        end: Math.min(messages.length, prev.end + 1),
      }));
    }
  });

  const visibleMessages = messages.slice(visibleRange.start, visibleRange.end);
  const scrollProgress = visibleRange.start / (messages.length - linesToShow);

  return (
    <Box flexDirection="row">
      <Box
        borderStyle="round"
        borderColor="green"
        flexDirection="column"
        flexGrow={1}
        padding={1}
        height={linesToShow + 2}
      >
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
      <Box
        borderStyle="round"
        padding={0}
        flexDirection="column"
        alignItems="flex-end"
      >
        <Box width={1} height={linesToShow}>
          <Text>
            {Array.from({ length: linesToShow }).map((_, index) => {
              const position = Math.floor(scrollProgress * (linesToShow - 1));
              return index === position ? '▓' : '░';
            })}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
