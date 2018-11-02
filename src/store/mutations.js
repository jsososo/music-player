import * as types from './mutationsTypes';
import Storage from "../assets/utils/Storage";
import Num from "../assets/utils/num";

export default {
  [types.UPDATE_USER_TAG](state, data) {
    console.log(data);
  },
  [types.UPDATE_USER](state, data) {
    state.user = { ...(state.user), ...data };
  },
  [types.UPDATE_SHOW_LIST](state, data) {
    state.showList = data;
  },
  [types.UPDATE_ALL_SONGS](state, data) {
    state.allSongs = data;
  },
  // 搜索歌曲
  [types.SEARCH_MUSIC](state, data) {
    const { search, isAll } = data;
    let findList = state.sysSongs[state.tagInfo.selected] ?
      state.sysSongs[state.tagInfo.selected].map(id => state.allSongs[id]) :
      Object.values(state.allSongs);
    if (isAll) {
      findList = Object.values(state.allSongs);
    }
    const RE = new RegExp(search, 'i');
    state.showList = findList.filter((s) => (
      s.title.match(RE) || s.artist.match(RE) || s.album.match(RE) || (s.search && s.search.match(RE))
    ))
  },
  // 更新选中的的tag
  [types.UPDATE_SELECTED_TAG](state, tag) {
    state.tagInfo.selected = tag;
    if (tag) {
      state.showList = state.sysSongs[tag].map((k) => state.allSongs[k]);
    } else {
      state.showList = Object.values(state.allSongs);
    }
  },
  // 上一首
  [types.PLAY_PREV](state) {
    state.loading = false;
    const orderType = Storage.get('orderType');
    let nI = 0;
    let nId = '';
    const id = state.playNow.objectId;
    if (orderType === 'suiji') {
      const rL = state.randomHistory.list;
      const rI = state.randomHistory.index;
      // 随机时候的上一首，去找真的上一首
      if (rI > 0) {
        nId = rL[rI - 1];
        nI = state.playingList.indexOf(nId);
        state.randomHistory.index -= 1;
      } else {
        //  超出播放记录了，随便选一首
        nI = Num(Math.random() * (state.playingList.length - 1));
        rL.unshift(state.playingList[nI]);
        state.randomHistory.index = 0;
      }
    } else {
      nI = state.playingList.indexOf(id) - 1;
      if (nI < 0) {
        nI = state.playingList.length - 1;
      }
    }
    state.playerInfo.duration = 0;
    // 如果是搜索的歌曲，那他不会再playingList里
    state.playNow = state.allSongs[nI > -1 ? state.playingList[nI] : nId];
  },
  // 下一首
  [types.PLAY_NEXT](state) {
    const orderType = Storage.get('orderType') || 'liebiao';
    const id = state.playNow.objectId;
    state.loading = false;
    let nI = 0;
    let nId = '';
    // 随机播放
    if (orderType === 'suiji') {
      const rL = state.randomHistory.list;
      const rI = state.randomHistory.index;
      // 正常的随机播放下一首
      if (rL.length - 1 === rI) {
        nI = Num(Math.random() * (state.playingList.length - 1));
        rL.push(state.playingList[nI]);
      } else {
        // 点过上一首之后再点下一首的随机播放。为了保持播放顺序，从随机播放历史中取值。
        nId = rL[rI];
        nI = state.playingList.indexOf(nId);
      }
      state.randomHistory.index += 1;
    } else {
      nI = state.playingList.indexOf(id) + 1;
      if (nI === state.playingList.length) {
        nI = 0;
      }
    }
    state.playerInfo.duration = 0;
    // 如果是搜索的歌曲，那他不会再playingList里
    state.playNow = state.allSongs[nI > -1 ? state.playingList[nI] : nId];
  },
  // 更新随机播放历史
  [types.UPDATE_RANDOM_HISTORY](state, data) {
    state.randomHistory = data || {
      list: [],
      index: -1,
    };
  },
  // 更新播放器信息
  [types.UPDATE_PLAYER_INFO](state, data) {
    state.playerInfo = data;
  },
  // loading状态
  [types.SET_DOWNLOADING](state, data) {
    state.downloading = data;
  },
  // 更新歌曲信息
  [types.UPDATE_SONG_DETAIL](state, { info, index }) {
    state.allSongs[index] = {
      ...(state.allSongs[index]),
      ...info,
    };
  },
  [types.UPDATE_PLAYING_STATUS](state, data) {
    state.playing = data;
  },
  // 更新正在播放的音乐
  [types.UPDATE_PLAY_NOW](state, data) {
    const rL = state.randomHistory.list;

    state.playNow = data;
    state.loading = false;
    // 换tag了，清空随机记录
    if (state.tagInfo.playing !== state.tagInfo.selected) {
      rL.length = 0;
      state.tagInfo.playing = state.tagInfo.selected;
    }

    if (!state.tagInfo.playing) {
      state.playingList = Object.keys(state.allSongs).filter(id => !state.allSongs[id].from || state.allSongs[id].updateBmob);
    } else {
      state.playingList = state.sysSongs[state.tagInfo.playing];
    }
    // 如果是向下播放一首新的随机音乐。就记录到randomHistory里
    if (Storage.get('orderType') === 'suiji' && (rL[rL.length - 1] !== data.objectId)) {
      rL.push(data.objectId);
      state.randomHistory.index = rL.length - 1;
    }
    state.tagInfo.playing = state.tagInfo.selected;
    state.playerInfo.duration = 0;
    // this.commit('getPlayNowTag');
  },
  [types.SET_SYS_TAG](state, data) {
    state.sysObjectId = data.objectId;
    state.sysSongs = data.tags;
    state.sysTags = Object.keys(data.tags);
  },
  [types.SET_ALL_SONGS](state, data) {
    state.allSongs = data;
  },
  // 更新展示列表
  [types.CHANGE_SHOW_LIST](state, data) {
    state.showList = data.map((k) => state.allSongs[k.objectId]);
  },
  [types.SET_LOADING](state, data) {
    state.loading = data;
  }
}