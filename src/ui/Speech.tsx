import React from 'react';
import { Text } from 'ink';
import { Player, Team } from '../game/Player';

type SpeechProps = {
  player: Player;
  content: string;
};
export const Speech = ({ player, content }: SpeechProps) => {
  return (
    <>
      <Text color={player.team === Team.Machines ? 'green' : 'blue'}>
        [{player.name}]: <Text color="white">{content}</Text>
      </Text>
    </>
  );
};
