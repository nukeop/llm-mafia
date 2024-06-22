import { sample } from 'lodash';
import { Player, Team } from './Player';
import { names } from '../prompts/names';
import { GameLog } from './GameLog';
import { GameStage } from './GameStage';
import { createSystemPrompt } from '../prompts';

export class GameState {
  #machinePlayers: Player[];
  #humanPlayer: Player;
  #log: GameLog;
  #stage: GameStage;

  constructor(machinePlayers: Player[], humanPlayer: Player) {
    this.#machinePlayers = machinePlayers;
    this.#humanPlayer = humanPlayer;
    this.#log = new GameLog();
    this.#stage = new GameStage(this.machinePlayers[0]);
  }

  get machinePlayers(): Player[] {
    return this.#machinePlayers;
  }

  get humanPlayer(): Player {
    return this.#humanPlayer;
  }

  get log(): GameLog {
    return this.#log;
  }

  get stage(): GameStage {
    return this.#stage;
  }

  async advance() {
    if (this.stage.actingPlayer === this.humanPlayer) {
      // TODO
    } else {
      const prompt = createSystemPrompt(this.stage.actingPlayer.name);
    }
  }
}

export const initGameState = (numberOfPlayers: number): GameState => {
  const machinePlayers = Array.from(
    { length: numberOfPlayers },
    (_) => new Player(sample(names) ?? '', Team.Machines),
  );

  const humanName = sample(names) ?? '';
  return new GameState(machinePlayers, new Player(humanName, Team.Humans));
};
