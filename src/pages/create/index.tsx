import React, { useState, useMemo } from 'react';
import { useDidShow } from '@tarojs/taro';
import { View, Text, Image, Input, ScrollView, Switch, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { getPlayersByTeam } from '@/data/players';
import { getMatchesByTeam } from '@/data/matches';
import { actionTypeLabels } from '@/data/videos';
import { currentTeamId } from '@/data/teams';
import { useAppStore } from '@/store/useAppStore';
import type { ActionType } from '@/types';
import styles from './index.module.scss';

const parseTimeToSeconds = (time: string): number => {
  const parts = time.split(':');
  if (parts.length !== 2) return 0;
  const mm = parseInt(parts[0], 10);
  const ss = parseInt(parts[1], 10);
  if (isNaN(mm) || isNaN(ss)) return 0;
  return mm * 60 + ss;
};

const CreatePage: React.FC = () => {
  const players = getPlayersByTeam(currentTeamId);
  const teamMatches = getMatchesByTeam(currentTeamId);
  const { currentUser, clipDraft, addVideo } = useAppStore();

  const [title, setTitle] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [ourScore, setOurScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');
  const [allowShare, setAllowShare] = useState(false);
  const [minorVisible, setMinorVisible] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [isTraining, setIsTraining] = useState(true);
  const [draftApplied, setDraftApplied] = useState(false);
  const [clipStartTime, setClipStartTime] = useState('');
  const [clipEndTime, setClipEndTime] = useState('');

  const clipDuration = useMemo(() => {
    if (!clipStartTime || !clipEndTime) return 0;
    const start = parseTimeToSeconds(clipStartTime);
    const end = parseTimeToSeconds(clipEndTime);
    return Math.max(1, end - start);
  }, [clipStartTime, clipEndTime]);

  useDidShow(() => {
    if (clipDraft && !draftApplied) {
      console.log('[CreatePage] 接收到剪辑数据:', clipDraft);
      setClipStartTime(clipDraft.startTime);
      setClipEndTime(clipDraft.endTime);
      if (clipDraft.subtitle && clipDraft.subtitle.includes('-')) {
        const parts = clipDraft.subtitle.split('-');
        if (parts.length === 2) {
          setOurScore(parts[0]);
          setOpponentScore(parts[1]);
        }
      }
      setDraftApplied(true);
      Taro.showToast({ title: '剪辑信息已带入', icon: 'success' });
    }
  });

  const handleTogglePlayer = (playerId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleChooseVideo = () => {
    console.log('[CreatePage] 选择视频');
    Taro.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      success: (res) => {
        console.log('[CreatePage] 视频选择成功:', res.tempFilePath);
        Taro.navigateTo({
          url: '/pages/clip/index'
        });
      },
      fail: (err) => {
        console.error('[CreatePage] 视频选择失败:', err);
      }
    });
  };

  const handleRecordVideo = () => {
    console.log('[CreatePage] 录制视频');
    Taro.chooseVideo({
      sourceType: ['camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        console.log('[CreatePage] 视频录制成功:', res.tempFilePath);
        Taro.navigateTo({
          url: '/pages/clip/index'
        });
      },
      fail: (err) => {
        console.error('[CreatePage] 视频录制失败:', err);
      }
    });
  };

  const handleGenerateHighlight = () => {
    console.log('[CreatePage] 生成个人集锦');
    Taro.showToast({
      title: '集锦生成中...',
      icon: 'loading',
      duration: 2000
    });
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入视频标题', icon: 'none' });
      return;
    }
    if (!selectedAction) {
      Taro.showToast({ title: '请选择动作类型', icon: 'none' });
      return;
    }
    if (selectedPlayers.length === 0) {
      Taro.showToast({ title: '请选择相关球员', icon: 'none' });
      return;
    }
    if (!isTraining && !selectedMatch) {
      Taro.showToast({ title: '请选择关联比赛', icon: 'none' });
      return;
    }
    const scoreText = ourScore && opponentScore ? `${ourScore}-${opponentScore}` : undefined;
    addVideo({
      title: title.trim(),
      actionType: selectedAction as ActionType,
      playerIds: selectedPlayers,
      scoreText,
      allowShare,
      minorVisible,
      matchId: isTraining ? undefined : selectedMatch,
      duration: clipDuration > 0 ? clipDuration : undefined
    });
    console.log('[CreatePage] 视频已发布，时长:', clipDuration, '比赛:', isTraining ? '训练日' : selectedMatch);
    setDraftApplied(false);
    Taro.showToast({ title: '发布成功！', icon: 'success' });
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/home/index' });
    }, 1500);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.heroSection}>
        <Text className={styles.heroTitle}>✨ 记录每一个精彩瞬间</Text>
        <Text className={styles.heroDesc}>上传训练和比赛视频，与队友家长分享高光时刻</Text>
      </View>

      <View className={styles.uploadGrid}>
        <View className={styles.uploadCard} onClick={handleRecordVideo}>
          <Text className={styles.uploadIcon}>🎥</Text>
          <Text className={styles.uploadTitle}>拍摄视频</Text>
          <Text className={styles.uploadDesc}>现场录制精彩片段</Text>
        </View>
        <View className={styles.uploadCard} onClick={handleChooseVideo}>
          <Text className={styles.uploadIcon}>📁</Text>
          <Text className={styles.uploadTitle}>从相册选择</Text>
          <Text className={styles.uploadDesc}>上传已拍摄的视频</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>视频信息</Text>
        <View className={styles.formCard}>
          {clipStartTime && clipEndTime && (
            <View className={styles.formItem}>
              <Text className={styles.label}>剪辑片段</Text>
              <View className={styles.clipInfoCard}>
                <View className={styles.clipTimeRow}>
                  <View className={styles.clipTimeBox}>
                    <Text className={styles.clipTimeLabel}>开始</Text>
                    <Text className={styles.clipTimeValue}>{clipStartTime}</Text>
                  </View>
                  <Text className={styles.clipArrow}>→</Text>
                  <View className={styles.clipTimeBox}>
                    <Text className={styles.clipTimeLabel}>结束</Text>
                    <Text className={styles.clipTimeValue}>{clipEndTime}</Text>
                  </View>
                  <View className={styles.clipDurationBox}>
                    <Text className={styles.clipTimeLabel}>时长</Text>
                    <Text className={styles.clipTimeValue}>{clipDuration}秒</Text>
                  </View>
                </View>
                <View
                  className={styles.reClipBtn}
                  onClick={() => Taro.navigateTo({ url: '/pages/clip/index' })}
                >
                  重新剪辑
                </View>
              </View>
            </View>
          )}

          <View className={styles.formItem}>
            <Text className={styles.label}>视频标题</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                placeholder='请输入视频标题，如：陈浩然精彩远射'
                value={title}
                onInput={e => setTitle(e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>关联类型</Text>
            <View className={styles.typeSwitch}>
              <View
                className={classnames(styles.typeSwitchItem, isTraining && styles.typeSwitchActive)}
                onClick={() => { setIsTraining(true); setSelectedMatch(''); }}
              >
                🏋️ 训练日
              </View>
              <View
                className={classnames(styles.typeSwitchItem, !isTraining && styles.typeSwitchActive)}
                onClick={() => setIsTraining(false)}
              >
                🏆 正式比赛
              </View>
            </View>
          </View>

          {!isTraining && (
            <View className={styles.formItem}>
              <Text className={styles.label}>选择比赛</Text>
              <View className={styles.matchList}>
                {teamMatches.map(match => (
                  <View
                    key={match.id}
                    className={classnames(styles.matchItem, selectedMatch === match.id && styles.matchItemActive)}
                    onClick={() => setSelectedMatch(match.id)}
                  >
                    <View className={styles.matchInfo}>
                      <Text className={styles.matchTitle}>{match.title}</Text>
                      <Text className={styles.matchSub}>
                        {match.date} · VS {match.opponent} · {match.ourScore}-{match.opponentScore}
                      </Text>
                    </View>
                    {selectedMatch === match.id && <Text className={styles.matchCheck}>✓</Text>}
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className={styles.formItem}>
            <Text className={styles.label}>动作类型</Text>
            <View className={styles.actionTags}>
              {Object.entries(actionTypeLabels).map(([key, label]) => (
                <View
                  key={key}
                  className={classnames(styles.actionTagItem, selectedAction === key && styles.activeTag)}
                  onClick={() => setSelectedAction(key)}
                >
                  {label}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>关联球员（可多选）</Text>
            <View className={styles.playerList}>
              {players.map(player => (
                <View
                  key={player.id}
                  className={styles.playerItem}
                  onClick={() => handleTogglePlayer(player.id)}
                >
                  <View className={styles.playerAvatarWrap}>
                    <Image
                      className={classnames(styles.playerAvatar, selectedPlayers.includes(player.id) && styles.selectedAvatar)}
                      src={player.avatar}
                      mode='aspectFill'
                    />
                  </View>
                  <Text className={styles.playerName}>{player.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>比分字幕（可选）</Text>
            <View className={styles.scoreRow}>
              <Input
                className={styles.scoreInput}
                type='number'
                placeholder='我方'
                value={ourScore}
                onInput={e => setOurScore(e.detail.value)}
              />
              <Text className={styles.scoreDivider}>VS</Text>
              <Input
                className={styles.scoreInput}
                type='number'
                placeholder='对手'
                value={opponentScore}
                onInput={e => setOpponentScore(e.detail.value)}
              />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>隐私设置</Text>
        <View className={styles.formCard}>
          <View className={styles.switchRow}>
            <View>
              <Text className={styles.switchLabel}>允许队内分享</Text>
              <Text className={styles.switchDesc}>关闭后仅自己可见</Text>
            </View>
            <Switch checked={allowShare} onChange={e => setAllowShare(e.detail.value)} color='#FF6B35' />
          </View>
          <View className={styles.switchRow}>
            <View>
              <Text className={styles.switchLabel}>未成年人可见</Text>
              <Text className={styles.switchDesc}>未成年球员可观看此视频</Text>
            </View>
            <Switch checked={minorVisible} onChange={e => setMinorVisible(e.detail.value)} color='#FF6B35' />
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>快捷操作</Text>
        <View className={styles.formCard}>
          <View className={styles.uploadCard} onClick={handleGenerateHighlight} style={{ marginBottom: 0 }}>
            <Text className={styles.uploadIcon}>🎬</Text>
            <Text className={styles.uploadTitle}>生成个人集锦</Text>
            <Text className={styles.uploadDesc}>自动剪辑某位球员的精彩片段</Text>
          </View>
        </View>
      </View>

      <Button className={styles.submitBtn} onClick={handleSubmit}>
        发布视频
      </Button>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default CreatePage;
