import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// 自定义 TabBar 组件
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  // 计算每个 Tab 的宽度
  const { width } = Dimensions.get('window');
  const tabWidth = width / state.routes.length;
  const indicatorSize = 48; // 指示器大小（方形）

  // 动画值
  const translateX = useSharedValue(0);

  // 当当前索引改变时，更新动画位置
  useEffect(() => {
    translateX.value = withSpring(state.index * tabWidth, {
      damping: 15,
      stiffness: 100,
      mass: 0.5,
    });
  }, [state.index, tabWidth]);

  // 指示器样式
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // 颜色定义
  const activeColor = '#3b82f6'; // 选中背景色 (Blue-500)
  const inactiveIconColor = isDark ? '#94a3b8' : '#9ca3af'; // 未选中图标色 (Slate-400 / Gray-400)
  const backgroundColor = isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)';

  return (
    <View style={styles.tabBarContainer}>
      {/* 背景处理：iOS使用原生模糊，Android使用实验性高性能模糊 */}
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <BlurView
            intensity={30}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
            experimentalBlurMethod='dimezisBlurView'
          />
        )}

        {/* Android 额外叠加层：用于调整色调和增强对比度 */}
        {Platform.OS === 'android' && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.4)'
              }
            ]}
          />
        )}
      </View>

      {/* 内容区域 */}
      <View style={[styles.contentContainer, { paddingBottom: insets.bottom }]}>

        {/* 滑动指示器 (Active Indicator) */}
        <Animated.View
          style={[
            styles.indicator,
            {
              width: indicatorSize,
              height: indicatorSize,
              left: (tabWidth - indicatorSize) / 2, // 在每个 tab 槽位中居中
              backgroundColor: activeColor,
            },
            indicatorStyle,
          ]}
        />

        {/* Tab 按钮 */}
        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            // 图标映射
            let iconName: React.ComponentProps<typeof FontAwesome>['name'] = 'question';
            if (route.name === 'index') iconName = 'home';
            else if (route.name === 'study') iconName = 'book';
            else if (route.name === 'review') iconName = 'refresh';
            else if (route.name === 'profile') iconName = 'user';

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                style={[styles.tabItem, { width: tabWidth }]}
                activeOpacity={0.7}
              >
                <FontAwesome
                  name={iconName}
                  size={20}
                  color={isFocused ? 'white' : inactiveIconColor}
                  style={{ marginBottom: 0 }}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // 页面切换动画配置 (仅 Android/iOS 原生栈有效，Expo Router Tabs 默认 fade)
        // 注意：Tabs 本身不支持水平滑动切换页面，这里只能配置 TabBar 动画
        animation: 'shift',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: '首页' }}
      />
      <Tabs.Screen
        name="study"
        options={{ title: '单词本' }}
      />
      <Tabs.Screen
        name="review"
        options={{ title: '复习' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: '我的' }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    elevation: 0,
    borderTopWidth: 0,
  },
  contentContainer: {
    paddingTop: 12,
  },
  tabsRow: {
    flexDirection: 'row',
  },
  indicator: {
    position: 'absolute',
    top: 12, // 与 paddingTop 保持一致
    borderRadius: 14, // 方形圆角
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48, // 与 indicator 高度一致
  },
});
