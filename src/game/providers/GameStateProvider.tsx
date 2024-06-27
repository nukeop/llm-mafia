import React, { createContext, useContext, useState } from 'react';
import { Player, Team } from '../Player';
import { GameLog } from '../GameLog';
import { GameStage } from '../GameStage';
import { sample } from 'lodash';
import { names, personalities } from '../../prompts';
import { OpenAiApiService } from '../../services/OpenAiService';
import { ActionType } from '../GameLog';
import Logger from '../../logger';

interface GameStateContextType {
  machinePlayers: Player[];
  humanPlayer: Player;
  log: GameLog;
  stage: GameStage;
  advance: () => Promise<void>;
  processPlayerAction: () => Promise<void>;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

interface GameStateProviderProps {
  children: React.ReactNode;
}

export const GameStateProvider: React.FC<GameStateProviderProps> = ({ children }) => {
  const [machinePlayers, setMachinePlayers] = useState<Player[]>([]);
  const [humanPlayer, setHumanPlayer] = useState<Player>(new Player('', Team.Humans));
  const [log, setLog] = useState<GameLog>(new GameLog());
  const [stage, setStage] = useState<GameStage>(new GameStage(new Player('', Team.Machines)));

  const initGameState = (numberOfPlayers: number) => {
    let availableNames = names;
    const machinePlayersInit = Array.from({ length: numberOfPlayers }, (_) => {
      const name = sample(availableNames) ?? '';
      availableNames = availableNames.filter((n) => n !== name);
      return new Player(name!, Team.Machines, sample(personalities)?.name);
    });

    const humanName = sample(names) ?? '';
    const humanPlayerInit = new Player(humanName!, Team.Humans);
    const stageInit = new GameStage(machinePlayersInit[0]);

    setMachinePlayers(machinePlayersInit);
    setHumanPlayer(humanPlayerInit);
    setStage(stageInit);
  };

  const advance = async () => {
    if (stage.actingPlayer === humanPlayer) {
      stage.nextPlayer();
    } else {
      try {
        Logger.debug(`Processing machine turn for: ${stage.actingPlayer.name}`);
        await processPlayerAction();
        stage.nextPlayer();
        Logger.debug(`Progressing to next player: ${stage.actingPlayer.name}`);
      } catch (error) {
        log.addErrorMessage('An error occurred while processing the machine turn.');
        log.addErrorMessage((error as Error).message);
        stage.nextPlayer();
      }
    }
  };

  const processPlayerAction = async () => {
    const service = new OpenAiApiService();
    const response = await service.createChatCompletion({
      max_tokens: 512,
      model: 'gpt-3.5-turbo',
      tools: [],
      parallel_tool_calls: false,
      messages: [{ role: 'system', content: 'Your prompt here' }],
    });

    const choice = response.choices[0];
    Logger.debug(JSON.stringify(choice, null, 2));
    const toolCall = choice.message?.tool_calls?.[0];
    const message = choice.message?.content;

    if (toolCall) {
      const actionType: ActionType = toolCall?.function.name as ActionType;
      log.addPlayerAction(stage.actingPlayer, toolCall?.function.arguments!, actionType, toolCall.id);
    } else if (message) {
      log.addPlayerAction(stage.actingPlayer, message, ActionType.Speech);
    }
  };

  return (
    <GameStateContext.Provider value={{ machinePlayers, humanPlayer, log, stage, advance, processPlayerAction }}>
      {children}
    </GameStateContext.Provider>
  );
};
