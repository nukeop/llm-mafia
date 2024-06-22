import { Box } from 'ink';
import React from 'react';

type ContainerProps = {
  children: React.ReactNode;
};

export const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <Box padding={2} flexGrow={1} flexDirection="column">
      {children}
    </Box>
  );
};
