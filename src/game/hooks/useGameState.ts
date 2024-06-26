import { useState } from 'react';
import { GameState, initGameState } from '../GameState';

export const useGameState = (numberOfPlayers: number): GameState => {
  const [gameState] = useState(initGameState(numberOfPlayers));

  return gameState;
};

export const useGameLog = () => {};
