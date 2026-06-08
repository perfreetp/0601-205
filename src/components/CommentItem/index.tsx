import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import type { Comment } from '@/types';
import styles from './index.module.scss';

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  return (
    <View className={styles.container}>
      <Image className={styles.avatar} src={comment.userAvatar} mode='aspectFill' />
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{comment.userName}</Text>
          <Text className={styles.time}>{comment.time}</Text>
        </View>
        <Text className={styles.text}>{comment.content}</Text>
        <View className={styles.footer}>
          <View className={styles.likeBtn}>
            <Text className={styles.icon}>👍</Text>
            <Text>{comment.likeCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CommentItem;
