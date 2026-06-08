import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { actionTypeLabels } from '@/data/videos';
import { getPlayerById } from '@/data/players';
import styles from './index.module.scss';

const CollectionPage: React.FC = () => {
  const { videos, collections, createCollection } = useAppStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => (a.uploadTime < b.uploadTime ? 1 : -1));
  }, [videos]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedVideos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedVideos.map(v => v.id));
    }
  };

  const handleCreate = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入合集标题', icon: 'none' });
      return;
    }
    if (selectedIds.length === 0) {
      Taro.showToast({ title: '请至少选择一个片段', icon: 'none' });
      return;
    }
    const firstVideo = videos.find(v => v.id === selectedIds[0]);
    createCollection({
      title: title.trim(),
      description: description.trim() || undefined,
      videoIds: selectedIds,
      matchId: firstVideo?.matchId,
      trainingDate: firstVideo?.trainingDate
    });
    Taro.showToast({ title: '合集创建成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const getVideoMeta = (video: typeof videos[number]) => {
    const names = video.playerIds
      .map(id => getPlayerById(id)?.name)
      .filter(Boolean)
      .slice(0, 2)
      .join('、');
    return `${actionTypeLabels[video.actionType] || '其他'} · ${names || '未标记'}`;
  };

  return (
    <View className={styles.page}>
      <View className={styles.headerCard}>
        <Text className={styles.headerTitle}>🎬 整理片段合集</Text>
        <Text className={styles.headerSub}>勾选同一场比赛或训练日的片段，家长打开后可按时间顺序播放</Text>
      </View>

      <ScrollView scrollY>
        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.label}>合集标题</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                placeholder='例如：对阵猛虎队比赛精华'
                value={title}
                onInput={e => setTitle(e.detail.value)}
              />
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.label}>简介（选填）</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                placeholder='简单描述这个合集的内容'
                value={description}
                onInput={e => setDescription(e.detail.value)}
              />
            </View>
          </View>
        </View>

        <View className={styles.formCard}>
          <View className={styles.selectedCount}>
            <Text className={styles.countText}>
              已选择 <Text className={styles.countNum}>{selectedIds.length}</Text> 个片段
            </Text>
            <Text className={styles.selectAllBtn} onClick={toggleSelectAll}>
              {selectedIds.length === sortedVideos.length ? '取消全选' : '全选'}
            </Text>
          </View>
          <View className={styles.videoList}>
            {sortedVideos.map(video => (
              <View
                key={video.id}
                className={classnames(styles.videoSelectItem, selectedIds.includes(video.id) && styles.videoSelected)}
                onClick={() => toggleSelect(video.id)}
              >
                <View className={classnames(styles.checkBox, selectedIds.includes(video.id) && styles.checkBoxChecked)}>
                  {selectedIds.includes(video.id) && <Text className={styles.checkIcon}>✓</Text>}
                </View>
                <Image className={styles.videoThumb} src={video.thumbnail} mode='aspectFill' />
                <View className={styles.videoInfo}>
                  <Text className={styles.videoTitle}>{video.title}</Text>
                  <Text className={styles.videoMeta}>{getVideoMeta(video)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {collections.length > 0 && (
          <View className={styles.collectionList}>
            <View className={styles.collectionHeader}>
              <Text className={styles.collectionTitle}>已有合集</Text>
            </View>
            {collections.map(col => (
              <View
                key={col.id}
                className={styles.collectionItem}
                onClick={() => Taro.navigateTo({ url: `/pages/collectionDetail/index?id=${col.id}` })}
              >
                <Image className={styles.collectionCover} src={col.cover} mode='aspectFill' />
                <View className={styles.collectionInfo}>
                  <Text className={styles.collectionName}>{col.title}</Text>
                  <Text className={styles.collectionDesc}>
                    {col.videoIds.length}条片段 · {col.createdAt}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={styles.cancelBtn} onClick={() => Taro.navigateBack()}>取消</Button>
        <Button
          className={classnames(styles.confirmBtn, selectedIds.length === 0 && styles.confirmBtnDisabled)}
          onClick={handleCreate}
        >
          创建合集（{selectedIds.length}）
        </Button>
      </View>
    </View>
  );
};

export default CollectionPage;
