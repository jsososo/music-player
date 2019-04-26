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
    isSys: true, // 是否为用户的分类
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
  selectedSongs: { // 选中的歌曲，要进行批量操作的
    val: {},
    len: 0,
  },
  downSettingDialog: '',
  downloadList: {
    list: [],
    count: 0,
  },
  radioInfo: { // 电台信息
    radioMap: {}, // 全部的电台信息
    tag: {}, // 电台分类
    selected: {
      tagId: 48,
    },
    playing: {
      tagId: 48,
    },
    isPlay: false, // 是否在播放电台
    show: false, // 是否展示电台
  }
};