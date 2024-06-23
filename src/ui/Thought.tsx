import React from 'react';
import { Text } from 'ink';
import { Player, Team } from '../game/Player';

type ThoughtProps = {
  player: Player;
  content: string;
};

export const Thought = ({ player, content }: ThoughtProps) => {
  return (
    <>
      <Text backgroundColor="blueBright" color="blue">
        [{player.name}] thought something...
      </Text>
    </>
  );
};
