export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/create/index',
    'pages/album/index',
    'pages/mine/index',
    'pages/clip/index',
    'pages/player/index',
    'pages/interaction/index',
    'pages/parent/index',
    'pages/chat/index',
    'pages/season/index',
    'pages/verify/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF6B35',
    navigationBarTitleText: '星队高光',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F7F8FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/create/index',
        text: '创作'
      },
      {
        pagePath: 'pages/album/index',
        text: '相册'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
