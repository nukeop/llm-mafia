import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Player, Team } from '../Player';
import { sample } from 'lodash';
import { OpenAiApiService } from '../../services/OpenAiService';
import { ActionType, useGameLog } from './GameLogProvider';
import Logger from '../../logger';
import { names } from '../../prompts/names';
import { personalities } from '../../prompts/personalities';
import { tools } from '../../prompts/tools';
import { createSystemPrompt } from '../../prompts';
import { safeParse } from '../../json-utils';

interface GameStateContextType {
  machinePlayers: Player[];
  humanPlayer: Player;
  actingPlayer: Player;
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

type GameStateProviderProps = {
  children: React.ReactNode;
};

export const GameStateProvider: React.FC<GameStateProviderProps> = ({
  children,
}) => {
  const [machinePlayers, setMachinePlayers] = useState<Player[]>([]);
  const [humanPlayer, setHumanPlayer] = useState<Player>(
    new Player('', Team.Humans),
  );
  const [actingPlayer, setActingPlayer] = useState<Player>(humanPlayer);
  const {
    messages,
    addPlayerAction,
    addSystemMessage,
    addErrorMessage,
    addAnnouncerMessage,
    formatLogForLLM,
    formatLogForGameEnd,
  } = useGameLog();

  useEffect(() => {
    if (!machinePlayers.length || !humanPlayer.name) {
      return;
    }

    addSystemMessage(
      'Welcome to the LLM Mafia! You are the human player. The goal is to blend in while the machines try to eliminate you. Good luck!',
    );
    addSystemMessage(
      `The machine players are:\n ${machinePlayers.map((player) => player.name).join('\n ')}.`,
    );
    addSystemMessage(`You are ${humanPlayer.name}.`);
  }, [machinePlayers, humanPlayer]);

  const initGameState = (numberOfPlayers: number) => {
    let availableNames = [...names];
    const machinePlayersInit = Array.from({ length: numberOfPlayers }, (_) => {
      const name = sample(availableNames) ?? '';
      availableNames = availableNames.filter((n) => n !== name);
      return new Player(name!, Team.Machines, sample(personalities)?.name);
    });

    const humanName = sample(availableNames) ?? '';
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
      } catch (error) {
        addErrorMessage('An error occurred while processing the machine turn.');
        addErrorMessage((error as Error).message);
        nextPlayer();
      }
    }
  };

  const processPlayerAction = useCallback(async () => {
    const service = new OpenAiApiService();
    const prompt = createSystemPrompt(
      actingPlayer.name,
      playerNames(),
      personalities.find(
        (personality) => personality.name === actingPlayer.personality,
      )?.description!,
    );
    const logForLLM = formatLogForLLM(actingPlayer);
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
      const toolCallBody = safeParse(toolCall?.function.arguments!);
      const action = toolCall?.function.name;
      const actionType: ActionType = action as ActionType;
      addPlayerAction(
        actingPlayer,
        toolCallBody.content,
        actionType,
        toolCall.id,
      );

      if (actionType === ActionType.EndTurn) {
        return;
      }

      await processPlayerAction();
    } else if (message) {
      addPlayerAction(actingPlayer, message, ActionType.Speech);
    }
  }, [actingPlayer, messages]);

  return (
    <GameStateContext.Provider
      value={{
        machinePlayers,
        humanPlayer,
        actingPlayer,
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
