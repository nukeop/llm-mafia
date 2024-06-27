import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { GameStateProvider, useGameState } from './GameStateProvider';
import { Player, Team } from '../Player';
import { GameLog, ActionType } from '../GameLog';
import { GameStage } from '../GameStage';

describe('GameStateProvider', () => {
  it('provides game state context with initial values', () => {
    const wrapper = ({ children }) => <GameStateProvider>{children}</GameStateProvider>;
    const { result } = renderHook(() => useGameState(), { wrapper });

    expect(result.current.machinePlayers).toEqual([]);
    expect(result.current.humanPlayer).toEqual(new Player('', Team.Humans));
    expect(result.current.log).toBeInstanceOf(GameLog);
    expect(result.current.stage).toBeInstanceOf(GameStage);
  });

  it('allows advancing game state', async () => {
    const wrapper = ({ children }) => <GameStateProvider>{children}</GameStateProvider>;
    const { result } = renderHook(() => useGameState(), { wrapper });

    await act(async () => {
      await result.current.advance();
    });

    expect(result.current.stage.actingPlayer).not.toEqual(new Player('', Team.Machines));
  });

  it('processes player actions', async () => {
    const wrapper = ({ children }) => <GameStateProvider>{children}</GameStateProvider>;
    const { result } = renderHook(() => useGameState(), { wrapper });

    await act(async () => {
      await result.current.processPlayerAction();
    });

    expect(result.current.log.messages.length).toBeGreaterThan(0);
    expect(result.current.log.messages[0].actionType).toBe(ActionType.Speech);
  });
});