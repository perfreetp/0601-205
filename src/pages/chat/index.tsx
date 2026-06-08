import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { coachInfo } from '@/data/interactions';
import styles from './index.module.scss';

const ChatPage: React.FC = () => {
  const { currentUser, messages, sendMessage } = useAppStore();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<any>(null);

  const chatMessages = messages.filter(
    m => (m.fromUserId === currentUser.id && m.toUserId === coachInfo.id) ||
         (m.fromUserId === coachInfo.id && m.toUserId === currentUser.id)
  );

  useEffect(() => {
    console.log('[ChatPage] 消息数量:', chatMessages.length);
  }, [chatMessages.length]);

  const handleSend = () => {
    if (!inputText.trim()) {
      Taro.showToast({ title: '请输入消息内容', icon: 'none' });
      return;
    }
    sendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <View className={styles.page}>
      <View className={styles.coachHeader}>
        <Image className={styles.coachAvatar} src={coachInfo.avatar} mode='aspectFill' />
        <View className={styles.coachInfo}>
          <Text className={styles.coachName}>{coachInfo.name}</Text>
          <Text className={styles.coachRole}>球队主教练</Text>
        </View>
      </View>

      <ScrollView className={styles.chatArea} scrollY scrollIntoView='msg-bottom'>
        {chatMessages.map((msg, index) => {
          const isSelf = msg.fromUserId === currentUser.id;
          return (
            <View key={msg.id}>
              {index > 0 && (
                <Text className={styles.messageTime}>{msg.time}</Text>
              )}
              <View className={classnames(styles.messageItem, isSelf ? styles.self : styles.other)}>
                <Image
                  className={styles.avatar}
                  src={isSelf ? currentUser.avatar : coachInfo.avatar}
                  mode='aspectFill'
                />
                <View className={styles.bubble}>
                  <Text>{msg.content}</Text>
                </View>
              </View>
            </View>
          );
        })}
        <View id='msg-bottom' />
      </ScrollView>

      <View className={styles.inputBar}>
        <View className={styles.inputWrap}>
          <Input
            className={styles.messageInput}
            placeholder='输入消息...'
            value={inputText}
            onInput={e => setInputText(e.detail.value)}
            confirmType='send'
            onConfirm={handleSend}
          />
        </View>
        <Button className={styles.sendBtn} onClick={handleSend}>发送</Button>
      </View>
    </View>
  );
};

export default ChatPage;
