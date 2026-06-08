import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { teams } from '@/data/teams';
import styles from './index.module.scss';

const roleLabels: Record<string, string> = {
  player: '球员',
  parent: '家长',
  coach: '教练',
  admin: '管理员'
};

const MinePage: React.FC = () => {
  const { currentUser, likedVideos, downloadRequests, messages } = useAppStore();
  const team = teams.find(t => t.id === currentUser.teamId);
  const unreadMessages = messages.filter(m => !m.isRead && m.fromUserId !== currentUser.id).length;
  const pendingDownloads = downloadRequests.filter(d => d.status === 'pending').length;

  const handleMenuClick = (key: string) => {
    console.log('[MinePage] 点击菜单:', key);
    switch (key) {
      case 'chat':
        Taro.navigateTo({ url: '/pages/chat/index' });
        break;
      case 'parent':
        Taro.navigateTo({ url: '/pages/parent/index' });
        break;
      case 'season':
        Taro.navigateTo({ url: '/pages/season/index' });
        break;
      case 'verify':
        Taro.navigateTo({ url: '/pages/verify/index' });
        break;
      case 'player':
        Taro.navigateTo({ url: '/pages/player/index' });
        break;
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.profileHeader}>
        <View className={styles.profileRow}>
          <Image className={styles.avatar} src={currentUser.avatar} mode='aspectFill' />
          <View className={styles.profileInfo}>
            <Text className={styles.name}>{currentUser.name}</Text>
            <View>
              <Text className={styles.roleBadge}>{roleLabels[currentUser.role]}</Text>
            </View>
            <Text className={classnames(styles.verifyStatus, currentUser.isVerified && styles.verified)}>
              {currentUser.isVerified ? '✅ 已认证成员' : '⏳ 待身份验证'}
            </Text>
          </View>
        </View>
        {team && (
          <Text style={{ fontSize: 24, opacity: 0.9 }}>
            所属队伍：{team.name}
          </Text>
        )}
      </View>

      <View className={styles.pageContent}>
        <View className={styles.statsCard}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{likedVideos.size}</Text>
            <Text className={styles.statLabel}>我的点赞</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{downloadRequests.length}</Text>
            <Text className={styles.statLabel}>下载申请</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{messages.length}</Text>
            <Text className={styles.statLabel}>消息</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>常用功能</Text>
          <View className={styles.menuCard}>
            <View className={styles.menuItem} onClick={() => handleMenuClick('chat')}>
              <Text className={styles.menuIcon}>💬</Text>
              <Text className={styles.menuText}>私信教练</Text>
              {unreadMessages > 0 && <Text className={styles.menuBadge}>{unreadMessages}</Text>}
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={() => handleMenuClick('parent')}>
              <Text className={styles.menuIcon}>🛡️</Text>
              <Text className={styles.menuText}>家长设置</Text>
              {pendingDownloads > 0 && <Text className={styles.menuBadge}>{pendingDownloads}</Text>}
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={() => handleMenuClick('season')}>
              <Text className={styles.menuIcon}>📊</Text>
              <Text className={styles.menuText}>赛季回顾</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={() => handleMenuClick('player')}>
              <Text className={styles.menuIcon}>👥</Text>
              <Text className={styles.menuText}>球员名单</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>账号管理</Text>
          <View className={styles.menuCard}>
            <View className={styles.menuItem} onClick={() => handleMenuClick('verify')}>
              <Text className={styles.menuIcon}>✅</Text>
              <Text className={styles.menuText}>成员身份验证</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={classnames(styles.menuItem, styles.dangerItem)}>
              <Text className={styles.menuIcon}>🚪</Text>
              <Text className={styles.menuText}>退出队伍</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
