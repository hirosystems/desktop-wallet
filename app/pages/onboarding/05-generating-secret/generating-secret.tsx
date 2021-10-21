import React from 'react';
import { color, Flex, Spinner } from '@stacks/ui';

import { Onboarding, OnboardingTitle } from '@components/onboarding';
import { useBackButton } from '@hooks/use-back-url';

export const GeneratingSecret: React.FC = () => {
  useBackButton(null);
  return (
    <Onboarding>
      <Flex>
        <Spinner size="lg" color={color('brand')} mx="auto" />
      </Flex>
      <OnboardingTitle textStyle="display.small" fontWeight={500} fontSize="20px" mt="loose">
        Generating your Secret Key
      </OnboardingTitle>
    </Onboarding>
  );
};
