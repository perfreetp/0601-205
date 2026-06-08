import { create } from 'zustand';
import type { User, VideoClip, Comment, Message, DownloadRequest, ActionType } from '@/types';
import { currentUser as defaultUser, comments as defaultComments, messages as defaultMessages, downloadRequests as defaultDownloadRequests } from '@/data/interactions';
import { videos as defaultVideos } from '@/data/videos';

export interface ClipDraft {
  startTime: string;
  endTime: string;
  subtitle: string;
  videoTempPath?: string;
}

interface AppState {
  currentUser: User;
  videos: VideoClip[];
  comments: Comment[];
  messages: Message[];
  downloadRequests: DownloadRequest[];
  likedVideos: Set<string>;
  clipDraft: ClipDraft | null;

  toggleLike: (videoId: string) => void;
  addComment: (videoId: string, content: string) => void;
  sendMessage: (content: string) => void;
  requestDownload: (videoId: string, videoTitle: string) => void;
  updateUserSetting: <K extends keyof User>(key: K, value: User[K]) => void;
  setClipDraft: (draft: ClipDraft | null) => void;
  addVideo: (data: {
    title: string;
    actionType: ActionType;
    playerIds: string[];
    scoreText?: string;
    allowShare: boolean;
    minorVisible: boolean;
    matchId?: string;
    thumbnail?: string;
    duration?: number;
  }) => void;
  verifyUser: (data: { teamId?: string; role: User['role'] }) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: defaultUser,
  videos: defaultVideos,
  comments: defaultComments,
  messages: defaultMessages,
  downloadRequests: defaultDownloadRequests,
  likedVideos: new Set(['v1', 'v3']),
  clipDraft: null,

  toggleLike: (videoId: string) => {
    const { likedVideos, videos } = get();
    const newLiked = new Set(likedVideos);
    const videoIndex = videos.findIndex(v => v.id === videoId);
    if (videoIndex === -1) return;

    const newVideos = [...videos];
    if (newLiked.has(videoId)) {
      newLiked.delete(videoId);
      newVideos[videoIndex] = { ...newVideos[videoIndex], likeCount: Math.max(0, newVideos[videoIndex].likeCount - 1) };
    } else {
      newLiked.add(videoId);
      newVideos[videoIndex] = { ...newVideos[videoIndex], likeCount: newVideos[videoIndex].likeCount + 1 };
    }
    set({ likedVideos: newLiked, videos: newVideos });
  },

  addComment: (videoId: string, content: string) => {
    const { comments, currentUser, videos } = get();
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
    const videoIdx = videos.findIndex(v => v.id === videoId);
    const newVideos = [...videos];
    if (videoIdx !== -1) {
      newVideos[videoIdx] = { ...newVideos[videoIdx], commentCount: newVideos[videoIdx].commentCount + 1 };
    }
    set({ comments: [newComment, ...comments], videos: newVideos });
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
  },

  setClipDraft: (draft) => {
    set({ clipDraft: draft });
  },

  addVideo: (data) => {
    const { currentUser, videos } = get();
    const newVideo: VideoClip = {
      id: `v_${Date.now()}`,
      title: data.title,
      thumbnail: data.thumbnail || 'https://picsum.photos/id/1058/400/300',
      duration: data.duration || 15,
      videoUrl: '',
      matchId: data.matchId,
      playerIds: data.playerIds,
      actionType: data.actionType,
      scoreText: data.scoreText,
      uploaderId: currentUser.id,
      uploaderName: currentUser.name,
      uploadTime: new Date().toLocaleString('zh-CN'),
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      allowShare: data.allowShare,
      minorVisible: data.minorVisible
    };
    set({ videos: [newVideo, ...videos], clipDraft: null });
  },

  verifyUser: (data) => {
    const { currentUser } = get();
    set({
      currentUser: {
        ...currentUser,
        teamId: data.teamId ?? currentUser.teamId,
        role: data.role,
        isVerified: true
      }
    });
  }
}));
