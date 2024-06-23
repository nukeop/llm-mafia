import { sample } from 'lodash';
import { Player, Team } from './Player';
import { names } from '../prompts/names';
import { ActionType, GameLog } from './GameLog';
import { GameStage } from './GameStage';
import { createSystemPrompt } from '../prompts';
import { OpenAiApiService } from '../services/OpenAiService';
import { tools } from '../prompts/tools';
import Logger from '../logger';
import { safeParse } from '../json-utils';
import { personalities } from '../prompts/personalities';

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

  playerNames(): string[] {
    return [this.humanPlayer, ...this.machinePlayers].map(
      (player) => player.name,
    );
  }

  async processPlayerAction(): Promise<void> {
    const prompt = createSystemPrompt(
      this.stage.actingPlayer.name,
      this.playerNames(),
      this.stage.actingPlayer.personality!,
    );
    const log = this.log.formatLogForLLM(this.stage.actingPlayer);
    Logger.debug(JSON.stringify(log, null, 2));
    const service = new OpenAiApiService();
    const response = await service.createChatCompletion({
      max_tokens: 512,
      model: 'gpt-4o',
      tools,
      parallel_tool_calls: false,
      messages: [{ role: 'system', content: prompt }, ...log],
    });

    const choice = response.choices[0];
    Logger.debug(JSON.stringify(choice, null, 2));
    const toolCall = choice.message?.tool_calls?.[0];
    const message = choice.message?.content;

    if (toolCall) {
      const toolCallBody = safeParse(toolCall?.function.arguments!);
      const action = toolCall?.function.name;
      const actionType: ActionType = action as ActionType;

      if (actionType === ActionType.Speech) {
        this.log.addPlayerAction(
          this.stage.actingPlayer,
          toolCallBody.content,
          ActionType.Speech,
          toolCall.id,
        );
      }

      if (actionType === ActionType.Thought) {
        this.log.addPlayerAction(
          this.stage.actingPlayer,
          toolCallBody.content,
          ActionType.Thought,
          toolCall.id,
        );
      }

      if (actionType === ActionType.Vote) {
        // this.stage.addVote(this.stage.actingPlayer, toolCallBody.target);
      }

      if (actionType === ActionType.EndTurn) {
        return;
      }

      await this.processPlayerAction();
    } else if (message) {
      this.log.addPlayerAction(
        this.stage.actingPlayer,
        message,
        ActionType.Speech,
      );

      await this.processPlayerAction();
    }
  }

  async advance() {
    if (this.stage.actingPlayer === this.humanPlayer) {
      this.stage.nextPlayer();
    } else {
      try {
        Logger.debug(
          `Processing machine turn for: ${this.stage.actingPlayer.name}`,
        );
        await this.processPlayerAction();

        this.stage.nextPlayer();
        Logger.debug(
          `Progressing to next player: ${this.stage.actingPlayer.name}`,
        );
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
    return new Player(name!, Team.Machines, sample(personalities)!);
  });

  const humanName = sample(names) ?? '';
  const state = new GameState(
    machinePlayers,
    new Player(humanName!, Team.Humans),
  );
  state.stage.connectGameState(state);
  return state;
};
