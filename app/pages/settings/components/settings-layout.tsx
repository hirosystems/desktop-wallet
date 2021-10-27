import React, { FC } from 'react';
import { Box, Text } from '@stacks/ui';

import { Screen } from '@components/screen';

export const SettingsLayout: FC = ({ children }) => (
  <Screen>
    <Box mt="68px" pb="84px">
      <Text as="h1" textStyle="display.large" fontSize="32px" display="block">
        Settings
      </Text>
      {children}
    </Box>
  </Screen>
);

export const SettingDescription: FC = ({ children }) => (
  <Text as="h3" textStyle="body.large" mt="tight" display="block">
    {children}
  </Text>
);
