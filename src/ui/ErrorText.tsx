import { Box, Newline, Text } from 'ink';
import React from 'react';

type ErrorTextProps = {
  content: string;
};

export const ErrorText = ({ content }: ErrorTextProps) => {
  return (
    <Box
      width="100%"
      justifyContent="center"
      paddingY={1}
      borderStyle="double"
      borderColor="red"
    >
      <Text color="red" backgroundColor="black" bold>
        {`  🚨  `}
        {content}
        {`  🚨  `}
      </Text>
    </Box>
  );
};
