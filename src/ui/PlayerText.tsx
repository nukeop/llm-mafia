import React from 'react';
import { Text } from 'ink';

type PlayerTextProps = {
  name: string;
  content: string;
};
export const PlayerText = ({ name, content }: PlayerTextProps) => {
  return (
    <>
      <Text color="green">
        [{name}]: <Text color="white">{content}</Text>
      </Text>
    </>
  );
};
