import type { Team } from '@/types';

export const teams: Team[] = [
  {
    id: 't1',
    name: '星耀少年足球队',
    logo: 'https://picsum.photos/id/1025/200/200',
    sport: '足球',
    description: '专注于青少年足球培训，培养热爱足球的未来之星。队伍成立于2020年，现有U10-U14五个年龄段队伍。',
    memberCount: 68,
    coachName: '李明教练',
    joinCode: 'STAR2024'
  },
  {
    id: 't2',
    name: '猎豹篮球队',
    logo: 'https://picsum.photos/id/1074/200/200',
    sport: '篮球',
    description: '青少年篮球训练营，注重团队配合与个人技术的全面发展。',
    memberCount: 45,
    coachName: '王强教练',
    joinCode: 'LEOPARD'
  },
  {
    id: 't3',
    name: '飞翔排球队',
    logo: 'https://picsum.photos/id/1062/200/200',
    sport: '排球',
    description: '专业青少年排球培训，从基础技术到战术配合全方位提升。',
    memberCount: 32,
    coachName: '张蕾教练',
    joinCode: 'FLY2024'
  }
];

export const currentTeamId = 't1';
