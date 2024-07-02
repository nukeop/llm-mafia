import { Player, Team } from '../Player';
import { useGameRound } from './useGameRound';
import { renderHook, waitFor } from '../../test-utils';

describe('Use game round hook', () => {
  it('keeps track of votes', async () => {
    const player1 = new Player('Mr. Red', Team.Machines);
    const player2 = new Player('Mr. Green', Team.Machines);
    const player3 = new Player('Mr. Blue', Team.Machines);
    const player4 = new Player('Mr. Pink', Team.Machines);
    const player5 = new Player('Mr. Violet', Team.Machines);
    const humanPlayer = new Player('Mr. Human', Team.Humans);
    const addAnnouncerMessage = jest.fn();

    const { result } = renderHook(() =>
      useGameRound({
        machinePlayers: [player1, player2, player3, player4, player5],
        setMachinePlayers: jest.fn(),
        humanPlayer,
        addAnnouncerMessage,
      }),
    );
    await waitFor(() => expect(result.current).toBeDefined());

    result.current.addVote(player1, player2);
    result.current.addVote(player2, player3);
    result.current.addVote(player3, player3);
    result.current.addVote(player4, player3);
    await waitFor(() => expect(result.current.votes).toHaveLength(4));
    await waitFor(() =>
      expect(result.current.votes).toEqual([
        { player: player1, target: player2 },
        { player: player2, target: player3 },
        { player: player3, target: player3 },
        { player: player4, target: player3 },
      ]),
    );
    result.current.addVote(player5, player2);
    // Round ends
    await waitFor(() => expect(result.current.votes).toHaveLength(0));

    expect(addAnnouncerMessage).toHaveBeenNthCalledWith(
      1,
      'All votes are in! Round 1 is over. Mr. Blue has been eliminated!',
    );
    expect(addAnnouncerMessage).toHaveBeenNthCalledWith(
      2,
      'That player was in team: [Machines]!',
    );
  });

  it('ends the game if the human is eliminated', async () => {
    const player1 = new Player('Mr. Red', Team.Machines);
    const player2 = new Player('Mr. Green', Team.Machines);
    const humanPlayer = new Player('Mr. Human', Team.Humans);
    const addAnnouncerMessage = jest.fn();

    const { result } = renderHook(() =>
      useGameRound({
        machinePlayers: [player1, player2],
        setMachinePlayers: jest.fn(),
        humanPlayer,
        addAnnouncerMessage,
      }),
    );
    await waitFor(() => expect(result.current).toBeDefined());

    result.current.addVote(player1, humanPlayer);
    result.current.addVote(player2, humanPlayer);
    await waitFor(() =>
      expect(result.current.votes).toEqual([
        { player: player1, target: humanPlayer },
        { player: player2, target: humanPlayer },
      ]),
    );
    await waitFor(() => expect(result.current.hasLost).toBe(true));

    expect(addAnnouncerMessage).toHaveBeenNthCalledWith(
      1,
      'All votes are in! Round 1 is over. Mr. Human has been eliminated!',
    );
    expect(addAnnouncerMessage).toHaveBeenNthCalledWith(
      2,
      'That player was in team: [Humans]!',
    );
  });
});
