import { Box, Spacer, Text } from 'ink';
import React from 'react';

type AnnouncementProps = {
  content: string;
};

export const Announcement = ({ content }: AnnouncementProps) => {
  return (
    <Box width="100%" flexDirection="row">
      <Spacer />
      <Text backgroundColor="yellow" color="yellow">
        📣 {` `} {content} 📣 {` `}
      </Text>
      <Spacer />
    </Box>
  );
};
