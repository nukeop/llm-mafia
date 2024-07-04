import React from 'react';
import { Box, Text } from 'ink';
import { Player } from '../game/Player';

type EndTurnProps = {
  player: Player;
  reason?: string;
};

export const EndTurn = ({ player, reason }: EndTurnProps) => {
  return (
    <Box width="100%" justifyContent="center" flexDirection="column">
      <Text backgroundColor="green" color="black">
        ✅ *End of {player.name}'s turn* ✅
      </Text>
      <Text backgroundColor="green" color="black">
        Reason: {reason}
      </Text>
    </Box>
  );
};
