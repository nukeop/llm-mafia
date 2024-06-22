import { GameState } from './GameState';
import { Player } from './Player';

export class GameStage {
  #gameState?: GameState;
  #actingPlayer: Player;

  constructor(actingPlayer: Player) {
    this.#actingPlayer = actingPlayer;
  }

  connectGameState(gameState: GameState): void {
    this.#gameState = gameState;
  }

  get actingPlayer(): Player {
    return this.#actingPlayer;
  }

  /**
   * Proceed to the next player.
   * If the current player is the last machine player, the next player is the human player.
   * @returns The next player.
   * @throws Error if GameStage is not connected to GameState.
   */
  nextPlayer(): Player {
    if (!this.#gameState)
      throw new Error('GameStage not connected to GameState');

    if (this.#actingPlayer === this.#gameState.humanPlayer) {
      this.#actingPlayer = this.#gameState.machinePlayers[0];
    } else {
      const machinePlayers = this.#gameState.machinePlayers;
      const currentPlayerIndex = machinePlayers.findIndex(
        (player) => player === this.#actingPlayer,
      );

      if (currentPlayerIndex === machinePlayers.length - 1) {
        this.#actingPlayer = this.#gameState.humanPlayer;
      } else {
        const nextPlayerIndex = currentPlayerIndex + 1;
        this.#actingPlayer = machinePlayers[nextPlayerIndex];
      }
    }

    return this.#actingPlayer;
  }
}
