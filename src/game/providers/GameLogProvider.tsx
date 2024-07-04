import React, { createContext, useContext, useState } from 'react';
import { ChatCompletionMessageParam } from 'openai/resources';
import { Player } from '../Player';
import FileLogger from '../../file-logger';

export enum ActionType {
  Thought = 'thought',
  Speech = 'speech',
  Vote = 'vote',
  EndTurn = 'end_turn',
}

export enum MessageType {
  System = 'system',
  Error = 'error',
  PlayerAction = 'player_action',
  Announcer = 'announcer',
}

export type PlayerAction = {
  player: Player;
  content: string;
  actionType: ActionType;
  type: MessageType.PlayerAction;
  reason?: string;

  // OpenAI API call ID
  callId?: string;
};

export type SystemMessage = {
  content: string;
  type: MessageType.System;
};

export type ErrorMessage = {
  content: string;
  type: MessageType.Error;
};

export type AnnouncerMessage = {
  content: string;
  type: MessageType.Announcer;
};

export type LogMessage =
  | PlayerAction
  | SystemMessage
  | ErrorMessage
  | AnnouncerMessage;

export type GameLogContextValue = {
  messages: LogMessage[];
  addPlayerAction: (
    player: Player,
    content: string,
    actionType: ActionType,
    callId?: string,
    reason?: string,
  ) => void;
  addSystemMessage: (content: string) => void;
  addErrorMessage: (content: string) => void;
  addAnnouncerMessage: (content: string) => void;
  formatLogForLLM: (player: Player) => ChatCompletionMessageParam[];
};

const GameLogContext = createContext<GameLogContextValue | undefined>(
  undefined,
);

export const useGameLog = (): GameLogContextValue => {
  const context = useContext(GameLogContext);
  if (!context) {
    throw new Error('useGameLog must be used within a GameLogProvider');
  }
  return context;
};

type GameLogProviderProps = {
  children: React.ReactNode;
};
export const GameLogProvider: React.FC<GameLogProviderProps> = ({
  children,
}) => {
  const [messages, setMessages] = useState<LogMessage[]>([]);

  const addPlayerAction = (
    player: Player,
    content: string,
    actionType: ActionType,
    callId?: string,
    reason?: string,
  ) => {
    FileLogger.info(playerActionToString(player, content, actionType));
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        player,
        content,
        type: MessageType.PlayerAction,
        actionType,
        callId,
        reason,
      },
    ]);
  };

  const addSystemMessage = (content: string) => {
    FileLogger.info(`[System]: ${content}`);
    setMessages((prevMessages) => [
      ...prevMessages,
      { content, type: MessageType.System },
    ]);
  };

  const addErrorMessage = (content: string) => {
    FileLogger.error(`[Error]: ${content}`);
    setMessages((prevMessages) => [
      ...prevMessages,
      { content, type: MessageType.Error },
    ]);
  };

  const addAnnouncerMessage = (content: string) => {
    FileLogger.info(`[Announcer]: ${content}`);
    setMessages((prevMessages) => [
      ...prevMessages,
      { content, type: MessageType.Announcer },
    ]);
  };

  const formatLogForLLM = (player: Player) => {
    const filteredMessages = messages.filter(
      (message) =>
        isSpeech(message) ||
        isAnnouncerMessage(message) ||
        (isThought(message) && (message as PlayerAction).player === player) ||
        (isVote(message) && (message as PlayerAction).player === player) ||
        (isEndTurn(message) && (message as PlayerAction).player === player),
    ) as (PlayerAction | AnnouncerMessage)[];

    return filteredMessages.reduce(
      (result: ChatCompletionMessageParam[], message) => {
        if (isAnnouncerMessage(message)) {
          result.push({
            role: 'user',
            content: `[Announcer}: ${message.content}`,
          });
        } else if (
          message.actionType === ActionType.Thought ||
          message.actionType === ActionType.Vote ||
          message.actionType === ActionType.EndTurn
        ) {
          result.push({
            role: 'assistant',
            tool_calls: [
              {
                id: message.callId ?? '',
                type: 'function',
                function: {
                  name: message.actionType,
                  arguments: JSON.stringify({ content: message.content }),
                },
              },
            ],
          });

          result.push({
            role: 'tool',
            tool_call_id: message.callId ?? '',
            content: 'Success',
          });
        } else {
          if (message.player === player) {
            result.push({
              role: 'assistant',
              tool_calls: [
                {
                  id: message.callId ?? '',
                  type: 'function',
                  function: {
                    name: ActionType.Speech,
                    arguments: JSON.stringify({ content: message.content }),
                  },
                },
              ],
            });
            result.push({
              role: 'tool',
              tool_call_id: message.callId ?? '',
              content: 'Success',
            });
          } else {
            result.push({
              role: 'user',
              content: `[${message.player.name}]: ${message.content}`,
            });
          }
        }
        return result;
      },
      [],
    );
  };

  const playerActionToString = (
    player: Player,
    content: string,
    actionType: ActionType,
  ): string => {
    if (actionType === ActionType.EndTurn) {
      return `*${player.name} ends his turn*`;
    }

    if (actionType === ActionType.Vote) {
      return `*${player.name} votes for ${content}*`;
    }

    return `[${player.name}](${actionTypeToString(actionType)}): ${content}`;
  };

  const value: GameLogContextValue = {
    messages,
    addPlayerAction,
    addSystemMessage,
    addErrorMessage,
    addAnnouncerMessage,
    formatLogForLLM,
  };

  return (
    <GameLogContext.Provider value={value}>{children}</GameLogContext.Provider>
  );
};

export function isPlayerAction(message: LogMessage): message is PlayerAction {
  return message.type === MessageType.PlayerAction;
}

export function isSystemMessage(message: LogMessage): message is SystemMessage {
  return message.type === MessageType.System;
}

export function isErrorMessage(message: LogMessage): message is ErrorMessage {
  return message.type === MessageType.Error;
}

export function isAnnouncerMessage(
  message: LogMessage,
): message is AnnouncerMessage {
  return message.type === MessageType.Announcer;
}

export function isSpeech(message: LogMessage): boolean {
  return isPlayerAction(message) && message.actionType === ActionType.Speech;
}

export function isThought(message: LogMessage): boolean {
  return isPlayerAction(message) && message.actionType === ActionType.Thought;
}

export function isVote(message: LogMessage): boolean {
  return isPlayerAction(message) && message.actionType === ActionType.Vote;
}

export function isEndTurn(message: LogMessage): boolean {
  return isPlayerAction(message) && message.actionType === ActionType.EndTurn;
}

export function actionTypeToString(actionType: ActionType): string {
  switch (actionType) {
    case ActionType.Thought:
      return 'Thought';
    case ActionType.Speech:
      return 'Speech';
    case ActionType.Vote:
      return 'Vote';
    case ActionType.EndTurn:
      return 'End Turn';
    default:
      return 'Unknown';
  }
}
