import React from 'react';
import { View, Text, TouchableOpacity, ViewProps } from 'react-native';
import { cn } from '../../utils';

interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  onPress?: () => void;
  hoverable?: boolean; // Kept for API compatibility, used for onPress styling
  bodyClassName?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  onPress,
  className = '',
  bodyClassName = '',
  hoverable = false,
  ...props
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={onPress || hoverable ? 0.8 : 1}
      className={cn(
        'bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm',
        className
      )}
      {...props}
    >
      {/* Header */}
      {(title || subtitle) && (
        <View className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          {title && (
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </Text>
          )}
        </View>
      )}

      {/* Body */}
      <View className={cn('px-5 py-4', bodyClassName)}>
        {children}
      </View>

      {/* Footer */}
      {footer && (
        <View className="px-5 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-gray-700">
          {footer}
        </View>
      )}
    </Container>
  );
};

export default Card;
