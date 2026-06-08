import React, { useState, useEffect } from 'react';
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { getVideoById, actionTypeLabels, getVideosByPlayer } from '@/data/videos';
import { getPlayerById } from '@/data/players';
import { getCommentsByVideo } from '@/data/interactions';
import { useAppStore } from '@/store/useAppStore';
import CommentItem from '@/components/CommentItem';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const InteractionPage: React.FC = () => {
  const router = useRouter();
  const videoId = router.params.id || 'v1';
  const video = getVideoById(videoId as string);
  const { likedVideos, toggleLike, addComment, requestDownload } = useAppStore();

  const [commentText, setCommentText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const comments = getCommentsByVideo(videoId as string);

  useEffect(() => {
    console.log('[InteractionPage] 视频详情:', videoId);
  }, [videoId]);

  if (!video) {
    return (
      <View className={styles.page}>
        <EmptyState icon='🎬' text='视频不存在' />
      </View>
    );
  }

  const isLiked = likedVideos.has(video.id);
  const playerTags = video.playerIds.map(id => getPlayerById(id)).filter(Boolean);

  const handleLike = () => {
    toggleLike(video.id);
  };

  const handleSendComment = () => {
    if (!commentText.trim()) {
      Taro.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }
    addComment(video.id, commentText.trim());
    setCommentText('');
    Taro.showToast({ title: '评论成功', icon: 'success' });
  };

  const handleShare = () => {
    if (!video.allowShare) {
      Taro.showToast({ title: '该视频仅队内可见', icon: 'none' });
      return;
    }
    console.log('[InteractionPage] 分享视频');
    Taro.showToast({ title: '分享功能开发中', icon: 'none' });
  };

  const handleRequestDownload = () => {
    requestDownload(video.id, video.title);
    Taro.showToast({ title: '下载申请已提交', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.videoArea}>
        <Image className={styles.videoThumb} src={video.thumbnail} mode='aspectFill' />
        <View className={styles.playOverlay} onClick={() => setIsPlaying(!isPlaying)}>
          <View className={styles.playBtn}>
            {isPlaying ? '⏸' : '▶'}
          </View>
        </View>
        {video.scoreText && (
          <View className={styles.scoreOverlay}>{video.scoreText}</View>
        )}
      </View>

      <ScrollView scrollY>
        <View className={styles.content}>
          <View className={styles.videoInfo}>
            <Text className={styles.title}>{video.title}</Text>
            <Text className={styles.meta}>
              {video.uploaderName} · {video.uploadTime} · {video.viewCount}次观看
            </Text>
            <View className={styles.tagRow}>
              <View className={classnames(styles.tag, styles.actionTag)}>
                {actionTypeLabels[video.actionType]}
              </View>
              {playerTags.map(player => player && (
                <View key={player.id} className={classnames(styles.tag, styles.playerTag)}>
                  {player.name}
                </View>
              ))}
              {!video.allowShare && (
                <View className={classnames(styles.tag, styles.privacyTag)}>🔒 队内可见</View>
              )}
            </View>
          </View>

          <View className={styles.actionBar}>
            <View
              className={classnames(styles.actionItem, isLiked && styles.liked)}
              onClick={handleLike}
            >
              <Text className={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
              <Text className={styles.actionText}>{video.likeCount}</Text>
            </View>
            <View className={styles.actionItem}>
              <Text className={styles.actionIcon}>💬</Text>
              <Text className={styles.actionText}>{comments.length}</Text>
            </View>
            <View className={styles.actionItem} onClick={handleShare}>
              <Text className={styles.actionIcon}>🔗</Text>
              <Text className={styles.actionText}>分享</Text>
            </View>
            <View className={styles.actionItem}>
              <Text className={styles.actionIcon}>⭐</Text>
              <Text className={styles.actionText}>收藏</Text>
            </View>
          </View>

          <Button className={styles.downloadBtn} onClick={handleRequestDownload}>
            📥 申请下载原片
          </Button>

          <View style={{ height: 32 }} />

          <View className={styles.commentsHeader}>
            <Text className={styles.commentsTitle}>评论互动</Text>
            <Text className={styles.commentsCount}>共 {comments.length} 条</Text>
          </View>

          {comments.length > 0 ? (
            comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            <EmptyState icon='💬' text='暂无评论，快来发表第一条评论吧' />
          )}

          <View style={{ height: 160 }} />
        </View>
      </ScrollView>

      <View className={styles.inputBar}>
        <View className={styles.inputWrap}>
          <Input
            className={styles.commentInput}
            placeholder='说点什么鼓励一下...'
            value={commentText}
            onInput={e => setCommentText(e.detail.value)}
            confirmType='send'
            onConfirm={handleSendComment}
          />
        </View>
        <Button className={styles.sendBtn} onClick={handleSendComment}>发送</Button>
      </View>
    </View>
  );
};

export default InteractionPage;
