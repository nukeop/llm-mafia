import React, { createContext, useContext, useEffect, useState } from 'react';
import { Player, Team } from '../Player';
import { sample } from 'lodash';
import { ActionType, useGameLog } from './GameLogProvider';
import Logger from '../../logger';
import { names } from '../../prompts/names';
import { personalities } from '../../prompts/personalities';
import { useMachinePlayerAction } from '../hooks/useMachinePlayerAction';

interface GameStateContextType {
  machinePlayers: Player[];
  humanPlayer: Player;
  actingPlayer: Player;
  initGameState: (numberOfPlayers: number) => void;
  advance: () => Promise<void>;
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
  const { addSystemMessage, addErrorMessage } = useGameLog();

  const playerNames = (): string[] => {
    return [humanPlayer, ...machinePlayers].map((player) => player.name);
  };

  const { processPlayerAction } = useMachinePlayerAction({
    actingPlayer,
    playerNames: playerNames(),
  });

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
        const action = await processPlayerAction();

        if (action === ActionType.EndTurn) {
          nextPlayer();
        }
      } catch (error) {
        addErrorMessage('An error occurred while processing the machine turn.');
        addErrorMessage((error as Error).message);
        nextPlayer();
      }
    }
  };

  return (
    <GameStateContext.Provider
      value={{
        machinePlayers,
        humanPlayer,
        actingPlayer,
        initGameState,
        advance,
        isHumanTurn,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};
