import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { VideoClip } from '@/types';
import { getPlayerById } from '@/data/players';
import { actionTypeLabels } from '@/data/videos';
import { useAppStore } from '@/store/useAppStore';
import styles from './index.module.scss';

interface VideoCardProps {
  video: VideoClip;
  onClick?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  const { likedVideos, toggleLike } = useAppStore();
  const isLiked = likedVideos.has(video.id);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(video.id);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/interaction/index?id=${video.id}`
      });
    }
  };

  const playerTags = video.playerIds
    .map(id => getPlayerById(id))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <View className={styles.container} onClick={handleClick}>
      <View className={styles.thumbnailWrap}>
        <Image
          className={styles.thumbnail}
          src={video.thumbnail}
          mode='aspectFill'
        />
        {video.scoreText && (
          <View className={styles.scoreBadge}>{video.scoreText}</View>
        )}
        <View className={styles.duration}>{video.duration}"</View>
      </View>

      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.title}>{video.title}</Text>
          <View className={styles.actionTag}>
            {actionTypeLabels[video.actionType] || '其他'}
          </View>
        </View>

        <View className={styles.meta}>
          <Text className={styles.uploader}>{video.uploaderName}</Text>
          <Text className={styles.time}>{video.uploadTime}</Text>
        </View>

        {playerTags.length > 0 && (
          <View className={styles.playerTags}>
            {playerTags.map(player => player && (
              <View key={player.id} className={styles.playerTag}>
                <Image className={styles.playerAvatar} src={player.avatar} mode='aspectFill' />
                <Text>{player.name}</Text>
              </View>
            ))}
          </View>
        )}

        <View className={styles.footer}>
          <View
            className={classnames(styles.statItem, isLiked && styles.liked)}
            onClick={handleLike}
          >
            <Text className={styles.statIcon}>{isLiked ? '❤️' : '🤍'}</Text>
            <Text>{video.likeCount}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statIcon}>💬</Text>
            <Text>{video.commentCount}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statIcon}>👁️</Text>
            <Text>{video.viewCount}</Text>
          </View>
          {!video.allowShare && (
            <Text className={styles.shareDisabled}>🔒 队内可见</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default VideoCard;
