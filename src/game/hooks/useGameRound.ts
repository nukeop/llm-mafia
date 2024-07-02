import { useEffect, useState } from 'react';
import { Player } from '../Player';

type Vote = {
  player: Player;
  target: Player;
};
export const useGameRound = ({
  machinePlayers,
  eliminateMachinePlayer,
  humanPlayer,
  addAnnouncerMessage,
}: {
  machinePlayers: Player[];
  eliminateMachinePlayer: (player: Player) => void;
  humanPlayer: Player;
  addAnnouncerMessage: (message: string) => void;
}) => {
  const [round, setRound] = useState(0);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [hasLost, setHasLost] = useState(false);
  const [hasWon, setHasWon] = useState(false);

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
      );

      const isTie =
        votesPerPlayer.filter(
          (player) => player.votes === mostVotedPlayer.votes,
        ).length > 1;

      if (!isTie) {
        addAnnouncerMessage(
          `All votes are in! Round ${round + 1} is over. ${mostVotedPlayer.player.name} has been eliminated!`,
        );
        addAnnouncerMessage(
          `That player was in team: [${mostVotedPlayer.player.team}]!`,
        );

        if (mostVotedPlayer.player === humanPlayer) {
          addAnnouncerMessage(
            'The human player has been eliminated! Machines win!',
          );
          setHasLost(true);
        } else {
          eliminateMachinePlayer(mostVotedPlayer.player);
          setRound(round + 1);
          resetVotes();

          if (machinePlayers.length === 2) {
            addAnnouncerMessage(
              'There are only two machines left! The human player wins!',
            );
            setHasWon(true);
          }
        }
      } else {
        addAnnouncerMessage(
          `All votes are in! Round ${round + 1} is over. It\'s a tie! No one is eliminated this round.`,
        );
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
    hasWon,
  };
};
