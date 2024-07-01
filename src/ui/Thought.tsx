import React from 'react';
import { Box, Text } from 'ink';
import { Player, Team } from '../game/Player';

type ThoughtProps = {
  player: Player;
  content: string;
};

export const Thought = ({ player, content }: ThoughtProps) => {
  return (
    <Box width="100%" justifyContent="center" paddingY={1}>
      <Text backgroundColor="blue" color="blue">
        💭 *{player.name} thought something...* 💭{` `}
      </Text>
    </Box>
  );
};
