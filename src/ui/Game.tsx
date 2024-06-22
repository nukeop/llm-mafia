import { useApp, useInput } from 'ink';
import { Container } from './Container';
import { GameState } from '../game/GameState';
import React from 'react';
import { PlayerText } from './PlayerText';

type GameProps = {
  gameState: GameState;
};
export const Game: React.FC<GameProps> = ({ gameState }) => {
  const { exit } = useApp();
  useInput((input, key) => {
    if (input === 'q') {
      exit();
    }
  });

  return (
    <Container>
      {gameState.machinePlayers.map((player) => (
        <PlayerText key={player.name} name={player.name} text="test" />
      ))}
      <PlayerText name="test" text="test" />
    </Container>
  );
};
