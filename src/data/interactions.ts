import type { Comment, Message, DownloadRequest, User } from '@/types';

export const currentUser: User = {
  id: 'u1',
  name: '陈浩然爸爸',
  avatar: 'https://picsum.photos/id/64/200/200',
  role: 'parent',
  teamId: 't1',
  isVerified: true,
  minorVisibleRange: 'team',
  allowExternalShare: false,
  parentConsentCollected: true
};

export const comments: Comment[] = [
  {
    id: 'c1',
    videoId: 'v1',
    userId: 'u2',
    userName: '刘子轩妈妈',
    userAvatar: 'https://picsum.photos/id/91/200/200',
    content: '这脚射门太漂亮了！角度刁钻，力量十足！浩然太棒了！',
    time: '2024-03-15 17:20',
    likeCount: 12
  },
  {
    id: 'c2',
    videoId: 'v1',
    userId: 'u3',
    userName: '李明教练',
    userAvatar: 'https://picsum.photos/id/177/200/200',
    content: '这次进攻配合非常流畅，从中场组织到最后射门，每个环节都很到位。继续保持！',
    time: '2024-03-15 18:05',
    likeCount: 25
  },
  {
    id: 'c3',
    videoId: 'v1',
    userId: 'u4',
    userName: '王梓涵爸爸',
    userAvatar: 'https://picsum.photos/id/338/200/200',
    content: '梓涵的传球也很关键，视野开阔！',
    time: '2024-03-15 19:30',
    likeCount: 8
  },
  {
    id: 'c4',
    videoId: 'v3',
    userId: 'u5',
    userName: '张天佑妈妈',
    userAvatar: 'https://picsum.photos/id/1027/200/200',
    content: '天佑这个扑救太关键了！反应神速！',
    time: '2024-03-22 18:00',
    likeCount: 34
  },
  {
    id: 'c5',
    videoId: 'v8',
    userId: 'u6',
    userName: '周逸辰爸爸',
    userAvatar: 'https://picsum.photos/id/177/200/200',
    content: '连续过了三个人！技术太棒了！',
    time: '2024-04-12 18:30',
    likeCount: 45
  }
];

export const messages: Message[] = [
  {
    id: 'msg1',
    fromUserId: 'u1',
    fromUserName: '陈浩然爸爸',
    fromUserAvatar: 'https://picsum.photos/id/64/200/200',
    toUserId: 'u_coach',
    content: '李教练您好，浩然最近训练状态怎么样？',
    time: '2024-04-20 09:15',
    isRead: true
  },
  {
    id: 'msg2',
    fromUserId: 'u_coach',
    fromUserName: '李明教练',
    fromUserAvatar: 'https://picsum.photos/id/177/200/200',
    toUserId: 'u1',
    content: '浩然状态很好！射门精度提升明显，建议在家可以多练练腿部力量。',
    time: '2024-04-20 09:45',
    isRead: true
  },
  {
    id: 'msg3',
    fromUserId: 'u1',
    fromUserName: '陈浩然爸爸',
    fromUserAvatar: 'https://picsum.photos/id/64/200/200',
    toUserId: 'u_coach',
    content: '好的，谢谢您！我们会配合的。',
    time: '2024-04-20 10:00',
    isRead: false
  }
];

export const downloadRequests: DownloadRequest[] = [
  {
    id: 'dr1',
    videoId: 'v1',
    videoTitle: '陈浩然精彩远射破门',
    userId: 'u1',
    userName: '陈浩然爸爸',
    status: 'approved',
    requestTime: '2024-03-16 10:00'
  },
  {
    id: 'dr2',
    videoId: 'v8',
    videoTitle: '周逸辰连续过人精彩表现',
    userId: 'u1',
    userName: '陈浩然爸爸',
    status: 'pending',
    requestTime: '2024-04-13 14:30'
  }
];

export const getCommentsByVideo = (videoId: string): Comment[] => {
  return comments.filter(c => c.videoId === videoId);
};

export const coachInfo = {
  id: 'u_coach',
  name: '李明教练',
  avatar: 'https://picsum.photos/id/177/200/200',
  role: 'coach' as const
};
