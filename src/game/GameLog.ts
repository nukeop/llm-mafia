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
    const messages = this.#messages.filter((message) =>
      isPlayerAction(message),
    ) as PlayerAction[];

    return messages.map((message: PlayerAction) => ({
      role: message.player === player ? 'assistant' : 'user',
      content: `[${message.player.name}]: ${message.content}`,
    }));
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
