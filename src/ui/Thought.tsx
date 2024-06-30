import React from 'react';
import { Box, Text } from 'ink';
import { Player, Team } from '../game/Player';

type ThoughtProps = {
  player: Player;
  content: string;
};

export const Thought = ({ player, content }: ThoughtProps) => {
  return (
    <Box width="100%">
      <Text backgroundColor="blue" color="blueBright">
        [{player.name}] thought something...
      </Text>
    </Box>
  );
};
