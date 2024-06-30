import {
  ActionType,
  GameLogProvider,
  MessageType,
  useGameLog,
} from './GameLogProvider';
import React, { ReactNode, act } from 'react';
import { Player, Team } from '../Player';
import { renderHook, waitFor } from '../../test-utils';

const wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
  <GameLogProvider>{children}</GameLogProvider>
);

describe('Game log provider', () => {
  it('adds system messages', async () => {
    const { result } = renderHook(() => useGameLog(), { wrapper });
    await waitFor(() => expect(result.current).toBeDefined());

    await act(async () => {
      result.current.addSystemMessage('Hello, world!');
    });
    await waitFor(() =>
      expect(result.current.messages).toEqual([
        {
          content: 'Hello, world!',
          type: MessageType.System,
        },
      ]),
    );
  });

  it('adds player messages', async () => {
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

  it('formats the log for LLM API', async () => {
    const { result } = renderHook(() => useGameLog(), { wrapper });
    await waitFor(() => expect(result.current).toBeDefined());
    const player = new Player('Mr. Test', Team.Machines);

    await act(async () => {
      result.current.addSystemMessage('This message will be ignored');
      result.current.addPlayerAction(
        player,
        'Hello, world!',
        ActionType.Speech,
        'speech-1',
      );
      result.current.addPlayerAction(
        player,
        'Thoughts are only visible to the player who thought them',
        ActionType.Thought,
        'thought-1',
      );
      result.current.addPlayerAction(
        { name: 'Mr. Test 2', team: Team.Machines },
        'I too am a player',
        ActionType.Speech,
        'speech-2',
      );
      result.current.addSystemMessage('This message will also be ignored');
      result.current.addPlayerAction(
        { name: 'Mr. Test 2', team: Team.Machines },
        'This thought will not be visible',
        ActionType.Thought,
        'thought-2',
      );
      result.current.addPlayerAction(
        player,
        'Hello again!',
        ActionType.Speech,
        'speech-3',
      );
      result.current.addAnnouncerMessage(
        'Announcements are visible to all players',
      );
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(8));

    expect(result.current.formatLogForLLM(player)).toEqual([
      {
        role: 'assistant',
        tool_calls: [
          {
            id: 'speech-1',
            type: 'function',
            function: {
              name: ActionType.Speech,
              arguments: '{"content":"Hello, world!"}',
            },
          },
        ],
      },
      {
        tool_call_id: 'speech-1',
        role: 'tool',
        content: 'Success',
      },
      {
        role: 'assistant',
        tool_calls: [
          {
            id: 'thought-1',
            type: 'function',
            function: {
              name: ActionType.Thought,
              arguments:
                '{"content":"Thoughts are only visible to the player who thought them"}',
            },
          },
        ],
      },
      {
        tool_call_id: 'thought-1',
        role: 'tool',
        content: 'Success',
      },
      {
        role: 'user',
        content: '[Mr. Test 2]: I too am a player',
      },
      {
        role: 'assistant',
        tool_calls: [
          {
            id: 'speech-3',
            type: 'function',
            function: {
              name: ActionType.Speech,
              arguments: '{"content":"Hello again!"}',
            },
          },
        ],
      },
      {
        tool_call_id: 'speech-3',
        role: 'tool',
        content: 'Success',
      },
      {
        role: 'user',
        content: '[Announcer}: Announcements are visible to all players',
      },
    ]);
  });
});
