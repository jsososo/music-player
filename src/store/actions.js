import * as types from './mutationsTypes';
import Num from '../assets/utils/num';

export default {
  updateSelectedSongs: ({ commit }, data) => {
    commit(types.SELECT_SONGS, data);
  },
  updateShowList: ({ commit }, data) => {
    commit(types.UPDATE_SHOW_LIST, data);
  },
  searchMusic: ({ commit }, data) => {
    commit(types.SEARCH_MUSIC, data);
  },
  updateSelectedTag: ({ commit }, data) => {
    commit(types.UPDATE_SELECTED_TAG, data);
  },
  updateRandomHistory: ({ commit }, data) => {
    commit(types.UPDATE_RANDOM_HISTORY, data);
  },
  updatePlayerInfo: ({ commit }, data) => {
    commit(types.UPDATE_PLAYER_INFO, data);
  },
  setDownLoading: ({ commit }, data) => {
    commit(types.SET_DOWNLOADING, data);
  },
  updateSongDetail: ({ commit }, data) => {
    commit(types.UPDATE_SONG_DETAIL, data);
  },
  playPrev: ({ commit }) => {
    commit(types.PLAY_PREV);
  },
  playNext: ({ commit }) => {
    commit(types.PLAY_NEXT);
  },
  updatePlayNow: ({ commit }, data) => {
    commit(types.UPDATE_PLAY_NOW, data);
  },
  setSysTag: ({ commit }, data) => {
    commit(types.SET_SYS_TAG, data);
  },
  updateAllSongs: ({ commit }, data) => {
    commit(types.UPDATE_ALL_SONGS, data);
  },
  // 更新播放状态
  updatePlayingStatus: ({ commit }, data) => {
    commit(types.UPDATE_PLAYING_STATUS, data);
  },
  setListContent: ({ commit }, data) => {
    commit(types.CHANGE_LIST_CONTENT, data);
  },
  changeSearchKey: ({ commit }, data) => {
    commit(types.CHANGE_SEARCH_KEY, data);
  },
  setFavList: ({ commit }, data) => {
    commit(types.SET_FAV_LIST, data);
  },
  updateAdd2DirInfo: ({ commit }, data) => {
    commit(types.UPDATE_ADD_DIR_INFO, data);
  }
}
