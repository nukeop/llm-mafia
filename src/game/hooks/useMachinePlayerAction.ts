import { act, useCallback, useState } from 'react';
import { Player } from '../Player';
import { OpenAiApiService } from '../../services/OpenAiService';
import { createSystemPrompt } from '../../prompts';
import { personalities } from '../../prompts/personalities';
import { tools } from '../../prompts/tools';
import Logger from '../../logger';
import { safeParse } from '../../json-utils';
import { ActionType, useGameLog } from '../providers/GameLogProvider';

export const useMachinePlayerAction = ({
  actingPlayer,
  playerNames,
  players,
  addVote,
}: {
  actingPlayer: Player;
  playerNames: string[];
  players: Player[];
  addVote: (player: Player, target: Player) => void;
}) => {
  const { messages, addPlayerAction, formatLogForLLM } = useGameLog();
  const [isLoading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastAction, setLastAction] = useState('');

  const processPlayerAction = useCallback(async () => {
    const service = new OpenAiApiService();
    const prompt = createSystemPrompt(
      actingPlayer.name,
      playerNames,
      personalities.find(
        (personality) => personality.name === actingPlayer.personality,
      )?.description!,
    );
    const logForLLM = formatLogForLLM(actingPlayer);

    const response = await service.createChatCompletion({
      max_tokens: 512,
      model: 'gpt-4o',
      tools,
      parallel_tool_calls: false,
      messages: [{ role: 'system', content: prompt }, ...logForLLM],
    });

    const choice = response.choices[0];
    Logger.debug(JSON.stringify(choice, null, 2));
    const toolCall = choice.message?.tool_calls?.[0];
    const message = choice.message?.content;

    if (toolCall) {
      const toolCallBody = safeParse(toolCall?.function.arguments!);
      const action = toolCall?.function.name;
      const actionType: ActionType = action as ActionType;
      addPlayerAction(
        actingPlayer,
        toolCallBody.content,
        actionType,
        toolCall.id,
      );

      if (actionType === ActionType.Vote) {
        const target = players.find(
          (player) => player.name === toolCallBody.content,
        )!;
        addVote(actingPlayer, target);
      }

      setLastAction(actionType);

      return actionType;
    } else if (message) {
      addPlayerAction(actingPlayer, message, ActionType.Speech);
    }
  }, [actingPlayer, messages]);

  return { processPlayerAction, isLoading, hasError, errorMessage, lastAction };
};
