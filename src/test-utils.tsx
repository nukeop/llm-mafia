import { render } from 'ink-testing-library';
import { ChatCompletionMessage } from 'openai/resources';
import React, { useEffect } from 'react';
import { act } from 'react';
import { ActionType } from './game/providers/GameLogProvider';

type Hook<T> = () => T;

type RenderHookOptions = {
  wrapper?: React.ComponentType<any>;
};

function HookWrapper<T>({
  hook,
  setResult,
}: {
  hook: Hook<T>;
  setResult: (result: T) => void;
}) {
  const result = hook();
  useEffect(() => {
    setResult(result);
  }, [result, setResult]);

  return null;
}

export function renderHook<T>(hook: Hook<T>, options: RenderHookOptions = {}) {
  let hookResult: T;
  const setResult = (result: T) => {
    hookResult = result;
  };

  const TestComponent = () => <HookWrapper hook={hook} setResult={setResult} />;

  const WrapperComponent = options.wrapper || React.Fragment;

  const WrappedComponent = () => (
    <WrapperComponent>
      <TestComponent />
    </WrapperComponent>
  );

  const { rerender, unmount } = render(<WrappedComponent />);

  return {
    result: {
      get current() {
        return hookResult;
      },
    },
    rerender: () => {
      act(() => {
        rerender(<WrappedComponent />);
      });
    },
    unmount: () => {
      act(() => {
        unmount();
      });
    },
  };
}

export async function waitFor(
  condition: () => void,
  timeout: number = 4500,
  interval: number = 50,
): Promise<void> {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const checkCondition = () => {
      try {
        condition();
        resolve();
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          reject(new Error(`waitFor timed out: ${(error as Error).message}`));
        } else {
          setTimeout(checkCondition, interval);
        }
      }
    };
    checkCondition();
  });
}

class OpenAiMock {
  private responses: ChatCompletionMessage[] = [];

  setResponses(responses: ChatCompletionMessage[]) {
    this.responses = responses;
  }

  addToolUse(name: ActionType, args?: string) {
    this.responses.push({
      content: '',
      role: 'assistant',
      tool_calls: [
        {
          id: '1',
          type: 'function',
          function: {
            name,
            arguments: args ?? '{}',
          },
        },
      ],
    });
  }

  getMockImplementation() {
    return {
      chat: {
        completions: {
          create: jest.fn().mockImplementation(() =>
            Promise.resolve({
              choices: this.responses.map((message) => ({ message })),
            }),
          ),
        },
      },
    };
  }
}

export const openAiMock = new OpenAiMock();
