import React, { useState } from 'react';
import { View, Text, Switch, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import styles from './index.module.scss';

const statusLabels: Record<string, string> = {
  pending: '审核中',
  approved: '已通过',
  rejected: '已拒绝'
};

const ParentPage: React.FC = () => {
  const { currentUser, updateUserSetting, downloadRequests } = useAppStore();
  const [visibleRange, setVisibleRange] = useState(currentUser.minorVisibleRange);
  const [allowShare, setAllowShare] = useState(currentUser.allowExternalShare);

  const handleVisibleRangeChange = (range: 'all' | 'team' | 'none') => {
    setVisibleRange(range);
    updateUserSetting('minorVisibleRange', range);
    Taro.showToast({ title: '设置已保存', icon: 'success' });
  };

  const handleShareToggle = (value: boolean) => {
    setAllowShare(value);
    updateUserSetting('allowExternalShare', value);
    Taro.showToast({ title: value ? '已开启外部转发' : '已屏蔽外部转发', icon: 'success' });
  };

  const handleConsent = () => {
    if (currentUser.parentConsentCollected) {
      Taro.showToast({ title: '您已完成授权', icon: 'none' });
      return;
    }
    updateUserSetting('parentConsentCollected', true);
    Taro.showToast({ title: '授权成功！', icon: 'success' });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.noticeCard}>
        <Text className={styles.noticeTitle}>🛡️ 未成年人保护</Text>
        <Text className={styles.noticeText}>
          我们重视未成年人的隐私保护。所有涉及未成年人的视频均需家长授权方可发布，默认仅队内成员可见。
        </Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>👁️ 未成年人可见范围</Text>
        <View className={styles.settingCard}>
          <View className={styles.settingItem}>
            <View className={styles.setItem}>
              <Text className={styles.setTitle}>设置哪些人可以看到未成年球员的视频</Text>
              <Text className={styles.setDesc}>保护未成年球员隐私，建议仅队内可见</Text>
              <View className={styles.radioGroup}>
                <View
                  className={classnames(styles.radioItem, visibleRange === 'all' && styles.activeRadio)}
                  onClick={() => handleVisibleRangeChange('all')}
                >
                  所有人可见
                </View>
                <View
                  className={classnames(styles.radioItem, visibleRange === 'team' && styles.activeRadio)}
                  onClick={() => handleVisibleRangeChange('team')}
                >
                  仅队内可见
                </View>
                <View
                  className={classnames(styles.radioItem, visibleRange === 'none' && styles.activeRadio)}
                  onClick={() => handleVisibleRangeChange('none')}
                >
                  仅自己可见
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>🔒 转发控制</Text>
        <View className={styles.settingCard}>
          <View className={styles.settingItem}>
            <View className={styles.setItem}>
              <Text className={styles.setTitle}>屏蔽外部转发</Text>
              <Text className={styles.setDesc}>开启后，队内视频不能转发到微信、朋友圈等外部平台</Text>
            </View>
            <Switch checked={!allowShare} onChange={e => handleShareToggle(!e.detail.value)} color='#FF6B35' />
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📥 下载申请记录</Text>
        <View className={styles.settingCard}>
          {downloadRequests.length > 0 ? (
            <View className={styles.downloadList}>
              {downloadRequests.map(req => (
                <View key={req.id} className={styles.downloadItem}>
                  <View className={styles.downloadInfo}>
                    <Text className={styles.downloadTitle}>{req.videoTitle}</Text>
                    <Text className={styles.downloadTime}>{req.requestTime}</Text>
                  </View>
                  <View className={classnames(
                    styles.statusBadge,
                    req.status === 'pending' && styles.statusPending,
                    req.status === 'approved' && styles.statusApproved,
                    req.status === 'rejected' && styles.statusRejected
                  )}>
                    {statusLabels[req.status]}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ padding: 40, textAlign: 'center', color: '#86909C' }}>
              📭 暂无下载申请
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📝 家长授权</Text>
        <View className={styles.consentCard}>
          <Text className={styles.consentTitle}>未成年人肖像权及隐私权授权</Text>
          <Text className={styles.consentText}>
            本人作为未成年球员的法定监护人，同意并授权：{'\n'}
            1. 球队拍摄、录制包含孩子肖像的训练和比赛视频；{'\n'}
            2. 视频在本平台队内范围内分享；{'\n'}
            3. 教练和球队管理员对视频进行剪辑、标注等编辑处理；{'\n'}
            4. 本人理解并同意以上内容，可随时申请撤回授权。
          </Text>
          <Button
            className={classnames(styles.consentBtn, currentUser.parentConsentCollected && styles.consentedBtn)}
            onClick={handleConsent}
          >
            {currentUser.parentConsentCollected ? '✅ 已完成授权' : '✍️ 我已阅读并同意授权'}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

export default ParentPage;
