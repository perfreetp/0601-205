import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { actionTypeLabels } from '@/data/videos';
import { getMatchesByTeam } from '@/data/matches';
import { currentTeamId } from '@/data/teams';
import { getPlayerById } from '@/data/players';
import styles from './index.module.scss';

type ScopeType = 'match' | 'training';

interface TrainingOption {
  key: string;
  date: string;
  topic: string;
}

const CollectionPage: React.FC = () => {
  const { videos, collections, createCollection } = useAppStore();
  const teamMatches = getMatchesByTeam(currentTeamId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scopeType, setScopeType] = useState<ScopeType>('match');
  const [selectedMatchId, setSelectedMatchId] = useState<string>(teamMatches[0]?.id || '');
  const [selectedTrainingKey, setSelectedTrainingKey] = useState<string>('');
  const [prevScopeKey, setPrevScopeKey] = useState<string>('');

  const trainingOptions = useMemo<TrainingOption[]>(() => {
    const map: Record<string, TrainingOption> = {};
    videos
      .filter(v => !v.matchId)
      .forEach(v => {
        const date = v.trainingDate || '未知日期';
        const topic = v.trainingTopic || '日常训练';
        const key = `${date}_${topic}`;
        if (!map[key]) {
          map[key] = { key, date, topic };
        }
      });
    return Object.values(map).sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [videos]);

  const currentScopeKey = `${scopeType}_${scopeType === 'match' ? selectedMatchId : selectedTrainingKey}`;

  const scopeChanged = currentScopeKey !== prevScopeKey && prevScopeKey !== '';

  const filteredVideos = useMemo(() => {
    if (scopeType === 'match') {
      return videos.filter(v => v.matchId === selectedMatchId);
    }
    if (!selectedTrainingKey) return [];
    const [date, topic] = selectedTrainingKey.split('_');
    return videos.filter(v => !v.matchId && v.trainingDate === date && (v.trainingTopic || '日常训练') === topic);
  }, [videos, scopeType, selectedMatchId, selectedTrainingKey]);

  const sortedVideos = useMemo(() => {
    return [...filteredVideos].sort((a, b) => (a.uploadTime < b.uploadTime ? -1 : 1));
  }, [filteredVideos]);

  const handleScopeChange = (nextScopeType: ScopeType, nextId: string) => {
    const nextKey = `${nextScopeType}_${nextId}`;
    if (nextKey === currentScopeKey) return;
    if (selectedIds.length > 0) {
      Taro.showModal({
        title: '切换整理范围',
        content: '当前已勾选片段，切换范围会清空选择，是否继续？',
        confirmText: '继续切换',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            setSelectedIds([]);
            setScopeType(nextScopeType);
            if (nextScopeType === 'match') setSelectedMatchId(nextId);
            else setSelectedTrainingKey(nextId);
            setPrevScopeKey(nextKey);
          }
        }
      });
    } else {
      setScopeType(nextScopeType);
      if (nextScopeType === 'match') setSelectedMatchId(nextId);
      else setSelectedTrainingKey(nextId);
      setPrevScopeKey(nextKey);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedVideos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedVideos.map(v => v.id));
    }
  };

  const handleCreate = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入合集标题', icon: 'none' });
      return;
    }
    if (selectedIds.length === 0) {
      Taro.showToast({ title: '请至少选择一个片段', icon: 'none' });
      return;
    }
    if (scopeType === 'training' && !selectedTrainingKey) {
      Taro.showToast({ title: '请选择具体训练日', icon: 'none' });
      return;
    }
    const orderedIds = sortedVideos
      .filter(v => selectedIds.includes(v.id))
      .map(v => v.id);
    const firstVideo = videos.find(v => v.id === orderedIds[0]);
    createCollection({
      title: title.trim(),
      description: description.trim() || undefined,
      videoIds: orderedIds,
      matchId: scopeType === 'match' ? selectedMatchId : undefined,
      trainingDate: scopeType === 'training' && selectedTrainingKey ? selectedTrainingKey.split('_')[0] : undefined
    });
    Taro.showToast({ title: '合集创建成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const getVideoMeta = (video: typeof videos[number]) => {
    const names = video.playerIds
      .map(id => getPlayerById(id)?.name)
      .filter(Boolean)
      .slice(0, 2)
      .join('、');
    return `${actionTypeLabels[video.actionType] || '其他'} · ${names || '未标记'}`;
  };

  return (
    <View className={styles.page}>
      <View className={styles.headerCard}>
        <Text className={styles.headerTitle}>🎬 整理片段合集</Text>
        <Text className={styles.headerSub}>先选择整理范围，再勾选同一场比赛或训练日的片段</Text>
      </View>

      <ScrollView scrollY>
        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.label}>合集标题</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                placeholder='例如：对阵猛虎队比赛精华'
                value={title}
                onInput={e => setTitle(e.detail.value)}
              />
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.label}>简介（选填）</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                placeholder='简单描述这个合集的内容'
                value={description}
                onInput={e => setDescription(e.detail.value)}
              />
            </View>
          </View>
        </View>

        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.label}>整理范围</Text>
            <View className={styles.scopeSwitch}>
              <View
                className={classnames(styles.scopeSwitchItem, scopeType === 'match' && styles.scopeSwitchActive)}
                onClick={() => teamMatches[0] && handleScopeChange('match', teamMatches[0].id)}
              >
                🏆 正式比赛
              </View>
              <View
                className={classnames(styles.scopeSwitchItem, scopeType === 'training' && styles.scopeSwitchActive)}
                onClick={() => trainingOptions[0] && handleScopeChange('training', trainingOptions[0].key)}
              >
                🏋️ 训练日
              </View>
            </View>
          </View>

          {scopeType === 'match' && (
            <View className={styles.formItem}>
              <Text className={styles.label}>选择比赛</Text>
              <View className={styles.optionList}>
                {teamMatches.map(match => (
                  <View
                    key={match.id}
                    className={classnames(styles.optionItem, selectedMatchId === match.id && styles.optionItemActive)}
                    onClick={() => handleScopeChange('match', match.id)}
                  >
                    <View className={styles.optionInfo}>
                      <Text className={styles.optionTitle}>{match.title}</Text>
                      <Text className={styles.optionSub}>
                        📅 {match.date} · VS {match.opponent} · {match.ourScore}-{match.opponentScore}
                      </Text>
                    </View>
                    {selectedMatchId === match.id && <Text className={styles.optionCheck}>✓</Text>}
                  </View>
                ))}
              </View>
            </View>
          )}

          {scopeType === 'training' && (
            <View className={styles.formItem}>
              <Text className={styles.label}>选择训练日</Text>
              {trainingOptions.length === 0 ? (
                <Text className={styles.emptyHint}>暂无训练日片段</Text>
              ) : (
                <View className={styles.optionList}>
                  {trainingOptions.map(opt => (
                    <View
                      key={opt.key}
                      className={classnames(styles.optionItem, selectedTrainingKey === opt.key && styles.optionItemActive)}
                      onClick={() => handleScopeChange('training', opt.key)}
                    >
                      <View className={styles.optionInfo}>
                        <Text className={styles.optionTitle}>📅 {opt.date}</Text>
                        <Text className={styles.optionSub}>🎯 {opt.topic}</Text>
                      </View>
                      {selectedTrainingKey === opt.key && <Text className={styles.optionCheck}>✓</Text>}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <View className={styles.formCard}>
          <View className={styles.selectedCount}>
            <Text className={styles.countText}>
              已选择 <Text className={styles.countNum}>{selectedIds.length}</Text> 个片段
              （范围共 {sortedVideos.length} 条）
            </Text>
            <Text className={styles.selectAllBtn} onClick={toggleSelectAll}>
              {selectedIds.length === sortedVideos.length && sortedVideos.length > 0 ? '取消全选' : '全选'}
            </Text>
          </View>
          {sortedVideos.length === 0 ? (
            <Text className={styles.emptyHint}>此范围暂无片段</Text>
          ) : (
            <View className={styles.videoList}>
              {sortedVideos.map((video, idx) => (
                <View
                  key={video.id}
                  className={classnames(styles.videoSelectItem, selectedIds.includes(video.id) && styles.videoSelected)}
                  onClick={() => toggleSelect(video.id)}
                >
                  <View className={styles.videoOrder}>#{idx + 1}</View>
                  <View className={classnames(styles.checkBox, selectedIds.includes(video.id) && styles.checkBoxChecked)}>
                    {selectedIds.includes(video.id) && <Text className={styles.checkIcon}>✓</Text>}
                  </View>
                  <Image className={styles.videoThumb} src={video.thumbnail} mode='aspectFill' />
                  <View className={styles.videoInfo}>
                    <Text className={styles.videoTitle}>{video.title}</Text>
                    <Text className={styles.videoMeta}>
                      {video.uploadTime} · {getVideoMeta(video)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {collections.length > 0 && (
          <View className={styles.collectionList}>
            <View className={styles.collectionHeader}>
              <Text className={styles.collectionTitle}>已有合集</Text>
            </View>
            {collections.map(col => (
              <View
                key={col.id}
                className={styles.collectionItem}
                onClick={() => Taro.navigateTo({ url: `/pages/collectionDetail/index?id=${col.id}` })}
              >
                <Image className={styles.collectionCover} src={col.cover} mode='aspectFill' />
                <View className={styles.collectionInfo}>
                  <Text className={styles.collectionName}>{col.title}</Text>
                  <Text className={styles.collectionDesc}>
                    {col.videoIds.length}条片段 · {col.createdAt}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={styles.cancelBtn} onClick={() => Taro.navigateBack()}>取消</Button>
        <Button
          className={classnames(styles.confirmBtn, selectedIds.length === 0 && styles.confirmBtnDisabled)}
          onClick={handleCreate}
        >
          创建合集（{selectedIds.length}）
        </Button>
      </View>
    </View>
  );
};

export default CollectionPage;
