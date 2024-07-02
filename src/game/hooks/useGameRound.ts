import { useEffect, useState } from 'react';
import { Player } from '../Player';

type Vote = {
  player: Player;
  target: Player;
};
export const useGameRound = ({
  machinePlayers,
  setMachinePlayers,
  humanPlayer,
  addAnnouncerMessage,
}: {
  machinePlayers: Player[];
  setMachinePlayers: (players: Player[]) => void;
  humanPlayer: Player;
  addAnnouncerMessage: (message: string) => void;
}) => {
  const [round, setRound] = useState(0);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [hasLost, setHasLost] = useState(false);

  const addVote = (player: Player, target: Player) => {
    setVotes((prevState) => [...prevState, { player, target }]);
  };

  const resetVotes = () => {
    setVotes([]);
  };

  useEffect(() => {
    if (votes.length > 0 && votes.length === machinePlayers.length) {
      const allPlayers = [...machinePlayers, humanPlayer];
      const votesPerPlayer = allPlayers.map((player) => ({
        player,
        votes: votes.filter((vote) => vote.target === player).length,
      }));

      const mostVotedPlayer = votesPerPlayer.reduce((prev, current) =>
        prev.votes > current.votes ? prev : current,
      ).player;

      addAnnouncerMessage(
        `All votes are in! Round ${round + 1} is over. ${mostVotedPlayer.name} has been eliminated!`,
      );
      addAnnouncerMessage(
        `That player was in team: [${mostVotedPlayer.team}]!`,
      );

      if (mostVotedPlayer === humanPlayer) {
        addAnnouncerMessage(
          'The human player has been eliminated! Machines win!',
        );
        setHasLost(true);
      } else {
        setMachinePlayers(
          machinePlayers.filter((player) => player !== mostVotedPlayer),
        );
        setRound(round + 1);
        resetVotes();
      }
    }
  }, [votes]);

  return {
    round,
    votes,
    addVote,
    resetVotes,
    hasLost,
  };
};
