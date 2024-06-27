import React, { createContext, useContext, useState } from 'react';
import { Player, Team } from '../Player';
import { GameLog } from '../GameLog';
import { sample } from 'lodash';
import { OpenAiApiService } from '../../services/OpenAiService';
import { ActionType } from '../GameLog';
import Logger from '../../logger';
import { names } from '../../prompts/names';
import { personalities } from '../../prompts/personalities';
import { tools } from '../../prompts/tools';
import { createSystemPrompt } from '../../prompts';

interface GameStateContextType {
  machinePlayers: Player[];
  humanPlayer: Player;
  actingPlayer: Player;
  log: GameLog;
  initGameState: (numberOfPlayers: number) => void;
  advance: () => Promise<void>;
  processPlayerAction: () => Promise<void>;
  isHumanTurn: () => boolean;
}

const GameStateContext = createContext<GameStateContextType | undefined>(
  undefined,
);

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

export const GameStateProvider: React.FC<GameStateProviderProps> = ({
  children,
}) => {
  const [machinePlayers, setMachinePlayers] = useState<Player[]>([]);
  const [humanPlayer, setHumanPlayer] = useState<Player>(
    new Player('', Team.Humans),
  );
  const [log, setLog] = useState<GameLog>(new GameLog());
  const [actingPlayer, setActingPlayer] = useState<Player>(humanPlayer);

  const initGameState = (numberOfPlayers: number) => {
    let availableNames = names;
    const machinePlayersInit = Array.from({ length: numberOfPlayers }, (_) => {
      const name = sample(availableNames) ?? '';
      availableNames = availableNames.filter((n) => n !== name);
      return new Player(name!, Team.Machines, sample(personalities)?.name);
    });

    const humanName = sample(names) ?? '';
    const humanPlayerInit = new Player(humanName!, Team.Humans);

    setMachinePlayers(machinePlayersInit);
    setHumanPlayer(humanPlayerInit);
    setActingPlayer(machinePlayersInit[0]);
  };

  const playerNames = (): string[] => {
    return [humanPlayer, ...machinePlayers].map((player) => player.name);
  };

  /**
   * Proceed to the next player.
   * If the current player is the last machine player, the next player is the human player.
   * Otherwise, the next player is the next machine player.
   */
  const nextPlayer = () => {
    if (actingPlayer === humanPlayer) {
      setActingPlayer(machinePlayers[0]);
    } else {
      const currentPlayerIndex = machinePlayers.findIndex(
        (player) => player === actingPlayer,
      );

      if (currentPlayerIndex === machinePlayers.length - 1) {
        setActingPlayer(humanPlayer);
      } else {
        const nextPlayerIndex = currentPlayerIndex + 1;
        setActingPlayer(machinePlayers[nextPlayerIndex]);
      }
    }
  };

  const isHumanTurn = (): boolean => {
    return actingPlayer === humanPlayer;
  };

  const advance = async () => {
    if (actingPlayer === humanPlayer) {
      nextPlayer();
    } else {
      try {
        Logger.debug(`Processing machine turn for: ${actingPlayer.name}`);
        await processPlayerAction();
        nextPlayer();
        Logger.debug(`Progressing to next player: ${actingPlayer.name}`);
      } catch (error) {
        log.addErrorMessage(
          'An error occurred while processing the machine turn.',
        );
        log.addErrorMessage((error as Error).message);
        nextPlayer();
      }
    }
  };

  const processPlayerAction = async () => {
    const service = new OpenAiApiService();
    const prompt = createSystemPrompt(
      actingPlayer.name,
      playerNames(),
      personalities.find(
        (personality) => personality.name === actingPlayer.personality,
      )?.description!,
    );
    const logForLLM = log.formatLogForLLM(actingPlayer);
    const response = await service.createChatCompletion({
      max_tokens: 512,
      model: 'gpt-3.5-turbo',
      tools,
      parallel_tool_calls: false,
      messages: [{ role: 'system', content: prompt }, ...logForLLM],
    });

    const choice = response.choices[0];
    Logger.debug(JSON.stringify(choice, null, 2));
    const toolCall = choice.message?.tool_calls?.[0];
    const message = choice.message?.content;

    if (toolCall) {
      const actionType: ActionType = toolCall?.function.name as ActionType;
      log.addPlayerAction(
        actingPlayer,
        toolCall?.function.arguments!,
        actionType,
        toolCall.id,
      );
    } else if (message) {
      log.addPlayerAction(actingPlayer, message, ActionType.Speech);
    }

    setLog(log);
  };

  return (
    <GameStateContext.Provider
      value={{
        machinePlayers,
        humanPlayer,
        actingPlayer,
        log,
        initGameState,
        advance,
        processPlayerAction,
        isHumanTurn,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};
