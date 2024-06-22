import { initGameState } from './GameState';
import { Team } from './Player';

describe('Game state', () => {
  it('initializes the game with the selected number of players', () => {
    const state = initGameState(3);
    expect(state.machinePlayers).toHaveLength(3);
    expect(state.humanPlayer.team).toBe(Team.Humans);
  });

  it('proceeds to the next player', () => {
    const state = initGameState(3);
    const stage = state.stage;
    stage.connectGameState(state);
    expect(stage.actingPlayer).toBe(state.machinePlayers[0]);
    expect(stage.nextPlayer()).toBe(state.machinePlayers[1]);
    expect(stage.nextPlayer()).toBe(state.machinePlayers[2]);
    expect(stage.nextPlayer()).toBe(state.humanPlayer);
    expect(stage.nextPlayer()).toBe(state.machinePlayers[0]);
  });
});
