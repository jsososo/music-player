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
    loading: false,
  },
  mutations: {
    updatePlayNow(state, data) {
      state.playNow = data.obj;
      state.playingList = data.list || state.playingList;
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
  }
});

export default Player;