import { ActionType, GameLog, MessageType } from './GameLog';
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
    log.addPlayerAction(player, 'Hello, world!', ActionType.Speech);

    expect(log.messages).toEqual([
      {
        player: {
          name: 'Mr. Test',
          team: Team.Machines,
        },
        content: 'Hello, world!',
        type: MessageType.PlayerAction,
        actionType: ActionType.Speech,
      },
    ]);
  });

  it('formats the log for game end', () => {
    const log = new GameLog();
    const player = new Player('Mr. Test', Team.Machines);
    const anotherPlayer = new Player('Mr. Test 2', Team.Machines);
    const humanPlayer = new Player('Mr. Human', Team.Machines);

    log.addSystemMessage(
      'All messages are visible to all players at the end of the game',
    );
    log.addPlayerAction(player, 'Hello, world!', ActionType.Speech);
    log.addPlayerAction(player, 'This is what I think', ActionType.Thought);
    log.addPlayerAction(anotherPlayer, 'I too am a player', ActionType.Speech);
    log.addPlayerAction(anotherPlayer, 'And I think this', ActionType.Thought);
    log.addPlayerAction(humanPlayer, 'I am a human!', ActionType.Speech);
    log.addAnnouncerMessage('Announcements are visible to all players');

    expect(log.formatLogForGameEnd()).toEqual(
      '[System]: All messages are visible to all players at the end of the game\n[Mr. Test](Speech): Hello, world!\n[Mr. Test](Thought): This is what I think\n[Mr. Test 2](Speech): I too am a player\n[Mr. Test 2](Thought): And I think this\n[Mr. Human](Speech): I am a human!\n[Announcer]: Announcements are visible to all players',
    );
  });

  it('formats the log for the LLM API', () => {
    const log = new GameLog();
    const player = new Player('Mr. Test', Team.Machines);
    const anotherPlayer = new Player('Mr. Test 2', Team.Machines);

    log.addSystemMessage('This message will be ignored');
    log.addPlayerAction(player, 'Hello, world!', ActionType.Speech);
    log.addPlayerAction(
      player,
      'Thoughts are only visible for the player who thought them',
      ActionType.Thought,
    );
    log.addPlayerAction(anotherPlayer, 'I too am a player', ActionType.Speech);
    log.addSystemMessage('This message will also be ignored');
    log.addPlayerAction(
      anotherPlayer,
      'This thought will not be visible',
      ActionType.Thought,
    );
    log.addPlayerAction(player, 'Hello again!', ActionType.Speech);
    log.addAnnouncerMessage('Announcements are visible to all players');

    expect(log.formatLogForLLM(player)).toEqual([
      {
        role: 'assistant',
        content: '[Mr. Test]: Hello, world!',
      },
      {
        role: 'assistant',
        content:
          '[Mr. Test]: Thoughts are only visible for the player who thought them',
      },
      {
        role: 'user',
        content: '[Mr. Test 2]: I too am a player',
      },
      {
        role: 'assistant',
        content: '[Mr. Test]: Hello again!',
      },
      {
        role: 'user',
        content: '[Announcer}: Announcements are visible to all players',
      },
    ]);
  });
});
