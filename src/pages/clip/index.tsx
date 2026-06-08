import React, { useState } from 'react';
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const ClipPage: React.FC = () => {
  const [startTime, setStartTime] = useState('00:05');
  const [endTime, setEndTime] = useState('00:20');
  const [subtitle, setSubtitle] = useState('2-0');
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePreview = () => {
    console.log('[ClipPage] 预览剪辑');
    setIsPlaying(!isPlaying);
  };

  const handleConfirm = () => {
    console.log('[ClipPage] 确认剪辑:', { startTime, endTime, subtitle });
    Taro.showToast({
      title: '剪辑完成！',
      icon: 'success'
    });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
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
