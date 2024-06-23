import React from 'react';
import { ActionType, LogMessage, MessageType } from '../game/GameLog';
import { Speech } from './Speech';
import { SystemText } from './SystemText';
import { ErrorText } from './ErrorText';

type ChatWindowProps = {
  messages: LogMessage[];
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <>
      {messages.map((message, index) => {
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
    </>
  );
};
