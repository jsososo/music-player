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
    sysSongs: {'安静': []},
  },
  mutations: {
    updatePlayNow(state, data) {
      state.playNow = data.obj;
      state.playingList = data.list || state.playingList;
      this.commit('getPlayNowTag');
    },
    updatePlayer(state, obj) {
      state.playerInfo = obj;
    },
    playNext(state) {
      const orderType = Storage.get('orderType') || 'liebiao';
      const id = state.playNow.objectId;
      let nI = 0;
      if (orderType === 'suiji') {
        nI = Num(Math.random() * state.playingList.length);
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
    searchList(state, data) {
      const { search, isAll } = data;
      let findList = state.playingList;
      if (isAll) {
        findList = Object.values(state.allSongs);
      }
      const RE = new RegExp(search, 'i');
      console.log(findList);
      state.showList = findList.filter((s) => (
        s.title.match(RE) || s.artist.match(RE) || s.album.match(RE) || s.search.match(RE)
      ))
    },
    changeShowList(state, list) {
      state.showList = list.map((k) => state.allSongs[k.objectId]);
    }
  }
});

export default Player;