import {
  ActionType,
  GameLogProvider,
  MessageType,
  useGameLog,
} from './GameLogProvider';
import React, { ReactNode, act } from 'react';
import { Team } from '../Player';
import { renderHook, waitFor } from '../../test-utils';

const wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
  <GameLogProvider>{children}</GameLogProvider>
);

describe('Game log provider', () => {
  it('should store logs', async () => {
    const { result } = renderHook(() => useGameLog(), { wrapper });

    await waitFor(() => expect(result.current).toBeDefined());

    await act(async () => {
      result.current.addPlayerAction(
        { name: 'Player 1', team: Team.Humans },
        'Hello, world!',
        ActionType.Speech,
      );
    });

    await waitFor(() =>
      expect(result.current.messages).toEqual([
        {
          player: { name: 'Player 1', team: Team.Humans },
          content: 'Hello, world!',
          callId: undefined,
          actionType: ActionType.Speech,
          type: MessageType.PlayerAction,
        },
      ]),
    );
  });
});
