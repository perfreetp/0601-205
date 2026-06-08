import { create } from 'zustand';
import type { User, VideoClip, Comment, Message, DownloadRequest } from '@/types';
import { currentUser as defaultUser, comments as defaultComments, messages as defaultMessages, downloadRequests as defaultDownloadRequests } from '@/data/interactions';
import { videos as defaultVideos } from '@/data/videos';

interface AppState {
  currentUser: User;
  videos: VideoClip[];
  comments: Comment[];
  messages: Message[];
  downloadRequests: DownloadRequest[];
  likedVideos: Set<string>;

  toggleLike: (videoId: string) => void;
  addComment: (videoId: string, content: string) => void;
  sendMessage: (content: string) => void;
  requestDownload: (videoId: string, videoTitle: string) => void;
  updateUserSetting: <K extends keyof User>(key: K, value: User[K]) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: defaultUser,
  videos: defaultVideos,
  comments: defaultComments,
  messages: defaultMessages,
  downloadRequests: defaultDownloadRequests,
  likedVideos: new Set(['v1', 'v3']),

  toggleLike: (videoId: string) => {
    const { likedVideos, videos } = get();
    const newLiked = new Set(likedVideos);
    const videoIndex = videos.findIndex(v => v.id === videoId);
    if (videoIndex === -1) return;

    const newVideos = [...videos];
    if (newLiked.has(videoId)) {
      newLiked.delete(videoId);
      newVideos[videoIndex] = { ...newVideos[videoIndex], likeCount: newVideos[videoIndex].likeCount - 1 };
    } else {
      newLiked.add(videoId);
      newVideos[videoIndex] = { ...newVideos[videoIndex], likeCount: newVideos[videoIndex].likeCount + 1 };
    }
    set({ likedVideos: newLiked, videos: newVideos });
  },

  addComment: (videoId: string, content: string) => {
    const { comments, currentUser } = get();
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      videoId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      time: new Date().toLocaleString('zh-CN'),
      likeCount: 0
    };
    set({ comments: [newComment, ...comments] });
  },

  sendMessage: (content: string) => {
    const { messages, currentUser } = get();
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserAvatar: currentUser.avatar,
      toUserId: 'u_coach',
      content,
      time: new Date().toLocaleString('zh-CN'),
      isRead: false
    };
    set({ messages: [...messages, newMessage] });
  },

  requestDownload: (videoId: string, videoTitle: string) => {
    const { downloadRequests, currentUser } = get();
    const newRequest: DownloadRequest = {
      id: `dr_${Date.now()}`,
      videoId,
      videoTitle,
      userId: currentUser.id,
      userName: currentUser.name,
      status: 'pending',
      requestTime: new Date().toLocaleString('zh-CN')
    };
    set({ downloadRequests: [newRequest, ...downloadRequests] });
  },

  updateUserSetting: <K extends keyof User>(key: K, value: User[K]) => {
    const { currentUser } = get();
    set({ currentUser: { ...currentUser, [key]: value } });
  }
}));
