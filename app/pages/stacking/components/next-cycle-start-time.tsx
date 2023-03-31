import { ClockIcon } from '@components/icons/clock';
import { color, Flex, FlexProps, Text } from '@stacks/ui';
import React, { FC } from 'react';

interface NextCycleStartTimeProps extends FlexProps {
  nextCycleStartsIn: string;
}

export const NextCycleStartTime: FC<NextCycleStartTimeProps> = props => {
  const { nextCycleStartsIn, ...rest } = props;
  return (
    <Flex {...rest}>
      <Flex
        width="44px"
        height="44px"
        background={color('bg-4')}
        borderRadius="50%"
        alignItems="center"
        justifyContent="center"
      >
        <ClockIcon size="14px" />
      </Flex>
      <Flex ml="base" flexDirection="column">
        <Text as="h4" display="block" textStyle="body.large.medium" lineHeight="20px">
          Next cycle starts in
        </Text>
        <Text
          display="block"
          textStyle="body.large"
          color={color('text-caption')}
          lineHeight="20px"
          mt="extra-tight"
        >
          {nextCycleStartsIn}
        </Text>
      </Flex>
    </Flex>
  );
};
