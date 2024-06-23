import OpenAI from 'openai';
import {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
} from 'openai/resources';
import { retryWithExponentialBackoff } from '../async-utils';
import Logger from '../logger';

export class OpenAiApiService {
  #client: OpenAI;

  constructor() {
    this.#client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createChatCompletion(
    createChatCompletionRequest: ChatCompletionCreateParamsNonStreaming,
  ): Promise<ChatCompletion> {
    return await retryWithExponentialBackoff(() => ({
      execute: () =>
        this.#client.chat.completions.create({
          ...createChatCompletionRequest,
          stream: false,
        }),
      onError: (error) => {
        Logger.error(`Error creating chat completion: ${error.message}`);
      },
    }));
  }
}
