import { sample } from 'lodash';
import { Player, Team } from './Player';
import { names } from '../prompts/names';
import { GameLog } from './GameLog';
import { GameStage } from './GameStage';
import { createSystemPrompt } from '../prompts';
import { OpenAiApiService } from '../services/OpenAiService';

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
      this.stage.nextPlayer();
    } else {
      try {
        const prompt = createSystemPrompt(this.stage.actingPlayer.name);
        const log = this.log.formatLogForLLM(this.stage.actingPlayer);
        const service = new OpenAiApiService();
        const response = await service.createChatCompletion({
          max_tokens: 512,
          model: 'gpt-4o',
          messages: [{ role: 'system', content: prompt }, ...log],
        });

        const responseMessage = response.choices[0].message?.content?.replace(
          `[${this.stage.actingPlayer.name}]:`,
          '',
        );

        const lines = responseMessage?.split('\n');
        const thought = lines?.find((line) => line.startsWith('[Thought]'));
        const speech = lines?.find((line) => line.startsWith('[Speech]'));

        if (thought) {
          this.log.addPlayerMessage(this.stage.actingPlayer, true, thought);
        }

        if (speech) {
          this.log.addPlayerMessage(this.stage.actingPlayer, false, speech);
        }

        this.stage.nextPlayer();
      } catch (error) {
        this.log.addErrorMessage(
          'An error occurred while processing the machine turn.',
        );
        this.log.addErrorMessage((error as Error).message);
        this.stage.nextPlayer();
      }
    }
  }
}

export const initGameState = (numberOfPlayers: number): GameState => {
  let availableNames = names;
  const machinePlayers = Array.from({ length: numberOfPlayers }, (_) => {
    const name = sample(availableNames) ?? '';
    availableNames = availableNames.filter((n) => n !== name);
    return new Player(name ?? '', Team.Machines);
  });

  const humanName = sample(names) ?? '';
  const state = new GameState(
    machinePlayers,
    new Player(humanName, Team.Humans),
  );
  state.stage.connectGameState(state);
  return state;
};
