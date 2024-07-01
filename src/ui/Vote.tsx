import React from 'react';
import { Box, Text } from 'ink';
import { Player, Team } from '../game/Player';

type VoteProps = {
  player: Player;
  content: string;
};
export const Vote = ({ player, content }: VoteProps) => {
  return (
    <Box
      width="100%"
      justifyContent="center"
      borderColor="magenta"
      borderStyle="single"
    >
      <Text backgroundColor="magenta" color="magenta">
        🗳️ *{player.name} has voted for {content}* 🗳️ {` `}
      </Text>
    </Box>
  );
};
