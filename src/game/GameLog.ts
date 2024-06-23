import { ChatCompletionMessageParam } from 'openai/resources';
import { Player } from './Player';

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

type PlayerAction = {
  player: Player;
  content: string;
  actionType: ActionType;
  type: MessageType.PlayerAction;
};

type SystemMessage = {
  content: string;
  type: MessageType.System;
};

type ErrorMessage = {
  content: string;
  type: MessageType.Error;
};

type AnnouncerMessage = {
  content: string;
  type: MessageType.Announcer;
};

type LogMessage =
  | PlayerAction
  | SystemMessage
  | ErrorMessage
  | AnnouncerMessage;

export class GameLog {
  #messages: LogMessage[] = [];

  constructor() {
    this.#messages = [];
  }

  get messages(): LogMessage[] {
    return this.#messages;
  }

  addPlayerAction(player: Player, content: string, actionType: ActionType) {
    this.#messages.push({
      player,
      content,
      type: MessageType.PlayerAction,
      actionType,
    });
  }

  addSystemMessage(content: string) {
    this.#messages.push({ content, type: MessageType.System });
  }

  addErrorMessage(content: string) {
    this.#messages.push({ content, type: MessageType.Error });
  }

  addAnnouncerMessage(content: string) {
    this.#messages.push({ content, type: MessageType.Announcer });
  }

  formatLogForLLM(player: Player): ChatCompletionMessageParam[] {
    const messages = this.#messages.filter(
      (message) =>
        isSpeech(message) ||
        isAnnouncerMessage(message) ||
        (isThought(message) && (message as PlayerAction).player === player),
    ) as (PlayerAction | AnnouncerMessage)[];

    return messages.map((message) => {
      if (isAnnouncerMessage(message))
        return {
          role: 'user',
          content: `[Announcer}: ${message.content}`,
        };

      return {
        role: message.player === player ? 'assistant' : 'user',
        content: `[${message.player.name}]: ${message.content}`,
      };
    });
  }

  formatLogForGameEnd(): string {
    return this.#messages
      .map((message) => {
        if (isSystemMessage(message)) {
          return `[System]: ${message.content}`;
        } else if (isPlayerAction(message)) {
          if (message.actionType === ActionType.EndTurn) {
            return `*${message.player.name} ends his turn*`;
          }

          if (message.actionType === ActionType.Vote) {
            return `*${message.player.name} votes for ${message.content}*`;
          }

          return `[${message.player.name}](${actionTypeToString(message.actionType)}): ${message.content}`;
        } else if (isAnnouncerMessage(message)) {
          return `[Announcer]: ${message.content}`;
        } else {
          return message.content;
        }
      })
      .join('\n');
  }
}

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
