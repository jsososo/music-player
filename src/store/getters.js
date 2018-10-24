export default {
  // 获取用户信息
  getUserInfo: (state) => {
    return state.user;
  },
  // 获取系统的tag列表
  getTagList: (state) => (isSys = true) => {
    return isSys ? state.sysTags : [];
  },
  // 获取tag的状态信息
  getTagInfo(state) {
    return state.tagInfo;
  },
  // 获取全部的歌曲
  getAllSongs(state) {
    return state.allSongs;
  },
  // 获取展示列表
  getShowList(state) {
    return state.showList;
  },
  // 获取播放器状态信息
  getPlayerInfo(state) {
    return state.playerInfo;
  },
  // 是否正在下载歌曲
  isDownloading(state) {
    return state.downloading;
  },
  // 获取正在播放的歌曲信息
  getPlaying(state) {
    return state.playNow;
  },
  // 是在播放还是暂停
  isPlaying(state) {
    return state.playing;
  },
  // 是否正在加载
  isLoading(state) {
    return state.loading;
  },
}