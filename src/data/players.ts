import type { Player } from '@/types';

export const players: Player[] = [
  { id: 'p1', name: '陈浩然', avatar: 'https://picsum.photos/id/64/200/200', number: 10, position: '前锋', teamId: 't1', isMinor: true, parentConsent: true },
  { id: 'p2', name: '刘子轩', avatar: 'https://picsum.photos/id/91/200/200', number: 7, position: '边锋', teamId: 't1', isMinor: true, parentConsent: true },
  { id: 'p3', name: '王梓涵', avatar: 'https://picsum.photos/id/177/200/200', number: 8, position: '中场', teamId: 't1', isMinor: true, parentConsent: true },
  { id: 'p4', name: '李铭宇', avatar: 'https://picsum.photos/id/338/200/200', number: 5, position: '后卫', teamId: 't1', isMinor: true, parentConsent: false },
  { id: 'p5', name: '张天佑', avatar: 'https://picsum.photos/id/1027/200/200', number: 1, position: '守门员', teamId: 't1', isMinor: true, parentConsent: true },
  { id: 'p6', name: '赵俊熙', avatar: 'https://picsum.photos/id/64/200/200', number: 11, position: '前锋', teamId: 't1', isMinor: true, parentConsent: true },
  { id: 'p7', name: '孙子豪', avatar: 'https://picsum.photos/id/91/200/200', number: 4, position: '后卫', teamId: 't1', isMinor: true, parentConsent: true },
  { id: 'p8', name: '周逸辰', avatar: 'https://picsum.photos/id/177/200/200', number: 6, position: '中场', teamId: 't1', isMinor: true, parentConsent: false },
  { id: 'p9', name: '吴雨泽', avatar: 'https://picsum.photos/id/338/200/200', number: 9, position: '中锋', teamId: 't1', isMinor: true, parentConsent: true },
  { id: 'p10', name: '郑皓文', avatar: 'https://picsum.photos/id/1027/200/200', number: 3, position: '左后卫', teamId: 't1', isMinor: true, parentConsent: true }
];

export const getPlayerById = (id: string): Player | undefined => {
  return players.find(p => p.id === id);
};

export const getPlayersByTeam = (teamId: string): Player[] => {
  return players.filter(p => p.teamId === teamId);
};
