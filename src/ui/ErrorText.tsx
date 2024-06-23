import { Newline, Text } from 'ink';
import React from 'react';

type ErrorTextProps = {
  content: string;
};

export const ErrorText = ({ content }: ErrorTextProps) => {
  return (
    <Text color="red">
      {content}
      <Newline />
    </Text>
  );
};
