import React, { useState } from 'react';
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import styles from './index.module.scss';

const TOTAL_DURATION_SECONDS = 60;

const parseTimeToSeconds = (time: string): number => {
  const parts = time.split(':');
  if (parts.length !== 2) return -1;
  const mm = parseInt(parts[0], 10);
  const ss = parseInt(parts[1], 10);
  if (isNaN(mm) || isNaN(ss)) return -1;
  return mm * 60 + ss;
};

const ClipPage: React.FC = () => {
  const { setClipDraft } = useAppStore();
  const [startTime, setStartTime] = useState('00:05');
  const [endTime, setEndTime] = useState('00:20');
  const [subtitle, setSubtitle] = useState('2-0');
  const [isPlaying, setIsPlaying] = useState(false);

  const validateTimes = (): string | null => {
    const startSec = parseTimeToSeconds(startTime);
    const endSec = parseTimeToSeconds(endTime);

    if (startSec === -1) return '开始时间格式错误，请使用 MM:SS 格式';
    if (endSec === -1) return '结束时间格式错误，请使用 MM:SS 格式';
    if (startSec < 0) return '开始时间不能为负数';
    if (endSec <= startSec) return '结束时间必须晚于开始时间';
    if (startSec >= TOTAL_DURATION_SECONDS) return `开始时间超出视频时长（${TOTAL_DURATION_SECONDS}秒）`;
    if (endSec > TOTAL_DURATION_SECONDS) return `结束时间超出视频时长（${TOTAL_DURATION_SECONDS}秒）`;
    return null;
  };

  const handlePreview = () => {
    const err = validateTimes();
    if (err) {
      Taro.showToast({ title: err, icon: 'none' });
      return;
    }
    console.log('[ClipPage] 预览剪辑');
    setIsPlaying(!isPlaying);
  };

  const handleConfirm = () => {
    const err = validateTimes();
    if (err) {
      Taro.showToast({ title: err, icon: 'none' });
      return;
    }
    console.log('[ClipPage] 确认剪辑:', { startTime, endTime, subtitle });
    setClipDraft({ startTime, endTime, subtitle });
    Taro.showToast({
      title: '剪辑完成！',
      icon: 'success'
    });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.previewArea}>
        <Image
          className={styles.previewImg}
          src='https://picsum.photos/id/1058/800/450'
          mode='aspectFill'
        />
        <View className={styles.playBtn} onClick={handlePreview}>
          {isPlaying ? '⏸' : '▶'}
        </View>
        <Text className={styles.timeDisplay}>{startTime} - {endTime}</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>⏱️ 时间轴剪辑</Text>
        <View className={styles.timelineArea}>
          <View className={styles.timeline}>
            <View className={styles.timelineBar} />
            <View className={`${styles.timelineHandle} ${styles.leftHandle}`} />
            <View className={`${styles.timelineHandle} ${styles.rightHandle}`} />
          </View>
          <View className={styles.timelineLabels}>
            <Text>00:00</Text>
            <Text>00:15</Text>
            <Text>00:30</Text>
            <Text>00:45</Text>
            <Text>01:00</Text>
          </View>
          <View className={styles.timeInputs}>
            <View style={{ flex: 1 }}>
              <Text className={styles.timeLabel}>开始时间</Text>
              <Input
                className={styles.timeInput}
                value={startTime}
                onInput={e => setStartTime(e.detail.value)}
                placeholder='00:00'
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text className={styles.timeLabel}>结束时间</Text>
              <Input
                className={styles.timeInput}
                value={endTime}
                onInput={e => setEndTime(e.detail.value)}
                placeholder='00:15'
              />
            </View>
          </View>
          <View className={styles.btnGroup} style={{ marginTop: 24 }}>
            <Button className={styles.secondaryBtn}>重选</Button>
            <Button className={styles.primaryBtn} onClick={handlePreview}>预览</Button>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>🏷️ 比分字幕</Text>
        <View className={styles.subtitleSection}>
          <Input
            className={styles.subtitleInput}
            value={subtitle}
            onInput={e => setSubtitle(e.detail.value)}
            placeholder='输入比分，如 2-0'
          />
          <Text className={styles.sectionTitle} style={{ fontSize: 24, marginBottom: 16 }}>预览效果</Text>
          <View className={styles.subtitlePreview}>
            {subtitle || '比分预览'}
          </View>
        </View>
      </View>

      <Button className={styles.fullBtn} onClick={handleConfirm}>
        ✅ 确认剪辑并继续
      </Button>
    </ScrollView>
  );
};

export default ClipPage;
