import { GameLog } from './GameLog';
import { Player, Team } from './Player';

describe('Game log', () => {
  it('adds system messages', () => {
    const log = new GameLog();
    log.addSystemMessage('Hello, world!');

    expect(log.messages).toEqual([
      {
        type: 'system',
        content: 'Hello, world!',
      },
    ]);
  });

  it('adds player messages', () => {
    const log = new GameLog();
    const player = new Player('Mr. Test', Team.Machines);
    log.addPlayerAction(player, false, 'Hello, world!');

    expect(log.messages).toEqual([
      {
        type: 'player',
        player: {
          name: 'Mr. Test',
          team: Team.Machines,
        },
        thought: false,
        content: 'Hello, world!',
      },
    ]);
  });

  it('formats the log for the LLM API', () => {
    const log = new GameLog();
    const player = new Player('Mr. Test', Team.Machines);
    const anotherPlayer = new Player('Mr. Test 2', Team.Machines);

    log.addSystemMessage('This message will be ignored');
    log.addPlayerAction(player, false, 'Hello, world!');
    log.addPlayerAction(anotherPlayer, true, 'I too am a player');
    log.addSystemMessage('This message will also be ignored');
    log.addPlayerAction(player, false, 'Hello again!');

    expect(log.formatLogForLLM(player)).toEqual([
      {
        role: 'assistant',
        content: '[Mr. Test]: Hello, world!',
      },
      {
        role: 'user',
        content: '[Mr. Test 2]: I too am a player',
      },
      {
        role: 'assistant',
        content: '[Mr. Test]: Hello again!',
      },
    ]);
  });
});
