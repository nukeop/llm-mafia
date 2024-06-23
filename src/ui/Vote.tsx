import React from 'react';
import { Text } from 'ink';
import { Player, Team } from '../game/Player';

type VoteProps = {
  player: Player;
  content: string;
};
export const Vote = ({ player, content }: VoteProps) => {
  return (
    <Text color="red">
      *{player.name} has voted for {content}*
    </Text>
  );
};
