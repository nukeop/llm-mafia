import { Player } from './Player';

type PlayerMessage = {
  player: Player;
  thought: boolean;
  content: string;
};

type SystemMessage = {
  content: string;
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
    this.#messages.push({ player, thought, content });
  }

  addSystemMessage(content: string) {
    this.#messages.push({ content });
  }
}
