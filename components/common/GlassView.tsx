import React from 'react';
import { View, ViewProps, Platform } from 'react-native';
import { BlurView, BlurViewProps } from 'expo-blur';
import { cn } from '../../utils';

interface GlassViewProps extends ViewProps {
  intensity?: number;
  tint?: BlurViewProps['tint'];
  contentContainerClassName?: string;
}

const GlassView: React.FC<GlassViewProps> = ({
  children,
  intensity = 50,
  tint = 'default',
  className = '',
  contentContainerClassName = '',
  style,
  ...props
}) => {
  if (Platform.OS === 'android') {
    // Android fallback since BlurView support varies or can be expensive
    // Using a semi-transparent background instead
    return (
      <View
        className={cn(
          'bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-white/10 overflow-hidden',
          className
        )}
        style={style}
        {...props}
      >
        <View className={cn('flex-1', contentContainerClassName)}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View className={cn('overflow-hidden bg-transparent', className)} style={style} {...props}>
      <BlurView intensity={intensity} tint={tint} className="absolute inset-0" />
      <View className={cn('flex-1 bg-white/40 dark:bg-slate-900/40', contentContainerClassName)}>
        {children}
      </View>
    </View>
  );
};

export default GlassView;
