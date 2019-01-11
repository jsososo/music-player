export default {
  sysTags: [],
  allSongs: {},
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
  searchKey: '列表内', // 这是上面的搜索选项，列表內 || QQ音乐
  sysSongs: {},
  downloading: false,
  listContent: 0, // 右侧现实内容 0: 歌曲列表，1: 歌词
  favList: {}, // 我喜欢的歌曲
  add2Dir: {
    song: {},
    dir: {},
    add: true,
  },
  listLoading: false, // 歌曲列表的loading
};