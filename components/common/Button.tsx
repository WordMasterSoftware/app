import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { cn } from '../../utils';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  label?: string; // Optional simple label prop
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  label,
  ...props
}) => {
  const baseStyles = 'items-center justify-center rounded-lg flex-row';

  const variants = {
    primary: 'bg-blue-600 active:bg-blue-700 dark:bg-blue-500 dark:active:bg-blue-600',
    secondary: 'bg-gray-600 active:bg-gray-700 dark:bg-gray-500 dark:active:bg-gray-600',
    outline: 'border-2 border-blue-600 dark:border-blue-400 bg-transparent active:bg-blue-50 dark:active:bg-blue-900/20',
    ghost: 'bg-transparent active:bg-gray-100 dark:active:bg-gray-800',
    danger: 'bg-red-600 active:bg-red-700 dark:bg-red-500 dark:active:bg-red-600',
    success: 'bg-green-600 active:bg-green-700 dark:bg-green-500 dark:active:bg-green-600',
  };

  const textVariants = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-blue-600 dark:text-blue-400',
    ghost: 'text-gray-700 dark:text-gray-300',
    danger: 'text-white',
    success: 'text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base font-medium',
    lg: 'text-lg font-bold',
  };

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50',
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#3b82f6' : '#ffffff'}
          className="mr-2"
        />
      ) : null}

      {label ? (
        <Text className={cn(textVariants[variant], textSizes[size])}>{label}</Text>
      ) : (
        typeof children === 'string' ? (
          <Text className={cn(textVariants[variant], textSizes[size])}>{children}</Text>
        ) : children
      )}
    </TouchableOpacity>
  );
};

export default Button;
