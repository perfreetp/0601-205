import React, { useState } from 'react';
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { teams } from '@/data/teams';
import type { User } from '@/types';
import styles from './index.module.scss';

const roles: { key: User['role']; label: string }[] = [
  { key: 'player', label: '球员' },
  { key: 'parent', label: '家长' },
  { key: 'coach', label: '教练' }
];

const VerifyPage: React.FC = () => {
  const { currentUser, verifyUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'join' | 'code'>('join');
  const [selectedRole, setSelectedRole] = useState<User['role']>(currentUser.role);
  const [selectedTeam, setSelectedTeam] = useState(currentUser.teamId || '');
  const [playerName, setPlayerName] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [realName, setRealName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = () => {
    let finalTeamId = selectedTeam;

    if (activeTab === 'join') {
      if (!selectedTeam) {
        Taro.showToast({ title: '请选择队伍', icon: 'none' });
        return;
      }
      if (!realName.trim()) {
        Taro.showToast({ title: '请输入真实姓名', icon: 'none' });
        return;
      }
      if (selectedRole === 'parent' && !playerName.trim()) {
        Taro.showToast({ title: '请输入孩子姓名', icon: 'none' });
        return;
      }
    } else {
      const code = verifyCode.trim();
      if (!code) {
        Taro.showToast({ title: '请输入邀请码', icon: 'none' });
        return;
      }
      const matchedTeam = teams.find(t => t.joinCode.toUpperCase() === code.toUpperCase());
      if (!matchedTeam) {
        Taro.showToast({ title: '邀请码错误，请检查后重试', icon: 'none', duration: 2500 });
        return;
      }
      finalTeamId = matchedTeam.id;
      Taro.showToast({ title: `已匹配：${matchedTeam.name}`, icon: 'success', duration: 1000 });
    }

    console.log('[VerifyPage] 提交验证:', {
      activeTab,
      finalTeamId,
      selectedRole,
      realName,
      playerName,
      verifyCode
    });

    verifyUser({
      teamId: finalTeamId || undefined,
      role: selectedRole
    });

    setTimeout(() => {
      Taro.showToast({
        title: '验证成功！',
        icon: 'success',
        duration: 2000
      });
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/mine/index' });
      }, 1500);
    }, activeTab === 'code' ? 800 : 0);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      {currentUser.isVerified ? (
        <View className={classnames(styles.statusCard, styles.verifiedCard)}>
          <Text className={styles.statusIcon}>✅</Text>
          <Text className={styles.statusTitle}>已通过身份验证</Text>
          <Text className={styles.statusText}>
            您已通过验证，可在下方加入其他队伍或切换身份。
          </Text>
        </View>
      ) : (
        <View className={styles.statusCard}>
          <Text className={styles.statusIcon}>⏳</Text>
          <Text className={styles.statusTitle}>等待身份验证</Text>
          <Text className={styles.statusText}>
            完成以下验证后，即可解锁全部功能。{'\n'}
            验证通常在24小时内完成。
          </Text>
        </View>
      )}

      <View className={styles.tabs}>
        <View
          className={classnames(styles.tabItem, activeTab === 'join' && styles.activeTab)}
          onClick={() => setActiveTab('join')}
        >
          加入队伍
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'code' && styles.activeTab)}
          onClick={() => setActiveTab('code')}
        >
          邀请码加入
        </View>
      </View>

      {activeTab === 'join' ? (
        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.label}>选择身份</Text>
            <View className={styles.roleList}>
              {roles.map(role => (
                <View
                  key={role.key}
                  className={classnames(styles.roleItem, selectedRole === role.key && styles.activeRole)}
                  onClick={() => setSelectedRole(role.key)}
                >
                  {role.label}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>选择队伍</Text>
            <View className={styles.teamList}>
              {teams.map(team => (
                <View
                  key={team.id}
                  className={classnames(styles.teamItem, selectedTeam === team.id && styles.activeTeam)}
                  onClick={() => setSelectedTeam(team.id)}
                >
                  <Image className={styles.teamLogo} src={team.logo} mode='aspectFill' />
                  <View className={styles.teamInfo}>
                    <Text className={styles.teamName}>{team.name}</Text>
                    <Text className={styles.teamSport}>{team.sport} · {team.memberCount}人</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>真实姓名</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                placeholder='请输入您的真实姓名'
                value={realName}
                onInput={e => setRealName(e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>联系电话</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                type='number'
                placeholder='请输入联系电话'
                value={phone}
                onInput={e => setPhone(e.detail.value)}
              />
            </View>
          </View>

          {selectedRole === 'parent' && (
            <View className={styles.formItem}>
              <Text className={styles.label}>孩子姓名（球员）</Text>
              <View className={styles.inputWrap}>
                <Input
                  className={styles.input}
                  placeholder='请输入孩子的姓名'
                  value={playerName}
                  onInput={e => setPlayerName(e.detail.value)}
                />
              </View>
            </View>
          )}
        </View>
      ) : (
        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.label}>邀请码</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                placeholder='请输入教练或管理员提供的邀请码'
                value={verifyCode}
                onInput={e => setVerifyCode(e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.tipCard} style={{ marginTop: 0 }}>
            <Text className={styles.tipTitle}>💡 如何获取邀请码</Text>
            <Text className={styles.tipText}>
              邀请码由球队教练或管理员提供，{'\n'}
              通常会在家长会或训练时告知大家。{'\n'}
              如有疑问请直接联系教练。
            </Text>
          </View>
        </View>
      )}

      <Button className={styles.submitBtn} onClick={handleSubmit}>
        提交验证申请
      </Button>
    </ScrollView>
  );
};

export default VerifyPage;
