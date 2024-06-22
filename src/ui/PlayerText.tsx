import React from 'react';
import { Text } from 'ink';

type PlayerTextProps = {
  name: string;
  text: string;
};
export const PlayerText = ({ name, text }: PlayerTextProps) => {
  return (
    <>
      <Text color="green">
        [{name}]: <Text color="white">{text}</Text>
      </Text>
    </>
  );
};
