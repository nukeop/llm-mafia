import React from 'react';
import { Box, Text } from 'ink';
import { Player, Team } from '../game/Player';

type VoteProps = {
  player: Player;
  content: string;
  reason?: string;
};
export const Vote = ({ player, content, reason }: VoteProps) => {
  return (
    <Box
      width="100%"
      justifyContent="center"
      borderColor="magenta"
      borderStyle="single"
      flexDirection="column"
    >
      <Text backgroundColor="magenta" color="black">
        🗳️ *{player.name} has voted for {content}* 🗳️ {` `}
      </Text>
      {reason && (
        <Text backgroundColor="magenta" color="black">
          Reason: {reason}
        </Text>
      )}
    </Box>
  );
};
