import { render } from 'ink-testing-library';
import { ChatWindow } from './ChatWindow';
import React from 'react';
import { ActionType, MessageType } from '../game/providers/GameLogProvider';
import { Player, Team } from '../game/Player';

describe('Chat window', () => {
  it('renders an empty chat window', () => {
    const t = render(<ChatWindow messages={[]} />);
    expect(t.lastFrame()).toMatchSnapshot();
  });

  it('renders a chat window with messages', async () => {
    const player = new Player('Mr. Test', Team.Machines);

    const messages = [
      {
        content: 'Announcement',
        type: MessageType.Announcer,
      } as const,
      {
        player,
        content: 'Hello, world!',
        type: MessageType.PlayerAction,
        actionType: ActionType.Speech,
      } as const,
      { content: 'Error', type: MessageType.Error } as const,
      { content: 'System message', type: MessageType.System } as const,
    ];

    const t = render(<ChatWindow messages={messages} />);

    expect(t.lastFrame()).toMatchSnapshot();
  });
});
