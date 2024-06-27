import { render } from 'ink-testing-library';
import { ChatWindow } from './ChatWindow';
import React from 'react';
import { ActionType, GameLog } from '../game/providers/GameLogProvider';
import { Player, Team } from '../game/Player';

describe('Chat window', () => {
  it('renders an empty chat window', () => {
    const t = render(<ChatWindow linesToShow={10} messages={[]} />);
    expect(t.lastFrame()).toMatchSnapshot();
  });

  it('renders a chat window with messages', () => {
    const log = new GameLog();
    const player = new Player('Mr. Test', Team.Machines);
    log.addAnnouncerMessage('Announcement');
    log.addPlayerAction(player, 'Hello, world!', ActionType.Speech);
    log.addErrorMessage('Error');
    log.addSystemMessage('System message');
    const t = render(<ChatWindow linesToShow={10} messages={log.messages} />);
    expect(t.lastFrame()).toMatchSnapshot();
  });
});
