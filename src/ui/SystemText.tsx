import React from 'react';
import { Newline, Text } from 'ink';

type SystemTextProps = {
  content: string;
};

export const SystemText = ({ content }: SystemTextProps) => {
  return (
    <Text color="yellow">
      {content}
      <Newline />
    </Text>
  );
};
