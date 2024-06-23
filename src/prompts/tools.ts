import { ChatCompletionTool } from 'openai/resources';

export const tools: ChatCompletionTool[] = [
  {
    function: {
      name: 'thought',
      description: "Think a private thought that's only visible to you.",
      parameters: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'The thought you want to think.',
          },
        },
        required: ['content'],
      },
    },
    type: 'function',
  },
  {
    function: {
      name: 'speech',
      description: 'Say something out loud. All players will see this message.',
      parameters: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'The message you want to say.',
          },
        },
        required: ['content'],
      },
    },
    type: 'function',
  },
  {
    function: {
      name: 'vote',
      description:
        "Vote for a player to be eliminated. Vote whenever you're ready. When all the players have finished voting, the player with the most votes is eliminated, and the round is over. That player's team will be revealed, and if it's a human, the machines win. The game continues until the human is eliminated, or only one machine remains.",
      parameters: {
        type: 'object',
        properties: {
          player: {
            type: 'string',
            description: 'The name of the player you want to vote for.',
          },
        },
        required: ['player'],
      },
    },
    type: 'function',
  },
  {
    function: {
      name: 'end_turn',
      description: 'End your turn. The game will proceed to the next player.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    type: 'function',
  },
];
