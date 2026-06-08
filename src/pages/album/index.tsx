import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { getMatchesByTeam } from '@/data/matches';
import { playRanks } from '@/data/videos';
import { currentTeamId } from '@/data/teams';
import { useAppStore } from '@/store/useAppStore';
import VideoCard from '@/components/VideoCard';
import styles from './index.module.scss';

type FilterType = 'all' | 'match' | 'training' | string;

interface TrainingGroup {
  date: string;
  topic: string;
  videos: ReturnType<typeof useAppStore.getState>['videos'];
}

const AlbumPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const teamMatches = getMatchesByTeam(currentTeamId);
  const { videos, collections, currentUser } = useAppStore();

  const matchVideosMap = useMemo(() => {
    const map: Record<string, typeof videos> = {};
    teamMatches.forEach(m => { map[m.id] = []; });
    videos.forEach(v => {
      if (v.matchId && map[v.matchId]) map[v.matchId].push(v);
    });
    return map;
  }, [videos, teamMatches]);

  const trainingGroups = useMemo<TrainingGroup[]>(() => {
    const trainingVideos = videos.filter(v => !v.matchId);
    const groupMap: Record<string, TrainingGroup> = {};
    trainingVideos.forEach(v => {
      const key = `${v.trainingDate || 'unknown'}_${v.trainingTopic || '日常训练'}`;
      if (!groupMap[key]) {
        groupMap[key] = {
          date: v.trainingDate || '未知日期',
          topic: v.trainingTopic || '日常训练',
          videos: []
        };
      }
      groupMap[key].videos.push(v);
    });
    return Object.values(groupMap).sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [videos]);

  const filters = [
    { key: 'all' as const, label: '全部' },
    { key: 'match' as const, label: '🏆 正式比赛' },
    { key: 'training' as const, label: '🏋️ 训练日' },
    ...teamMatches.map(m => ({ key: m.id, label: m.title }))
  ];

  const showMatches = activeFilter === 'all' || activeFilter === 'match' || teamMatches.some(m => m.id === activeFilter);
  const showTraining = activeFilter === 'all' || activeFilter === 'training';
  const specificMatch = teamMatches.find(m => m.id === activeFilter);

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

  const displayMatches = specificMatch
    ? [specificMatch]
    : (activeFilter === 'training' ? [] : teamMatches);

  const displayTrainingGroups = activeFilter === 'match' ? [] : trainingGroups;

  const handleCreateCollection = () => {
    Taro.navigateTo({ url: '/pages/collection/index' });
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
        {activeFilter === 'all' && (
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
        )}

        {currentUser.role === 'coach' && (
          <View className={styles.coachBanner} onClick={handleCreateCollection}>
            <View className={styles.coachBannerIcon}>🎬</View>
            <View className={styles.coachBannerInfo}>
              <Text className={styles.coachBannerTitle}>教练整理片段合集</Text>
              <Text className={styles.coachBannerSub}>勾选片段组成合集，家长可按时间顺序播放</Text>
            </View>
            <Text className={styles.coachBannerArrow}>›</Text>
          </View>
        )}

        {collections.length > 0 && activeFilter === 'all' && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>📚 精选合集</Text>
              <Text className={styles.sectionMore} onClick={handleCreateCollection}>
                {currentUser.role === 'coach' ? '管理' : '查看全部'}
              </Text>
            </View>
            <ScrollView scrollX className={styles.collectionList}>
              {collections.map(col => (
                <View
                  key={col.id}
                  className={styles.collectionCard}
                  onClick={() => Taro.navigateTo({ url: `/pages/collectionDetail/index?id=${col.id}` })}
                >
                  <Image className={styles.collectionCover} src={col.cover} mode='aspectFill' />
                  <View className={styles.collectionInfo}>
                    <Text className={styles.collectionTitle}>{col.title}</Text>
                    <Text className={styles.collectionMeta}>{col.videoIds.length}条片段 · {col.createdByName}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {showMatches && displayMatches.length > 0 && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>🏆 比赛回顾</Text>
            </View>

            {displayMatches.map(match => {
              const matchVideos = matchVideosMap[match.id] || [];
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

                    {matchVideos.length > 0 ? (
                      <View className={styles.videoList}>
                        {matchVideos.map(video => (
                          <VideoCard key={video.id} video={video} />
                        ))}
                      </View>
                    ) : (
                      <View className={styles.emptyTip}>暂无比赛片段</View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {showTraining && displayTrainingGroups.length > 0 && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>🏋️ 训练日记</Text>
            </View>

            {displayTrainingGroups.map((group, idx) => (
              <View key={`${group.date}_${idx}`} className={styles.trainingCard}>
                <View className={styles.trainingHeader}>
                  <View className={styles.trainingDate}>
                    <Text className={styles.trainingDateText}>📅 {group.date}</Text>
                    <Text className={styles.trainingTopicTag}>🎯 {group.topic}</Text>
                  </View>
                  <Text className={styles.trainingCount}>{group.videos.length}条片段</Text>
                </View>
                <View className={styles.videoList}>
                  {group.videos.map(video => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {displayMatches.length === 0 && displayTrainingGroups.length === 0 && (
          <View style={{ padding: 60, textAlign: 'center', color: '#86909C' }}>
            📭 暂无相关内容
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default AlbumPage;
