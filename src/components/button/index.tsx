import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button as Base, ButtonProps } from '@chakra-ui/react';

export interface IButtonProps extends ButtonProps {
  isSmaller?: boolean;
  size?: 'bigger' | 'smaller' | 'giant';
  bg?: string;
}

export const Button: React.FC<IButtonProps> = ({
  size,
  color,
  bg = '#3084F2',
  ...props
}) => {
  const { variant } = props;
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isSolid = variant === 'solid' || !variant;

  const background = isSolid ? bg : undefined;

  const sizes = useMemo(() => {
    switch (size) {
      case 'bigger':
        return {
          padding: '25px',
          fontSize: '14px',
        };

      case 'giant':
        return {
          padding: '30px',
          fontSize: '18px',
        };

      default:
        return {
          padding: '9px 18px',
          fontSize: '14px',
        };
    }
  }, [size]);

  return (
    <Base
      {...props}
      bg={background}
      borderRadius="2rem"
      padding={sizes.padding}
      color={color ? color : isOutline || isGhost ? '#3084F2' : '#fff'}
      fontFamily="Inter"
      border={isOutline ? '1px' : undefined}
      borderColor="#3084F2"
      fontSize={sizes.fontSize}
      fontWeight="600"
      _hover={{
        transform: 'scale(1.05)',
        background: '#fff',
        color: '#3084F2',
      }}
      _active={{
        transform: 'scale(1)',
        background: '#fff',
        color: '#3084F2',
      }}
    />
  );
};
