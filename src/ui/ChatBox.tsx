import { Box, Text, useInput } from 'ink';
import React, { useState } from 'react';

type ChatBoxProps = {
  onSend: (message: string) => void;
};

export const ChatBox: React.FC<ChatBoxProps> = ({ onSend }) => {
  const [playerInput, setPlayerInput] = useState<string>('');
  useInput((input, key) => {
    if (key.upArrow || key.downArrow) {
      return;
    }

    if (key.backspace || key.delete) {
      setPlayerInput((prev) => prev.slice(0, -1));
    }

    if (key.return) {
      onSend(playerInput);
      setPlayerInput('');
    }

    if (input) {
      setPlayerInput((prev) => prev + input);
    }
  });
  return (
    <Box borderStyle="round" borderColor="green">
      <>
        <Text color="whiteBright">{'> '}</Text>
        <Text>{playerInput}</Text>
      </>
    </Box>
  );
};
