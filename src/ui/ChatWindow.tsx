import React from 'react';
import { Static } from 'ink';
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
  return (
    <Static items={messages}>
      {(message, index) => {
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
      }}
    </Static>
  );
};
