import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { cn } from '../../utils';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  prefix,
  suffix,
  fullWidth = false,
  className = '',
  containerClassName = '',
  editable = true,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const isPassword = secureTextEntry !== undefined;

  return (
    <View className={cn('flex-col space-y-1.5 mb-4', fullWidth && 'w-full', containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </Text>
      )}

      <View className={cn(
        'flex-row items-center rounded-lg border bg-white dark:bg-slate-800',
        isFocused
          ? 'border-blue-500 ring-1 ring-blue-500'
          : error
            ? 'border-red-500'
            : 'border-gray-300 dark:border-gray-700',
        !editable && 'opacity-50 bg-gray-50 dark:bg-slate-900',
        'h-12' // Fixed height for consistency
      )}>
        {/* Prefix */}
        {prefix && (
          <View className="pl-3 pr-2">
            {prefix}
          </View>
        )}

        {/* Input */}
        <TextInput
          className={cn(
            'flex-1 text-base text-gray-900 dark:text-gray-100 py-2',
            !prefix && 'pl-4',
            !(suffix || isPassword) && 'pr-4',
            className
          )}
          placeholderTextColor="#9ca3af"
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...props}
        />

        {/* Password Toggle or Suffix */}
        {(isPassword || suffix) && (
          <View className="pr-3 pl-2">
            {isPassword ? (
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <FontAwesome
                  name={isPasswordVisible ? 'eye-slash' : 'eye'}
                  size={18}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            ) : (
              suffix
            )}
          </View>
        )}
      </View>

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <Text
          className={cn(
            'text-xs mt-1',
            error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

export default Input;
