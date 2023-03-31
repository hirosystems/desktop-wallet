import { Text, BoxProps } from '@stacks/ui';
import React, { FC } from 'react';

export const StackingDescription: FC<BoxProps> = ({ children, ...props }) => (
  <Text textStyle="body.large" display="block" {...props}>
    {children}
  </Text>
);
