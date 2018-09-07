import Vue from 'vue';
import App from './App.vue';
import router from './router';
import Vuex from 'vuex';
import 'element-ui/lib/theme-chalk/index.css';
import Element from 'element-ui';
import { BmobInfo } from "./assets/utils/const";
import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon';

Bmob.initialize(...BmobInfo);

Vue.use(Element, { size: 'small' });
Vue.component('icon', Icon);
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    sysTags: [],
    allSongs: {},
    playNow: {},
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
      const id = state.playNow.objectId;
      let nI = state.playingList.indexOf(id) + 1;
      if (nI === state.playingList.length) {
        nI = 0;
      }
      state.playNow = state.allSongs[state.playingList[nI]];
    },
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
