import React, { useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { teams, currentTeamId } from '@/data/teams';
import { matches, getMatchesByTeam } from '@/data/matches';
import { useAppStore } from '@/store/useAppStore';
import VideoCard from '@/components/VideoCard';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const team = teams.find(t => t.id === currentTeamId)!;
  const teamMatches = getMatchesByTeam(currentTeamId);
  const { videos } = useAppStore();
  const latestVideos = videos.slice(0, 4);
  const latestMatch = matches[matches.length - 1];

  useEffect(() => {
    console.log('[HomePage] 页面加载，队伍ID:', currentTeamId);
  }, []);

  const handleAction = (action: string) => {
    console.log('[HomePage] 点击快捷操作:', action);
    switch (action) {
      case 'upload':
        Taro.switchTab({ url: '/pages/create/index' });
        break;
      case 'players':
        Taro.navigateTo({ url: '/pages/player/index' });
        break;
      case 'album':
        Taro.switchTab({ url: '/pages/album/index' });
        break;
      case 'verify':
        Taro.navigateTo({ url: '/pages/verify/index' });
        break;
    }
  };

  const getScoreClass = (match: typeof latestMatch) => {
    if (match.ourScore > match.opponentScore) return styles.win;
    if (match.ourScore < match.opponentScore) return styles.lose;
    return styles.draw;
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.teamHeader}>
        <View className={styles.teamInfo}>
          <Image className={styles.teamLogo} src={team.logo} mode='aspectFill' />
          <View className={styles.teamText}>
            <Text className={styles.teamName}>{team.name}</Text>
            <Text className={styles.teamSport}>⚽ {team.sport}</Text>
            <Text className={styles.teamCoach}>主教练：{team.coachName}</Text>
          </View>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{team.memberCount}</Text>
            <Text className={styles.statLabel}>成员</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{teamMatches.filter(m => m.isWin).length}</Text>
            <Text className={styles.statLabel}>胜场</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{videos.length}</Text>
            <Text className={styles.statLabel}>视频</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{teamMatches.length}</Text>
            <Text className={styles.statLabel}>比赛</Text>
          </View>
        </View>
      </View>

      <View className={styles.pageContent}>
        <View className={styles.quickActions}>
          <View className={styles.actionItem} onClick={() => handleAction('upload')}>
            <Text className={styles.icon}>📹</Text>
            <Text className={styles.label}>上传视频</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleAction('players')}>
            <Text className={styles.icon}>👥</Text>
            <Text className={styles.label}>球员名单</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleAction('album')}>
            <Text className={styles.icon}>🏆</Text>
            <Text className={styles.label}>比赛相册</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleAction('verify')}>
            <Text className={styles.icon}>✅</Text>
            <Text className={styles.label}>成员验证</Text>
          </View>
        </View>

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>最近比赛</Text>
          <Text className={styles.moreBtn} onClick={() => Taro.switchTab({ url: '/pages/album/index' })}>查看全部 →</Text>
        </View>

        {latestMatch && (
          <View className={styles.matchCard}>
            <View className={styles.matchInfo}>
              <Text className={styles.matchTitle}>{latestMatch.title}</Text>
              <Text className={styles.matchDate}>{latestMatch.date}</Text>
              <Text className={styles.matchOpponent}>VS {latestMatch.opponent}</Text>
            </View>
            <View className={styles.matchScore}>
              <Text className={classnames(styles.scoreText, getScoreClass(latestMatch))}>
                {latestMatch.ourScore}-{latestMatch.opponentScore}
              </Text>
            </View>
          </View>
        )}

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>精彩视频</Text>
          <Text className={styles.moreBtn} onClick={() => Taro.switchTab({ url: '/pages/album/index' })}>更多 →</Text>
        </View>

        <View className={styles.videoList}>
          {latestVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
