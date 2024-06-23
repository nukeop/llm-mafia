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

export class GameLog {
  #messages: (PlayerMessage | SystemMessage)[] = [];

  constructor() {
    this.#messages = [];
  }

  get messages(): (PlayerMessage | SystemMessage)[] {
    return this.#messages;
  }

  addPlayerMessage(player: Player, thought: boolean, content: string) {
    this.#messages.push({ player, thought, content, type: 'player' });
  }

  addSystemMessage(content: string) {
    this.#messages.push({ content, type: 'system' });
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

export function isPlayerMessage(
  message: PlayerMessage | SystemMessage,
): message is PlayerMessage {
  return message.type === 'player';
}

export function isSystemMessage(
  message: PlayerMessage | SystemMessage,
): message is SystemMessage {
  return message.type === 'system';
}
