import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onClose?: () => void;
}

export default function CustomAlert({
  visible,
  title,
  message,
  buttons = [{ text: 'OK', style: 'default' }],
  onClose
}: CustomAlertProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showModal, setShowModal] = useState(visible);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      opacity.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.cubic)
      });
      scale.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.cubic)
      });
    } else {
      opacity.value = withTiming(0, {
        duration: 100,
        easing: Easing.in(Easing.linear)
      }, (finished) => {
        if (finished) {
          runOnJS(setShowModal)(false);
        }
      });
      scale.value = withTiming(0.95, {
        duration: 100,
        easing: Easing.in(Easing.linear)
      });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!showModal) return null;

  return (
    <Modal
      transparent
      visible={showModal}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />

          <TouchableWithoutFeedback>
            <Animated.View style={[styles.alertContainer, isDark ? styles.alertContainerDark : styles.alertContainerLight, containerStyle]}>
              {/* Content */}
              <View style={styles.content}>
                <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>{title}</Text>
                {message && (
                  <Text style={[styles.message, isDark ? styles.textDescDark : styles.textDescLight]}>
                    {message}
                  </Text>
                )}
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {buttons.map((btn, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.6}
                    style={styles.button}
                    onPress={() => {
                      if (btn.onPress) {
                        btn.onPress();
                      } else if (onClose) {
                        onClose();
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        // Material Design 3 Styling logic
                        // Destructive -> Error Color
                        // Default/Cancel -> Primary Color
                        btn.style === 'destructive'
                          ? styles.textDestructive
                          : (isDark ? styles.textLinkDark : styles.textLinkLight),
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)', // Slightly lighter backdrop per Material specs
  },
  alertContainer: {
    width: 312,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,
  },
  alertContainerLight: {
    backgroundColor: '#FFFFFF',
  },
  alertContainerDark: {
    backgroundColor: '#2B2D31', // Material 3 Dark Surface Container High
  },
  content: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'flex-start',
    width: '100%',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'left',
    marginBottom: 16,
    fontWeight: '400', // Regular
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 24,
    width: '100%',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    minWidth: 48,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Light Theme
  textLight: { color: '#191C1E' }, // On Surface
  textDescLight: { color: '#41484D' }, // On Surface Variant
  textLinkLight: { color: '#0061A4' }, // Primary

  // Dark Theme
  textDark: { color: '#E2E2E6' },
  textDescDark: { color: '#C4C7C5' },
  textLinkDark: { color: '#9ECAFF' }, // Primary Inverse/Dark

  // Common
  textDestructive: { color: '#BA1A1A' }, // Error
});
