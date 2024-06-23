import React from 'react';
import { Text } from 'ink';
import { Player, Team } from '../game/Player';

type PlayerTextProps = {
  player: Player;
  content: string;
};
export const PlayerText = ({ player, content }: PlayerTextProps) => {
  return (
    <>
      <Text color={player.team === Team.Machines ? 'green' : 'blue'}>
        [{player.name}]: <Text color="white">{content}</Text>
      </Text>
    </>
  );
};
