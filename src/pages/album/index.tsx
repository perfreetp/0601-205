import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { matches, getMatchesByTeam } from '@/data/matches';
import { getVideosByMatch } from '@/data/videos';
import { playRanks } from '@/data/videos';
import { currentTeamId } from '@/data/teams';
import { useAppStore } from '@/store/useAppStore';
import styles from './index.module.scss';

const AlbumPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const teamMatches = getMatchesByTeam(currentTeamId);
  const { videos } = useAppStore();

  const filters = [
    { key: 'all', label: '全部' },
    ...teamMatches.map(m => ({ key: m.id, label: m.title }))
  ];

  const displayedMatches = activeFilter === 'all'
    ? teamMatches
    : teamMatches.filter(m => m.id === activeFilter);

  const getMatchBadgeClass = (match: typeof teamMatches[0]) => {
    if (match.ourScore > match.opponentScore) return styles.winBadge;
    if (match.ourScore < match.opponentScore) return styles.loseBadge;
    return styles.drawBadge;
  };

  const getBadgeText = (match: typeof teamMatches[0]) => {
    if (match.ourScore > match.opponentScore) return '胜利';
    if (match.ourScore < match.opponentScore) return '失利';
    return '平局';
  };

  const handleVideoClick = (videoId: string) => {
    Taro.navigateTo({
      url: `/pages/interaction/index?id=${videoId}`
    });
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollX className={styles.filterBar}>
        {filters.map(f => (
          <View
            key={f.key}
            className={classnames(styles.filterItem, activeFilter === f.key && styles.activeFilter)}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </View>
        ))}
      </ScrollView>

      <ScrollView className={styles.content} scrollY>
        <View className={styles.rankSection}>
          <View className={styles.rankHeader}>
            <Text className={styles.rankTitle}>🏆 本周播放排行</Text>
            <Text className={styles.rankMore} onClick={() => Taro.navigateTo({ url: '/pages/season/index' })}>查看全部</Text>
          </View>
          <ScrollView scrollX className={styles.rankList}>
            {playRanks.map((rank, index) => (
              <View key={rank.playerId} className={styles.rankItem}>
                <Text className={styles.rankNum}>#{index + 1}</Text>
                <Image className={styles.rankAvatar} src={rank.playerAvatar} mode='aspectFill' />
                <Text className={styles.rankName}>{rank.playerName}</Text>
                <Text className={styles.rankStats}>{rank.viewCount}次播放</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>比赛回顾</Text>
        </View>

        {displayedMatches.map(match => {
          const matchVideos = getVideosByMatch(match.id).slice(0, 4);
          return (
            <View key={match.id} className={styles.matchCard}>
              <View className={styles.matchCover}>
                <Image className={styles.matchCoverImg} src={match.cover} mode='aspectFill' />
                <View className={classnames(styles.matchBadge, getMatchBadgeClass(match))}>
                  {getBadgeText(match)}
                </View>
              </View>
              <View className={styles.matchInfo}>
                <Text className={styles.matchTitle}>{match.title}</Text>
                <View className={styles.matchMeta}>
                  <Text className={styles.matchMetaItem}>📅 {match.date}</Text>
                  <Text className={styles.matchMetaItem}>📍 {match.location}</Text>
                </View>
                <View className={styles.matchScore}>
                  <View className={styles.scoreTeam}>
                    <Text className={styles.teamName}>我们</Text>
                    <Text className={styles.teamScore}>{match.ourScore}</Text>
                  </View>
                  <Text className={styles.vsText}>VS</Text>
                  <View className={styles.scoreTeam}>
                    <Text className={styles.teamName}>{match.opponent}</Text>
                    <Text className={styles.teamScore}>{match.opponentScore}</Text>
                  </View>
                </View>
                {matchVideos.length > 0 && (
                  <View className={styles.videoGrid}>
                    {matchVideos.map(video => (
                      <View
                        key={video.id}
                        className={styles.miniVideoCard}
                        onClick={() => handleVideoClick(video.id)}
                      >
                        <Image className={styles.miniThumb} src={video.thumbnail} mode='aspectFill' />
                        <Text className={styles.miniDuration}>{video.duration}"</Text>
                        <View className={styles.miniOverlay}>
                          <Text className={styles.miniTitle}>{video.title}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {displayedMatches.length === 0 && (
          <View style={{ padding: 60, textAlign: 'center', color: '#86909C' }}>
            📭 暂无比赛数据
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default AlbumPage;
