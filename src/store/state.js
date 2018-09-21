export default {
  sysTags: [],
  allSongs: {},
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
};