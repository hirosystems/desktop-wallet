import { IconButton, IconButtonProps, useColorMode } from '@stacks/ui';
import { IconSun, IconSunOff } from '@tabler/icons';
import React, { forwardRef, Ref } from 'react';

export const ColorModeButton = forwardRef(
  (props: Omit<IconButtonProps, 'icon'>, ref: Ref<HTMLDivElement>) => {
    const { colorMode } = useColorMode();
    const Icon = colorMode === 'light' ? IconSun : IconSunOff;
    return (
      <IconButton
        height="32px"
        width="32px"
        style={{
          cursor: 'default',
          minHeight: 'unset',
          minWidth: 'unset',
          padding: 0,
        }}
        icon={Icon}
        onClick={() => main.theme.toggleMode()}
        title="Toggle color mode"
        as="button"
        {...(props as any)}
        ref={ref as any}
        iconProps={{
          color: props.color,
        }}
      />
    );
  }
);

ColorModeButton.displayName = 'ColorModeButton';
