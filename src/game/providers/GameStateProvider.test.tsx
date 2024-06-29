import React, { act, useEffect } from 'react';

import { GameStateProvider, useGameState } from './GameStateProvider';
import { Player, Team } from '../Player';
import { openAiMock, renderHook, waitFor } from '../../test-utils';
import { GameLogProvider } from './GameLogProvider';
import { fill } from 'lodash';

jest.mock('openai');

const GameInitializer = () => {
  const { initGameState } = useGameState();
  useEffect(() => {
    initGameState(3);
  }, []);
  return null;
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GameLogProvider>
    <GameStateProvider>
      <>
        <GameInitializer />
        {children}
      </>
    </GameStateProvider>
  </GameLogProvider>
);

describe('GameStateProvider', () => {
  beforeAll(async () => {
    const openAiModule = (await import('openai')) as unknown as jest.Mock;
    openAiModule.mockImplementation(() => openAiMock.getMockImplementation());
  });

  it('provides game state context with initialized values', async () => {
    const { result } = renderHook(() => useGameState(), { wrapper });
    await waitFor(() => expect(result.current).toBeDefined());

    expect(result.current.machinePlayers).toEqual(
      fill(Array(3), expect.any(Player)),
    );
    expect(result.current.humanPlayer).toEqual(expect.any(Player));

    expect(result.current.machinePlayers.map((player) => player.team)).toEqual(
      fill(Array(3), Team.Machines),
    );
    expect(result.current.humanPlayer.team).toEqual(Team.Humans);

    expect(result.current.actingPlayer).toEqual(
      result.current.machinePlayers[0],
    );
  });

  it('allows advancing game state', async () => {
    const { result } = renderHook(() => useGameState(), { wrapper });
    openAiMock.setResponses([
      {
        content: '',
        role: 'assistant',
        tool_calls: [
          {
            id: '1',
            type: 'function',
            function: {
              name: 'end_turn',
              arguments: '{}',
            },
          },
        ],
      },
    ]);
    await waitFor(() => expect(result.current).toBeDefined());

    expect(result.current.actingPlayer).toEqual(
      result.current.machinePlayers[0],
    );

    await act(async () => {
      await result.current.advance();
    });

    await waitFor(() =>
      expect(result.current.actingPlayer).toEqual(
        result.current.machinePlayers[1],
      ),
    );
  });
});
