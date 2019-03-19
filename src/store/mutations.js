import * as types from './mutationsTypes';
import Storage from "../assets/utils/Storage";
import Num from "../assets/utils/num";

export default {
  [types.UPDATE_DOWNLOAD_LIST](state, data) {
    // 项目初始化的时候从localStorage里直接获取全部的数据
    // 很暴力的认为如果没有id就是传入整个list
    if (!data.id) {
      state.downloadList = data;
      Storage.set('down_list_info', data.list, true);
      return;
    }

    const that = data.that;
    delete data.that;

    // 更新下载列表，就去找找有没有,如果没找到就直接新增一个
    const { list } = state.downloadList;
    const index = list.findIndex((item) => item.id === data.id);
    if (index === -1) {
      list.unshift(data);
    } else {
      list[index] = { ...list[index], ...data }
    }
    switch (data.status) {
      case 'init':
        state.downloadList.count += 1;
        break;
      case 'success':
      case 'abort':
        state.downloadList.count -= 1;
        delete state.progress;
        break;
      case 'error':
        that.$message.error(`下载失败：${data.reason}，可以去下载中心查看设置`);
        break;
      default: break;
    }
    state.downloadList = { ...state.downloadList };
    if (data.status !== 'down') {
      Storage.set('down_list_info', list, true);
    }
  },
  [types.SHOW_DOWN_SETTING](state, data) {
    state.downSettingDialog = data;
  },
  [types.SELECT_SONGS](state, data) {
    state.selectedSongs = data;
  },
  [types.UPDATE_ADD_DIR_INFO](state, data) {
    state.add2Dir = data;
  },
  [types.SET_FAV_LIST](state, data) {
    state.favList = data;
  },
  [types.UPDATE_SHOW_LIST](state, data) {
    state.showList = data.list;
    data.dissid && (state.sysSongs[data.dissid] = state.showList);
  },
  [types.UPDATE_ALL_SONGS](state, data) {
    state.allSongs = { ...data, ...state.allSongs };
  },
  // 搜索歌曲
  [types.SEARCH_MUSIC](state, data) {
    const { search } = data;
    let findList = state.sysSongs[state.tagInfo.selected.dissid] || [];
    const RE = new RegExp(search, 'i');
    state.showList = findList.filter((s) => (
      s.title.match(RE) || s.artist.match(RE) || s.album.match(RE) || s.albumdesc.match(RE)
    ))
  },
  // 更新选中的的tag
  [types.UPDATE_SELECTED_TAG](state, id) {
    state.tagInfo.selected = state.sysTags.find((t) => t.dissid === id);
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
        nI = state.playingList.findIndex(obj => obj.songmid === nId);
        state.randomHistory.index -= 1;
      } else {
        //  超出播放记录了，随便选一首
        nI = Num(Math.random() * (state.playingList.length - 1));
        rL.unshift(state.playingList[nI].songmid);
        state.randomHistory.index = 0;
      }
    } else {
      nI = state.playingList.findIndex(obj => obj.songmid === id) - 1;
      if (nI < 0) {
        nI = state.playingList.length - 1;
      }
    }
    state.playerInfo.duration = 0;
    // 如果是搜索的歌曲，那他不会再playingList里
    state.playNow = state.allSongs[nI > -1 ? state.playingList[nI].songmid : nId];
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
        if (state.playingList.length === 1) {
          document.getElementById('m-player').currentTime = 0;
        }
        nI = Num(Math.random() * (state.playingList.length - 1));
        rL.push(state.playingList[nI].songmid);
      } else {
        // 点过上一首之后再点下一首的随机播放。为了保持播放顺序，从随机播放历史中取值。
        nId = rL[rI + 1];
        nI = state.playingList.findIndex(obj => obj.songmid === nId);
      }
      state.randomHistory.index += 1;
    } else {
      nI = state.playingList.findIndex(obj => obj.songmid === id) + 1;
      if (nI === state.playingList.length) {
        nI = 0;
      }
    }
    // state.playerInfo.duration = 0;
    // 如果是搜索的歌曲，那他不会再playingList里
    state.playNow = state.allSongs[nI > -1 ? state.playingList[nI].songmid : nId];
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
    state.playerInfo = { ...state.playerInfo, ...data};
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
    if (state.searchKey === 'QQ音乐') {
      state.playingList = (state.showList || []).filter(item => item.mediamid);
    } else if (state.searchKey === '列表内') {
      state.playingList = (state.sysSongs[state.tagInfo.selected.dissid] || []).filter(item => item.mediamid);
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
    // state.sysObjectId = data.objectId;
    // state.sysSongs = data.tags;
    state.sysTags = data;
  },
  [types.SET_ALL_SONGS](state, data) {
    state.allSongs = data;
  },
  // 更新展示列表
  [types.CHANGE_SHOW_LIST](state, data) {
    state.showList = data.map((k) => state.allSongs[k.objectId]);
  },
  // 切换右侧的现实内容
  [types.CHANGE_LIST_CONTENT](state, data) {
    state.listContent = data;
  },
  // 顶上的qq音乐、列表哪
  [types.CHANGE_SEARCH_KEY](state, data) {
    state.searchKey = data;
  }
}