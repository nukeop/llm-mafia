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
    log.addPlayerMessage(player, false, 'Hello, world!');

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
});
