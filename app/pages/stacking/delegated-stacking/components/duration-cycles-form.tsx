import { CircleButton } from '@components/circle-button';
import { MAX_STACKING_CYCLES, MIN_STACKING_CYCLES } from '@constants/index';
import { Flex, InputProps, Text, Box, color } from '@stacks/ui';
import { RootState } from '@store/index';
import { selectNextCycleInfo } from '@store/stacking';
import { decrement, increment } from '@utils/mutate-numbers';
import { formatCycles } from '@utils/stacking';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import React, { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

dayjs.extend(duration);
dayjs.extend(updateLocale);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

interface DurationCycleFromProps extends Omit<InputProps, 'form'> {
  duration: number | null;
  onUpdate(duration: number): void;
}

const createCycleArray = () => new Array(12).fill(null).map((_, i) => i + 1);
const durationWithDefault = (duration: number | null) => duration ?? 1;

export const DurationCyclesForm: FC<DurationCycleFromProps> = props => {
  const { duration, onUpdate } = props;

  const { cycleInfo } = useSelector((state: RootState) => ({
    cycleInfo: selectNextCycleInfo(state),
  }));

  const cycleLabels = useMemo(() => {
    if (!cycleInfo) return [];
    return createCycleArray().map(cycles => {
      return `
        ${formatCycles(cycles)}
        (ends around ${dayjs()
          .add(cycleInfo.estimateCycleDurationSeconds * cycles, 'seconds')
          .format('Do MMMM')})`;
    });
  }, [cycleInfo]);

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      mt="base"
      padding="8px"
      boxShadow="low"
      border={`1px solid ${color('border')}`}
      borderRadius="8px"
      onClick={e => (e.stopPropagation(), e.preventDefault())}
      position="relative"
      zIndex={10}
    >
      <Text alignItems="center" ml="tight" color={color('text-title')}>
        {cycleLabels[durationWithDefault(duration) - 1]}
      </Text>
      <Box>
        <CircleButton
          onClick={e => {
            e.stopPropagation();
            onUpdate(Math.max(MIN_STACKING_CYCLES, decrement(durationWithDefault(duration))));
          }}
        >
          -
        </CircleButton>
        <CircleButton
          ml={[null, 'extra-tight']}
          onClick={e => {
            e.stopPropagation();
            onUpdate(Math.min(MAX_STACKING_CYCLES, increment(durationWithDefault(duration))));
          }}
        >
          +
        </CircleButton>
      </Box>
    </Flex>
  );
};
