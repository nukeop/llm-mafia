import { useEffect, useState } from 'react';
import { Player } from '../Player';
import { useGameLog } from '../providers/GameLogProvider';
import { useGameState } from '../providers/GameStateProvider';

type Vote = {
  player: Player;
  target: Player;
};
export const useGameRound = ({
  setMachinePlayers,
}: {
  setMachinePlayers: (players: Player[]) => void;
}) => {
  const { addAnnouncerMessage } = useGameLog();
  const { machinePlayers } = useGameState();
  const [round, setRound] = useState(0);
  const [votes, setVotes] = useState<Vote[]>([]);

  const addVote = (player: Player, target: Player) => {
    setVotes([...votes, { player, target }]);
  };

  const resetVotes = () => {
    setVotes([]);
  };

  useEffect(() => {
    if (votes.length === machinePlayers.length) {
      const mostVotedPlayer = machinePlayers.reduce(
        (acc, player) => {
          const votesForPlayer = votes.filter((vote) => vote.target === player);
          return votesForPlayer.length > acc.votes
            ? { player, votes: votesForPlayer.length }
            : acc;
        },
        { player: machinePlayers[0], votes: 0 },
      ).player;
      addAnnouncerMessage(
        `All votes are in! Round ${round + 1} is over. ${mostVotedPlayer.name} has been eliminated!`,
      );
      addAnnouncerMessage(`That player was a ${mostVotedPlayer.team}!`);

      setMachinePlayers(
        machinePlayers.filter((player) => player !== mostVotedPlayer),
      );
      setRound(round + 1);
      resetVotes();
    }
  }, [votes]);

  return {
    round,
    votes,
    addVote,
    resetVotes,
  };
};
