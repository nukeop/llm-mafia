import { sample } from 'lodash';
import { Player, Team } from './Player';
import { names } from '../prompts/names';
import { GameLog } from './GameLog';

export class GameState {
  #machinePlayers: Player[];
  #humanPlayer: Player;
  #log: GameLog;

  constructor(machinePlayers: Player[], humanPlayer: Player) {
    this.#machinePlayers = machinePlayers;
    this.#humanPlayer = humanPlayer;
    this.#log = new GameLog();
  }

  get machinePlayers(): Player[] {
    return this.#machinePlayers;
  }

  get humanPlayer(): Player {
    return this.#humanPlayer;
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
