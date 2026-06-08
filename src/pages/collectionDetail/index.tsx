import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import { actionTypeLabels } from '@/data/videos';
import { getPlayerById } from '@/data/players';
import type { Player } from '@/types';
import styles from './index.module.scss';

interface PlayerAppearance {
  player: Player;
  clipCount: number;
  clipIndices: number[];
}

const CollectionDetailPage: React.FC = () => {
  const router = useRouter();
  const collectionId = router.params.id as string;
  const { videos, collections } = useAppStore();

  const collection = useMemo(() => collections.find(c => c.id === collectionId), [collections, collectionId]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const clipVideos = useMemo(() => {
    if (!collection) return [];
    return collection.videoIds
      .map(id => videos.find(v => v.id === id))
      .filter(Boolean) as typeof videos;
  }, [collection, videos]);

  const playerAppearances = useMemo<PlayerAppearance[]>(() => {
    const map: Record<string, PlayerAppearance> = {};
    clipVideos.forEach((video, idx) => {
      video.playerIds.forEach(pid => {
        const player = getPlayerById(pid);
        if (!player) return;
        if (!map[pid]) {
          map[pid] = { player, clipCount: 0, clipIndices: [] };
        }
        map[pid].clipCount++;
        map[pid].clipIndices.push(idx + 1);
      });
    });
    return Object.values(map).sort((a, b) => b.clipCount - a.clipCount);
  }, [clipVideos]);

  if (!collection) {
    return (
      <View className={styles.emptyState}>
        📭 合集不存在
      </View>
    );
  }

  const handlePlayAll = () => {
    if (clipVideos.length === 0) return;
    setPlayingIndex(0);
    Taro.showToast({ title: '开始顺序播放', icon: 'none' });
    Taro.navigateTo({ url: `/pages/interaction/index?id=${clipVideos[0].id}` });
  };

  const handlePlay = (videoId: string, idx: number) => {
    setPlayingIndex(idx);
    Taro.navigateTo({ url: `/pages/interaction/index?id=${videoId}` });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>{collection.title}</Text>
        <Text className={styles.headerMeta}>共 {clipVideos.length} 条片段</Text>
        <Text className={styles.headerCreator}>
          🎥 {collection.createdByName} · {collection.createdAt}
        </Text>
        {collection.description && (
          <Text style={{ fontSize: 24, marginTop: 12, opacity: 0.85, display: 'block' }}>
            {collection.description}
          </Text>
        )}
      </View>

      {playerAppearances.length > 0 && (
        <View className={styles.playerSummary}>
          <Text className={styles.summaryTitle}>
            👕 本次出场球员（{playerAppearances.length}人）
          </Text>
          <View className={styles.playerGrid}>
            {playerAppearances.map(item => (
              <View key={item.player.id} className={styles.playerCard}>
                <Image className={styles.playerAvatar} src={item.player.avatar} mode='aspectFill' />
                <Text className={styles.playerName}>{item.player.name}</Text>
                <Text className={styles.playerClipsCount}>
                  {item.clipCount}条片段
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.videoSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>📹 片段顺序播放</Text>
          <Text className={styles.playAllBtn} onClick={handlePlayAll}>
            ▶ 顺序播放全部
          </Text>
        </View>

        <View className={styles.videoList}>
          {clipVideos.map((video, idx) => {
            const playerNames = video.playerIds
              .map(id => getPlayerById(id)?.name)
              .filter(Boolean)
              .join('、');
            return (
              <View
                key={video.id}
                className={styles.videoItem}
                onClick={() => handlePlay(video.id, idx)}
              >
                <Text className={styles.videoIndex}>{idx + 1}</Text>
                <View className={styles.videoItemThumb}>
                  <Image className={styles.videoItemThumbImg} src={video.thumbnail} mode='aspectFill' />
                  <Text className={styles.videoItemDuration}>{video.duration}"</Text>
                  <Text className={styles.videoPlayBadge}>
                    {playingIndex === idx ? '⏸' : '▶'}
                  </Text>
                </View>
                <View className={styles.videoItemInfo}>
                  <Text className={styles.videoItemTitle}>{video.title}</Text>
                  <Text className={styles.videoItemPlayers}>
                    🏃 {playerNames || '未标记球员'}
                  </Text>
                  <View className={styles.videoItemFooter}>
                    <Text className={styles.actionTag}>
                      {actionTypeLabels[video.actionType] || '其他'}
                    </Text>
                    {video.scoreText && (
                      <Text className={styles.actionTag} style={{ background: '#E8F4FF', color: '#004E89' }}>
                        比分 {video.scoreText}
                      </Text>
                    )}
                    <Text>❤️ {video.likeCount}</Text>
                    <Text>💬 {video.commentCount}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default CollectionDetailPage;
