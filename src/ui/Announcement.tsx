import { Box, Spacer, Text } from 'ink';
import React from 'react';

type AnnouncementProps = {
  content: string;
};

export const Announcement = ({ content }: AnnouncementProps) => {
  return (
    <Box width="100%" justifyContent="center">
      <Text backgroundColor="yellow" color="black">
        📣 {` `} {content} 📣
      </Text>
    </Box>
  );
};
