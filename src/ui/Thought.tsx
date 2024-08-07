import React from 'react';
import { Box, Text } from 'ink';
import { Player, Team } from '../game/Player';

type ThoughtProps = {
  player: Player;
  content: string;
};

export const Thought = ({ player, content }: ThoughtProps) => {
  return (
    <Box width="100%" justifyContent="center" flexDirection="column">
      <Text backgroundColor="blue" color="black">
        💭 *{player.name} thought something...* 💭
      </Text>
      <Text backgroundColor="blue" color="black">
        {content}
      </Text>
    </Box>
  );
};
