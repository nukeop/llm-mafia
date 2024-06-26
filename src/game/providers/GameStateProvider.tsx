import React, { ReactElement, createContext, useContext } from 'react';
import { GameState } from '../GameState';

let Context = createContext<GameState | null>(null);
Context.displayName = 'GameStateContext';

export function useGameState() {
  let context = useContext(Context);
  if (context === null) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}

interface Props {
  value: GameState;
  children: React.ReactNode;
}

export function GameStateProvider({ value, children }: Props): ReactElement {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
