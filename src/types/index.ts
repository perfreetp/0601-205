export interface Team {
  id: string;
  name: string;
  logo: string;
  sport: string;
  description: string;
  memberCount: number;
  coachName: string;
  joinCode: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  number: number;
  position: string;
  teamId: string;
  isMinor: boolean;
  parentConsent: boolean;
}

export interface Match {
  id: string;
  title: string;
  opponent: string;
  date: string;
  location: string;
  ourScore: number;
  opponentScore: number;
  isWin: boolean;
  teamId: string;
  cover: string;
}

export type ActionType = 'goal' | 'assist' | 'defense' | 'dribble' | 'pass' | 'shoot' | 'save' | 'tackle' | 'other';

export interface VideoClip {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  videoUrl: string;
  matchId?: string;
  playerIds: string[];
  actionType: ActionType;
  scoreText?: string;
  uploaderId: string;
  uploaderName: string;
  uploadTime: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  allowShare: boolean;
  minorVisible: boolean;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  time: string;
  likeCount: number;
}

export interface Message {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId: string;
  content: string;
  time: string;
  isRead: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'player' | 'parent' | 'coach' | 'admin';
  teamId?: string;
  isVerified: boolean;
  minorVisibleRange: 'all' | 'team' | 'none';
  allowExternalShare: boolean;
  parentConsentCollected: boolean;
}

export interface DownloadRequest {
  id: string;
  videoId: string;
  videoTitle: string;
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestTime: string;
}

export interface PlayRank {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  viewCount: number;
  likeCount: number;
  clipCount: number;
}
