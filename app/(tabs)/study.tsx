import React, { useCallback, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useFocusEffect } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import useCollectionStore from '@/stores/useCollectionStore';
import CustomAlert, { AlertButton } from '@/components/common/CustomAlert';
import { Collection } from '@/api/collections';

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

    const content = (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleCollectionPress(item.id)}
        onLongPress={() => handleCollectionLongPress(item.id)}
        delayLongPress={300}
        className="mb-4"
      >
        <View className={`bg-white dark:bg-slate-800 rounded-2xl p-4 flex-row items-center shadow-sm border ${isSelected ? 'border-blue-500' : 'border-gray-100 dark:border-gray-800'}`}>
          {editMode && (
            <View className="mr-3">
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                {isSelected && <FontAwesome name="check" size={12} color="white" />}
              </View>
            </View>
          )}

          <View
            className="w-14 h-14 rounded-2xl items-center justify-center mr-4 shadow-sm"
            style={{ backgroundColor: item.color || '#eff6ff' }}
          >
            <Text className="text-2xl">{item.icon || '📘'}</Text>
          </View>

          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2" numberOfLines={1}>
              {item.description || '暂无描述'}
            </Text>

            <View className="flex-row items-center space-x-3">
              <View className="flex-row items-center">
                <FontAwesome name="book" size={11} color="#9ca3af" style={{ marginRight: 4 }} />
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {item.word_count || 0} 词
                </Text>
              </View>
              <View className="flex-row items-center">
                <FontAwesome name="clock-o" size={11} color="#9ca3af" style={{ marginRight: 4 }} />
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(item.created_at)}
                </Text>
              </View>
            </View>
          </View>

          {!editMode && (
            <View className="items-center justify-center pl-2">
              <View className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-700 items-center justify-center">
                <FontAwesome name="angle-right" size={16} color="#9ca3af" />
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );

    if (editMode) {
      return content;
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
        onSwipeableWillOpen={() => {
          // Close other swipeables
          openSwipeableRefs.current.forEach((swipeableRef, key) => {
            if (key !== item.id) {
              swipeableRef?.close();
            }
          });
        }}
      >
        {content}
      </Swipeable>
    );
  };

  const ListHeader = () => (
    <View className={editMode ? "mb-2" : "mb-2"}>
      {!editMode && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCreatePress}
          className="bg-blue-50 dark:bg-blue-900/20 border-dashed border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex-row items-center justify-center mb-6 h-20 mt-10"
        >
          <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 items-center justify-center mr-3">
            <FontAwesome name="plus" size={14} color="#3b82f6" />
          </View>
          <Text className="text-blue-600 dark:text-blue-400 font-semibold text-base">
            新建单词本
          </Text>
        </TouchableOpacity>
      )}

      <View className={`flex-row items-center justify-between mb-4 ${editMode ? 'mt-10' : ''}`}>
        <Text className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
          我的列表 ({total})
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
      <View className="items-center justify-center py-20 opacity-60">
        <View className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
          <FontAwesome name="book" size={40} color="#d1d5db" />
        </View>
        <Text className="text-gray-400 font-medium">还没有单词本</Text>
        <Text className="text-gray-300 text-xs mt-1">点击上方创建您的第一个单词本</Text>
      </View>
    ) : null
  );

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />

      {/* UPPER SECTION: Fixed Header */}
      <View className="bg-blue-600 rounded-b-[40px] shadow-xl z-20 absolute top-0 left-0 right-0" style={{ height: editMode ? 140 : 140 }}>
        <SafeAreaView edges={['top', 'left', 'right']} className="flex-1">
          <View className="px-6 pt-3">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-blue-100 text-sm font-medium mb-1 opacity-80">WordMaster</Text>
                <Text className="text-3xl font-bold text-white tracking-tight">
                  单词本
                </Text>
              </View>

              {editMode ? (
                <View className="items-end">
                  <View className="flex-row items-center space-x-2 mb-2">
                    <TouchableOpacity
                      onPress={handleBatchDelete}
                      disabled={deleting || selectedIds.size === 0}
                      className={`w-10 h-10 rounded-full items-center justify-center border border-white/30 ${
                        selectedIds.size === 0
                          ? 'bg-white/10'
                          : 'bg-red-500'
                      }`}
                    >
                      {deleting ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <FontAwesome name="trash-o" size={16} color={selectedIds.size === 0 ? '#9ca3af' : 'white'} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCancelEdit}
                      className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/30"
                    >
                      <FontAwesome name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-blue-100 text-xs font-medium opacity-80">
                    已选择 {selectedIds.size} 项
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleCreatePress}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/30 active:bg-white/30"
                >
                  <FontAwesome name="plus" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* LOWER SECTION: Scrollable Content Container */}
      <View style={{ height: 100 }} />

      <View className="flex-1 bg-gray-50 dark:bg-slate-900 rounded-t-[32px] overflow-hidden shadow-sm border-t border-gray-100 dark:border-gray-800">
        <FlatList
          data={collections}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
              colors={['#3b82f6']}
              progressViewOffset={10}
              enabled={!editMode}
            />
          }
        />
      </View>
    </View>
  );
}
