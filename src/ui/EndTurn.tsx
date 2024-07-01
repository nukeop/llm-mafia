import React from 'react';
import { Box, Text } from 'ink';
import { Player } from '../game/Player';

type EndTurnProps = {
  player: Player;
};

export const EndTurn = ({ player }: EndTurnProps) => {
  return (
    <Box width="100%" justifyContent="center">
      <Text backgroundColor="green" color="black">
        ✅ *End of {player.name}'s turn* ✅
      </Text>
    </Box>
  );
};
