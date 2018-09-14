import Vue from 'vue';
import Vuex from 'vuex';
import Storage from '../assets/utils/Storage';
import Num from '../assets/utils/num';

Vue.use(Vuex);
const Player = new Vuex.Store({
  state: {
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
    sysSongs: {'安静': []},
  },
  mutations: {
    updatePlayNow(state, data) {
      const rL = state.randomHistory.list;
      const rI = state.randomHistory.index;

      state.playNow = data.obj;
      state.playingList = data.list || state.playingList;
      state.loading = false;
      // 如果是向下播放一手新的随机音乐。就记录到randomHistory里
      if (Storage.get('orderType') === 'suiji') {
        rL.push(data.obj.objectId);
        state.randomHistory.index = rL.length - 1;
      }
      this.commit('getPlayNowTag');
    },
    updatePlayer(state, obj) {
      state.playerInfo = obj;
    },
    playNext(state) {
      const orderType = Storage.get('orderType') || 'liebiao';
      const id = state.playNow.objectId;
      state.loading = false;
      let nI = 0;
      // 随机播放
      if (orderType === 'suiji') {
        const rL = state.randomHistory.list;
        const rI = state.randomHistory.index;
        // 正常的随机播放下一首
        if (rL.length - 1 === rI) {
          nI = Num(Math.random() * state.playingList.length - 1);
          rL.push(state.playingList[nI]);
        } else {
          // 点过上一首之后再点下一首的随机播放。为了保持播放顺序，从随机播放历史中取值。
          nI = state.playingList.indexOf(rL[rI]);
        }
        state.randomHistory.index += 1;
      } else {
        nI = state.playingList.indexOf(id) + 1;
        if (nI === state.playingList.length) {
          nI = 0;
        }
      }
      state.playNow = state.allSongs[state.playingList[nI]];
    },
    getPlayNowTag(state) {
      state.nPSTags = Object.keys(state.sysSongs).filter(k => state.sysSongs[k].indexOf(state.playNow.objectId) > -1);
    },
    playPrev(state) {
      state.loading = false;
      const orderType = Storage.get('orderType');
      let nI = 0;
      const id = state.playNow.objectId;
      if (orderType === 'suiji') {
        const rL = state.randomHistory.list;
        const rI = state.randomHistory.index;
        // 随机时候的上一首，去找真的上一首
        if (rI > 0) {
          nI = state.playingList.indexOf(rL[rI]);
          state.randomHistory.index -= 1;
        } else {
        //  超出播放记录了，随便选一首
          nI = Num(Math.random() * state.playingList.length - 1);
          rL.unshift(state.playingList[nI]);
          state.randomHistory.index = 0;
        }
      } else {
        nI = state.playingList.indexOf(id) - 1;
        if (nI < 0) {
          nI = state.playingList.length - 1;
        }
      }
      state.playNow = state.allSongs[state.playingList[nI]];
    },
    searchList(state, data) {
      const { search, isAll } = data;
      let findList = state.playingList;
      if (isAll) {
        findList = Object.values(state.allSongs);
      }
      const RE = new RegExp(search, 'i');
      state.showList = findList.filter((s) => (
        s.title.match(RE) || s.artist.match(RE) || s.album.match(RE) || s.search.match(RE)
      ))
    },
    changeShowList(state, list) {
      state.showList = list.map((k) => state.allSongs[k.objectId]);
    },
    clearRandomHistory(state) {
      // 清空记录的随机顺序
      state.randomHistory = {
        list: [],
        index: -1,
      }
    }
  }
});

export default Player;