import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { actionTypeLabels } from '@/data/videos';
import { getPlayerById } from '@/data/players';
import type { Player, VideoClip } from '@/types';
import styles from './index.module.scss';

interface PlayerAppearance {
  player: Player;
  clipCount: number;
  clipVideos: VideoClip[];
}

const CollectionDetailPage: React.FC = () => {
  const router = useRouter();
  const collectionId = router.params.id as string;
  const { videos, collections, currentUser } = useAppStore();
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);

  const collection = useMemo(() => collections.find(c => c.id === collectionId), [collections, collectionId]);

  const clipVideos = useMemo(() => {
    if (!collection) return [];
    const found = collection.videoIds
      .map(id => videos.find(v => v.id === id))
      .filter(Boolean) as VideoClip[];
    return found.sort((a, b) => (a.uploadTime < b.uploadTime ? -1 : 1));
  }, [collection, videos]);

  useDidShow(() => {
    const lastId = Taro.getStorageSync<string>('last_playing_collection_video_' + collectionId);
    if (lastId) {
      const idx = clipVideos.findIndex(v => v.id === lastId);
      if (idx !== -1) setPlayingIndex(idx);
      Taro.removeStorageSync('last_playing_collection_video_' + collectionId);
    }
  });

  const playerAppearances = useMemo<PlayerAppearance[]>(() => {
    const map: Record<string, PlayerAppearance> = {};
    clipVideos.forEach((video) => {
      video.playerIds.forEach(pid => {
        const player = getPlayerById(pid);
        if (!player) return;
        if (!map[pid]) {
          map[pid] = { player, clipCount: 0, clipVideos: [] };
        }
        map[pid].clipCount++;
        map[pid].clipVideos.push(video);
      });
    });
    return Object.values(map).sort((a, b) => b.clipCount - a.clipCount);
  }, [clipVideos]);

  const canShareInternally = currentUser.minorVisibleRange !== 'none';

  const togglePlayerExpand = (pid: string) => {
    setExpandedPlayerId(prev => (prev === pid ? null : pid));
  };

  const handlePlayAll = () => {
    if (clipVideos.length === 0) return;
    setPlayingIndex(0);
    Taro.setStorageSync('last_playing_collection_' + collectionId, 0);
    Taro.setStorageSync('collection_video_ids_' + collectionId, clipVideos.map(v => v.id));
    Taro.showToast({ title: '开始顺序播放', icon: 'none' });
    Taro.navigateTo({ url: `/pages/interaction/index?id=${clipVideos[0].id}&collectionId=${collectionId}` });
  };

  const handlePlay = (videoId: string, idx: number) => {
    setPlayingIndex(idx);
    Taro.setStorageSync('last_playing_collection_video_' + collectionId, videoId);
    Taro.navigateTo({ url: `/pages/interaction/index?id=${videoId}&collectionId=${collectionId}` });
  };

  const handleJumpClip = (video: VideoClip) => {
    const idx = clipVideos.findIndex(v => v.id === video.id);
    if (idx !== -1) handlePlay(video.id, idx);
  };

  const handleShare = () => {
    if (currentUser.minorVisibleRange === 'none') {
      Taro.showToast({ title: '家长设置限制了外部分享', icon: 'none' });
      return;
    }
    if (!currentUser.allowExternalShare) {
      Taro.showToast({ title: '仅队内可见，无法外部分享', icon: 'none' });
      return;
    }
    setShowShareCard(true);
  };

  if (!collection) {
    return (
      <View className={styles.emptyState}>
        📭 合集不存在
      </View>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>{collection.title}</Text>
        <Text className={styles.headerMeta}>共 {clipVideos.length} 条片段</Text>
        <Text className={styles.headerCreator}>
          🎥 {collection.createdByName} · {collection.createdAt}
        </Text>
        {collection.description && (
          <Text className={styles.headerDesc}>{collection.description}</Text>
        )}
        <View className={styles.headerActions}>
          <View className={styles.headerActionBtn} onClick={handleShare}>
            <Text className={styles.headerActionIcon}>📤</Text>
            <Text className={styles.headerActionText}>分享给家长</Text>
          </View>
        </View>
      </View>

      {playerAppearances.length > 0 && (
        <View className={styles.playerSummary}>
          <Text className={styles.summaryTitle}>
            👕 本次出场球员（{playerAppearances.length}人）
          </Text>
          <View className={styles.playerGrid}>
            {playerAppearances.map(item => (
              <View key={item.player.id} className={styles.playerCardWrap}>
                <View
                  className={classnames(styles.playerCard, expandedPlayerId === item.player.id && styles.playerCardActive)}
                  onClick={() => togglePlayerExpand(item.player.id)}
                >
                  <Image className={styles.playerAvatar} src={item.player.avatar} mode='aspectFill' />
                  <Text className={styles.playerName}>{item.player.name}</Text>
                  <Text className={styles.playerClipsCount}>
                    {item.clipCount}条片段 {expandedPlayerId === item.player.id ? '▲' : '▼'}
                  </Text>
                </View>
                {expandedPlayerId === item.player.id && (
                  <View className={styles.playerClipsList}>
                    {item.clipVideos.map((clip) => {
                      const globalIdx = clipVideos.findIndex(v => v.id === clip.id);
                      return (
                        <View
                          key={clip.id}
                          className={styles.playerClipItem}
                          onClick={() => handleJumpClip(clip)}
                        >
                          <Text className={styles.playerClipIndex}>#{globalIdx + 1}</Text>
                          <Image className={styles.playerClipThumb} src={clip.thumbnail} mode='aspectFill' />
                          <View className={styles.playerClipInfo}>
                            <Text className={styles.playerClipTitle}>{clip.title}</Text>
                            <Text className={styles.playerClipMeta}>
                              {actionTypeLabels[clip.actionType] || '其他'} · {clip.uploadTime.slice(0, 16)}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
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
                {playingIndex === idx && (
                  <View className={styles.nowPlayingBadge}>播放中</View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {showShareCard && (
        <View className={styles.shareMask} onClick={() => setShowShareCard(false)}>
          <View className={styles.shareCard} onClick={e => e.stopPropagation()}>
            <View className={styles.shareCardHeader}>
              <Text className={styles.shareCardTitle}>📤 队内分享卡片</Text>
              <Text className={styles.shareCardClose} onClick={() => setShowShareCard(false)}>×</Text>
            </View>
            <View className={styles.shareCardBody}>
              <Image className={styles.shareCardCover} src={collection.cover} mode='aspectFill' />
              <View className={styles.shareCardInfo}>
                <Text className={styles.shareCardName}>{collection.title}</Text>
                <Text className={styles.shareCardDesc}>
                  {clipVideos.length} 条片段 · {playerAppearances.length} 位球员
                </Text>
                <View className={styles.shareCardPlayers}>
                  {playerAppearances.slice(0, 6).map(item => (
                    <Image
                      key={item.player.id}
                      className={styles.shareCardPlayerAvatar}
                      src={item.player.avatar}
                      mode='aspectFill'
                    />
                  ))}
                  {playerAppearances.length > 6 && (
                    <Text className={styles.shareCardMore}>+{playerAppearances.length - 6}</Text>
                  )}
                </View>
                <View className={styles.shareCardNotice}>
                  <Text className={styles.shareCardNoticeIcon}>🔒</Text>
                  <Text className={styles.shareCardNoticeText}>
                    队内可见 · 遵守未成年人可见范围和外部转发限制
                  </Text>
                </View>
              </View>
            </View>
            <View className={styles.shareCardActions}>
              <Button className={styles.shareCardCancel} onClick={() => setShowShareCard(false)}>取消</Button>
              <Button
                className={classnames(styles.shareCardConfirm, !canShareInternally && styles.shareCardConfirmDisabled)}
                onClick={() => {
                  if (!currentUser.allowExternalShare) {
                    Taro.showToast({ title: '家长已屏蔽外部转发', icon: 'none' });
                    return;
                  }
                  if (currentUser.minorVisibleRange === 'team') {
                    Taro.showToast({ title: '已生成队内可见链接', icon: 'success' });
                  } else {
                    Taro.showToast({ title: '分享链接已复制', icon: 'success' });
                  }
                  setShowShareCard(false);
                }}
              >
                {currentUser.minorVisibleRange === 'team' ? '生成队内可见链接' : '复制分享链接'}
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default CollectionDetailPage;
