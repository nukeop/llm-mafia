import React from 'react';
import { Box, Text } from 'ink';
import { Player, Team } from '../game/Player';

type VoteProps = {
  player: Player;
  content: string;
};
export const Vote = ({ player, content }: VoteProps) => {
  return (
    <Box width="100%">
      <Text backgroundColor="red" color="redBright">
        *{player.name} has voted for {content}*
      </Text>
    </Box>
  );
};
