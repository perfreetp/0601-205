import React, { useState } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { playRanks, videos } from '@/data/videos';
import { getMatchesByTeam } from '@/data/matches';
import { currentTeamId } from '@/data/teams';
import styles from './index.module.scss';

const SeasonPage: React.FC = () => {
  const [showLink, setShowLink] = useState(false);
  const matches = getMatchesByTeam(currentTeamId);
  const wins = matches.filter(m => m.isWin).length;
  const totalViews = playRanks.reduce((sum, r) => sum + r.viewCount, 0);
  const totalLikes = playRanks.reduce((sum, r) => sum + r.likeCount, 0);

  const handleExport = () => {
    console.log('[SeasonPage] 导出赛季回顾');
    setShowLink(true);
    Taro.showToast({ title: '回顾链接已生成', icon: 'success' });
  };

  const handleCopyLink = () => {
    Taro.setClipboardData({
      data: 'https://team-highlight.example.com/season/2024-spring',
      success: () => {
        Taro.showToast({ title: '链接已复制', icon: 'success' });
      }
    });
  };

  const getRankClass = (index: number) => {
    if (index === 0) return styles.rank1;
    if (index === 1) return styles.rank2;
    if (index === 2) return styles.rank3;
    return styles.rankOther;
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.heroCard}>
        <Text className={styles.seasonTitle}>🏆 2024春季赛</Text>
        <Text className={styles.seasonSubtitle}>星耀少年足球队 · 赛季回顾</Text>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.bigNum}>{wins}/{matches.length}</Text>
            <Text className={styles.statLabel}>胜/总场次</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.bigNum}>{videos.length}</Text>
            <Text className={styles.statLabel}>精彩片段</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.bigNum}>{totalViews}</Text>
            <Text className={styles.statLabel}>总播放</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🏅</Text>
          播放排行榜
        </Text>
        <View className={styles.rankCard}>
          {playRanks.map((rank, index) => (
            <View key={rank.playerId} className={styles.rankItem}>
              <View className={classnames(styles.rankNumber, getRankClass(index))}>
                {index + 1}
              </View>
              <Image className={styles.rankAvatar} src={rank.playerAvatar} mode='aspectFill' />
              <View className={styles.rankInfo}>
                <Text className={styles.rankName}>{rank.playerName}</Text>
                <Text className={styles.rankDetail}>
                  {rank.clipCount}条片段 · {rank.likeCount}次点赞
                </Text>
              </View>
              <Text className={styles.rankStat}>{rank.viewCount}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🎬</Text>
          热门高光
        </Text>
        <View className={styles.highlightGrid}>
          {videos.slice(0, 6).map(video => (
            <View
              key={video.id}
              className={styles.highlightItem}
              onClick={() => Taro.navigateTo({ url: `/pages/interaction/index?id=${video.id}` })}
            >
              <Image className={styles.highlightThumb} src={video.thumbnail} mode='aspectFill' />
              <View className={styles.highlightOverlay}>
                <Text className={styles.highlightTitle}>{video.title}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.exportCard}>
          <Text className={styles.exportTitle}>📤 导出赛季回顾</Text>
          <Text className={styles.exportDesc}>
            生成专属赛季回顾链接，分享给所有队员和家长
          </Text>
          <Button className={styles.exportBtn} onClick={handleExport}>
            {showLink ? '🔗 重新生成' : '✨ 生成回顾链接'}
          </Button>
          {showLink && (
            <View className={styles.linkCard} onClick={handleCopyLink}>
              点击复制：https://team-highlight.example.com/season/2024-spring
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default SeasonPage;
