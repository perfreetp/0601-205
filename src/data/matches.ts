import type { Match } from '@/types';

export const matches: Match[] = [
  {
    id: 'm1',
    title: '春季联赛第1轮',
    opponent: '阳光小学队',
    date: '2024-03-15',
    location: '市体育中心足球场',
    ourScore: 3,
    opponentScore: 1,
    isWin: true,
    teamId: 't1',
    cover: 'https://picsum.photos/id/1058/750/400'
  },
  {
    id: 'm2',
    title: '春季联赛第2轮',
    opponent: '飞翔少年队',
    date: '2024-03-22',
    location: '第二中学运动场',
    ourScore: 2,
    opponentScore: 2,
    isWin: false,
    teamId: 't1',
    cover: 'https://picsum.photos/id/1060/750/400'
  },
  {
    id: 'm3',
    title: '春季联赛第3轮',
    opponent: '猛虎青训队',
    date: '2024-03-29',
    location: '市体育中心足球场',
    ourScore: 4,
    opponentScore: 0,
    isWin: true,
    teamId: 't1',
    cover: 'https://picsum.photos/id/1025/750/400'
  },
  {
    id: 'm4',
    title: '春季联赛第4轮',
    opponent: '晨光足球俱乐部',
    date: '2024-04-05',
    location: '晨光俱乐部训练场',
    ourScore: 1,
    opponentScore: 2,
    isWin: false,
    teamId: 't1',
    cover: 'https://picsum.photos/id/1074/750/400'
  },
  {
    id: 'm5',
    title: '友谊赛',
    opponent: '红星小学队',
    date: '2024-04-12',
    location: '市体育中心足球场',
    ourScore: 5,
    opponentScore: 2,
    isWin: true,
    teamId: 't1',
    cover: 'https://picsum.photos/id/1062/750/400'
  },
  {
    id: 'm6',
    title: '春季联赛半决赛',
    opponent: '闪电青训营',
    date: '2024-04-19',
    location: '市体育中心主赛场',
    ourScore: 3,
    opponentScore: 2,
    isWin: true,
    teamId: 't1',
    cover: 'https://picsum.photos/id/1058/750/400'
  }
];

export const getMatchById = (id: string): Match | undefined => {
  return matches.find(m => m.id === id);
};

export const getMatchesByTeam = (teamId: string): Match[] => {
  return matches.filter(m => m.teamId === teamId);
};
