import React from 'react';
import { Static } from 'ink';
import {
  ActionType,
  LogMessage,
  MessageType,
} from '../game/providers/GameLogProvider';
import { Speech } from './Speech';
import { SystemText } from './SystemText';
import { ErrorText } from './ErrorText';
import { Vote } from './Vote';
import { Thought } from './Thought';
import { EndTurn } from './EndTurn';
import { Announcement } from './Announcement';

type ChatWindowProps = {
  messages: LogMessage[];
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <Static
      items={messages}
      style={{
        flexDirection: 'column',
        width: '100%',
      }}
    >
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
            } else if (message.actionType === ActionType.Thought) {
              return (
                <Thought
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
                  reason={message.reason}
                />
              );
            } else if (message.actionType === ActionType.EndTurn) {
              return (
                <EndTurn
                  key={index}
                  player={message.player}
                  reason={message.reason}
                />
              );
            }
            break;
          case MessageType.Announcer:
            return <Announcement key={index} content={message.content} />;
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
