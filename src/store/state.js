export default {
  sysTags: [],
  allSongs: {},
  userTags: [],
  userSongs: {},
  playNow: {
    cover: '',
  },
  playing: false,
  playingList: [],
  playerInfo: {
    duration: 0,
    current: 0,
    paused: true,
  },
  nPSTags: [], // 当前播放歌曲拥有的系统标签
  loading: false,
  showList: [],
  history: [],
  randomHistory: { // 随机播放历史
    list: [],
    index: -1,
  },
  tagInfo: {
    isSys: true,
    selected: '',
    playing: '',
  },
  sysSongs: {'安静': []},
  downloading: false,
  user: {},
  listContent: 0, // 右侧现实内容 0: 歌曲列表，1: 歌词
};