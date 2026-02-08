import { Collection } from '@/api/collections';
import CustomAlert, { AlertButton } from '@/components/common/CustomAlert';
import useCollectionStore from '@/stores/useCollectionStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Animated, RefreshControl, FlatList, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StudyScreen() {
  const router = useRouter();
  const { collections, fetchCollections, deleteCollection, isLoading, total, page } = useCollectionStore();

  // Local state for UI interactions
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    buttons?: AlertButton[];
  }>({ title: '' });

  // Refs to track open swipeables
  const openSwipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const showAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}月前`;
    return `${Math.floor(diffDays / 365)}年前`;
  };

  // Initial load
  useFocusEffect(
    useCallback(() => {
      fetchCollections(1, 20, false);
      // Exit edit mode when screen loses focus
      return () => {
        setEditMode(false);
        setSelectedIds(new Set());
      };
    }, [])
  );

  const onRefresh = async () => {
    // Prevent refresh when in edit mode
    if (editMode) return;

    setRefreshing(true);
    setEditMode(false);
    setSelectedIds(new Set());
    try {
      await fetchCollections(1, 20, false);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const onLoadMore = async () => {
    if (isLoading || loadingMore || collections.length >= total) return;

    setLoadingMore(true);
    try {
      await fetchCollections(page + 1, 20, true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCollectionPress = (id: string) => {
    if (editMode) {
      toggleSelection(id);
    } else {
      router.push(`/collection/${id}`);
    }
  };

  const handleCollectionLongPress = (id: string) => {
    if (!editMode) {
      setEditMode(true);
      setSelectedIds(new Set([id]));
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCreatePress = () => {
    router.push('/collection/create');
  };

  const handleDeleteSingle = async (id: string) => {
    // Close all swipeables first
    openSwipeableRefs.current.forEach((ref) => ref?.close());

    showAlert('删除单词本', '确定要删除这个单词本吗？', [
      { text: '取消', style: 'cancel', onPress: () => setAlertVisible(false) },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          setAlertVisible(false);
          try {
            await deleteCollection(id);
            showAlert('成功', '单词本已删除', [{ text: '好的', onPress: () => setAlertVisible(false) }]);
          } catch (error: any) {
            showAlert('删除失败', error.message || '删除单词本时出错', [{ text: '好的', onPress: () => setAlertVisible(false) }]);
          }
        }
      }
    ]);
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      showAlert('提示', '请先选择要删除的单词本', [{ text: '好的', onPress: () => setAlertVisible(false) }]);
      return;
    }

    showAlert(
      '批量删除',
      `确定要删除选中的 ${selectedIds.size} 个单词本吗？`,
      [
        { text: '取消', style: 'cancel', onPress: () => setAlertVisible(false) },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            setAlertVisible(false);
            setDeleting(true);

            const idsToDelete = Array.from(selectedIds);
            let successCount = 0;
            let failCount = 0;

            // Delete collections one by one
            for (const id of idsToDelete) {
              try {
                await deleteCollection(id);
                successCount++;
              } catch (error) {
                console.error(`Failed to delete collection ${id}:`, error);
                failCount++;
              }
            }

            setDeleting(false);
            setEditMode(false);
            setSelectedIds(new Set());

            const message = failCount > 0
              ? `成功删除 ${successCount} 个，失败 ${failCount} 个`
              : `成功删除 ${successCount} 个单词本`;

            showAlert('删除完成', message, [{ text: '好的', onPress: () => setAlertVisible(false) }]);
          }
        }
      ]
    );
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSelectedIds(new Set());
  };

  const handleSelectAll = () => {
    if (selectedIds.size === collections.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(collections.map(c => c.id)));
    }
  };

  const renderRightActions = (id: string, progress: Animated.AnimatedInterpolation<number>) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <Animated.View
        style={{
          transform: [{ translateX }],
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={() => handleDeleteSingle(id)}
          className="bg-red-500 h-full w-20 items-center justify-center"
          style={{ borderTopRightRadius: 16, borderBottomRightRadius: 16 }}
        >
          <FontAwesome name="trash-o" size={20} color="white" />
          <Text className="text-white text-xs mt-1 font-medium">删除</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderItem = ({ item }: { item: Collection }) => {
    const isSelected = selectedIds.has(item.id);

    return (
      <View className="px-6 mb-3">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleCollectionPress(item.id)}
          onLongPress={() => handleCollectionLongPress(item.id)}
          delayLongPress={300}
        >
          <View className={`bg-white dark:bg-slate-800 rounded-2xl p-4 flex-row items-center border ${isSelected ? 'border-blue-500' : 'border-gray-100 dark:border-gray-800'}`}>
            {editMode && (
              <View className="mr-3">
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {isSelected && <FontAwesome name="check" size={12} color="white" />}
                </View>
              </View>
            )}

            <View
              className="w-12 h-12 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: `${item.color || '#3B82F6'}20` }}
            >
              <Text className="text-xl">{item.icon || '📘'}</Text>
            </View>

            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
                {item.name}
              </Text>
              <View className="flex-row items-center">
                <View className="flex-row items-center mr-3">
                  <FontAwesome name="book" size={10} color="#9ca3af" style={{ marginRight: 4 }} />
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {item.word_count || 0} 词
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <FontAwesome name="clock-o" size={10} color="#9ca3af" style={{ marginRight: 4 }} />
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(item.created_at)}
                  </Text>
                </View>
              </View>
            </View>

            {!editMode && (
              <View className="items-center justify-center pl-2">
                <FontAwesome name="angle-right" size={18} color="#D1D5DB" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const ListHeader = () => (
    <View className="mb-4">
      {!editMode && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleCreatePress}
          className="mb-5"
          style={{
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl overflow-hidden"
          >
            <View className="p-4 flex-row items-center justify-center">
              <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center mr-3">
                <FontAwesome name="plus" size={18} color="white" />
              </View>
              <Text className="text-lg font-bold text-white">
                新建单词本
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          我的单词本 ({total})
        </Text>
        {editMode && (
          <TouchableOpacity onPress={handleSelectAll} className="px-3 py-1">
            <Text className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              {selectedIds.size === collections.length ? '取消全选' : '全选'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const ListFooter = () => (
    <View className="py-6 items-center justify-center">
      {loadingMore ? (
        <ActivityIndicator size="small" color="#3b82f6" />
      ) : collections.length > 0 && collections.length >= total ? (
        <Text className="text-xs text-gray-400">已经到底啦</Text>
      ) : null}
    </View>
  );

  const EmptyState = () => (
    !isLoading ? (
      <View className="items-center justify-center py-16">
        <View className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full items-center justify-center mb-3">
          <FontAwesome name="book" size={32} color="#D1D5DB" />
        </View>
        <Text className="text-base text-gray-400 dark:text-gray-500 font-medium">还没有单词本</Text>
        <Text className="text-sm text-gray-300 dark:text-gray-600 mt-1">点击上方创建您的第一个单词本</Text>
      </View>
    ) : null
  );

  const renderItemWrapper = ({ item }: { item: Collection }) => {
    if (editMode) {
      return renderItem({ item });
    }

    return (
      <Swipeable
        ref={(ref) => {
          if (ref) {
            openSwipeableRefs.current.set(item.id, ref);
          } else {
            openSwipeableRefs.current.delete(item.id);
          }
        }}
        renderRightActions={(progress) => renderRightActions(item.id, progress)}
        overshootRight={false}
        friction={2}
        rightThreshold={40}
        onSwipeableWillOpen={() => {
          openSwipeableRefs.current.forEach((swipeableRef, key) => {
            if (key !== item.id) {
              swipeableRef?.close();
            }
          });
        }}
      >
        {renderItem({ item })}
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950" edges={['top']}>
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={() => setAlertVisible(false)}
        />

        <FlatList
          data={collections}
          renderItem={renderItemWrapper}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <View>
              {/* Header Section */}
              <View className="px-6 pt-6 pb-4">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                      单词本
                    </Text>
                    <Text className="text-base text-gray-500 dark:text-gray-400 mt-2">
                      {editMode ? '选择要管理的单词本' : '选择单词本开始学习'}
                    </Text>
                  </View>

                  {editMode && (
                    <View className="items-end ml-4">
                      <View className="flex-row items-center space-x-2 mb-1">
                        <TouchableOpacity
                          onPress={handleBatchDelete}
                          disabled={deleting || selectedIds.size === 0}
                          className={`w-9 h-9 rounded-full items-center justify-center ${
                            selectedIds.size === 0
                              ? 'bg-gray-100 dark:bg-slate-800'
                              : 'bg-red-500'
                          }`}
                        >
                          {deleting ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <FontAwesome name="trash-o" size={14} color={selectedIds.size === 0 ? '#9ca3af' : 'white'} />
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleCancelEdit}
                          className="w-9 h-9 bg-gray-100 dark:bg-slate-800 rounded-full items-center justify-center"
                        >
                          <FontAwesome name="close" size={14} color="#9ca3af" />
                        </TouchableOpacity>
                      </View>
                      <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        已选择 {selectedIds.size} 项
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Collections List Header */}
              <View className="px-6 mb-4">
                {!editMode && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleCreatePress}
                    className="mb-5"
                    style={{
                      shadowColor: '#3B82F6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 12,
                      elevation: 6,
                    }}
                  >
                    <LinearGradient
                      colors={['#3B82F6', '#1D4ED8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="rounded-2xl overflow-hidden"
                    >
                      <View className="p-4 flex-row items-center justify-center">
                        <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center mr-3">
                          <FontAwesome name="plus" size={18} color="white" />
                        </View>
                        <Text className="text-lg font-bold text-white">
                          新建单词本
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                    我的单词本 ({total})
                  </Text>
                  {editMode && (
                    <TouchableOpacity onPress={handleSelectAll} className="px-3 py-1">
                      <Text className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        {selectedIds.size === collections.length ? '取消全选' : '全选'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          }
          ListFooterComponent={() => (
            <>
              {loadingMore ? (
                <View className="py-6 items-center justify-center">
                  <ActivityIndicator size="small" color="#3b82f6" />
                </View>
              ) : collections.length > 0 && collections.length >= total ? (
                <View className="py-6 items-center justify-center">
                  <Text className="text-xs text-gray-400">已经到底啦</Text>
                </View>
              ) : null}

              {!editMode && collections.length > 0 && (
                <View className="px-6 mt-4 mb-4">
                  <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800/50">
                    <View className="flex-row items-center mb-3">
                      <FontAwesome name="lightbulb-o" size={18} color="#3B82F6" />
                      <Text className="text-base font-semibold text-blue-600 dark:text-blue-400 ml-2">
                        学习小贴士
                      </Text>
                    </View>
                    <Text className="text-sm text-blue-600/80 dark:text-blue-400/80 leading-5">
                      长按单词本可以进入编辑模式，进行批量管理。建议定期复习已学单词，巩固记忆效果。
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
          ListEmptyComponent={
            isLoading && collections.length === 0 ? (
              <View className="py-20 items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
              </View>
            ) : (
              EmptyState()
            )
          }
          showsVerticalScrollIndicator={false}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
              colors={['#3b82f6']}
              enabled={!editMode}
            />
          }
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
