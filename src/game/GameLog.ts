import { ChatCompletionMessageParam } from 'openai/resources';
import { Player } from './Player';

type PlayerMessage = {
  player: Player;
  thought: boolean;
  content: string;
  type: 'player';
};

type SystemMessage = {
  content: string;
  type: 'system';
};

type ErrorMessage = {
  content: string;
  type: 'error';
};

type LogMessage = PlayerMessage | SystemMessage | ErrorMessage;

export class GameLog {
  #messages: LogMessage[] = [];

  constructor() {
    this.#messages = [];
  }

  get messages(): LogMessage[] {
    return this.#messages;
  }

  addPlayerMessage(player: Player, thought: boolean, content: string) {
    this.#messages.push({ player, thought, content, type: 'player' });
  }

  addSystemMessage(content: string) {
    this.#messages.push({ content, type: 'system' });
  }

  addErrorMessage(content: string) {
    this.#messages.push({ content, type: 'error' });
  }

  formatLogForLLM(player: Player): ChatCompletionMessageParam[] {
    const messages = this.#messages.filter((message) =>
      isPlayerMessage(message),
    ) as PlayerMessage[];

    return messages.map((message: PlayerMessage) => ({
      role: message.player === player ? 'assistant' : 'user',
      content: `[${message.player.name}]: ${message.content}`,
    }));
  }
}

export function isPlayerMessage(message: LogMessage): message is PlayerMessage {
  return message.type === 'player';
}

export function isSystemMessage(message: LogMessage): message is SystemMessage {
  return message.type === 'system';
}

export function isErrorMessage(message: LogMessage): message is ErrorMessage {
  return message.type === 'error';
}
