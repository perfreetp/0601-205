import React, { useState } from 'react';
import { View, Text, Image, Input, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { getPlayersByTeam } from '@/data/players';
import { getVideosByPlayer } from '@/data/videos';
import { currentTeamId } from '@/data/teams';
import VideoCard from '@/components/VideoCard';
import styles from './index.module.scss';

const PlayerPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const players = getPlayersByTeam(currentTeamId);

  const filteredPlayers = players.filter(p =>
    p.name.includes(searchText) || p.position.includes(searchText)
  );

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  const playerVideos = selectedPlayer ? getVideosByPlayer(selectedPlayer.id) : [];

  const handlePlayerClick = (playerId: string) => {
    setSelectedPlayerId(selectedPlayerId === playerId ? null : playerId);
  };

  const handleGenerateHighlight = () => {
    if (!selectedPlayer) return;
    console.log('[PlayerPage] 生成个人集锦:', selectedPlayer.name);
    Taro.showToast({
      title: `正在生成${selectedPlayer.name}的集锦...`,
      icon: 'loading',
      duration: 2000
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder='搜索球员姓名或位置'
          value={searchText}
          onInput={e => setSearchText(e.detail.value)}
        />
      </View>

      <View className={styles.statsBar}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{players.length}</Text>
          <Text className={styles.statLabel}>球员总数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{players.filter(p => p.parentConsent).length}</Text>
          <Text className={styles.statLabel}>已授权</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{players.filter(p => p.isMinor).length}</Text>
          <Text className={styles.statLabel}>未成年人</Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>球员名单</Text>

      {filteredPlayers.map(player => (
        <View key={player.id}>
          <View className={styles.playerCard} onClick={() => handlePlayerClick(player.id)}>
            <View style={{ position: 'relative' }}>
              <Image className={styles.playerAvatar} src={player.avatar} mode='aspectFill' />
              <View className={styles.numberBadge}>{player.number}</View>
            </View>
            <View className={styles.playerInfo}>
              <Text className={styles.playerName}>{player.name}</Text>
              <Text className={styles.playerPosition}>{player.position}</Text>
              <Text className={styles.playerStats}>
                精彩片段 {getVideosByPlayer(player.id).length} 条
              </Text>
            </View>
            <View className={classnames(
              styles.consentStatus,
              player.parentConsent ? styles.consented : styles.notConsented
            )}>
              {player.parentConsent ? '✓ 已授权' : '⚠ 待授权'}
            </View>
          </View>

          {selectedPlayerId === player.id && playerVideos.length > 0 && (
            <View className={styles.highlightSection}>
              <Text style={{ fontSize: 30, fontWeight: 600, marginBottom: 16 }}>
                {player.name} 的精彩片段
              </Text>
              {playerVideos.slice(0, 3).map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
              <Button className={styles.generateBtn} onClick={handleGenerateHighlight}>
                🎬 生成个人集锦
              </Button>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default PlayerPage;
