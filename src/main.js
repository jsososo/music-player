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
    playerInfo: {
      duration: 0,
      current: 0,
      paused: true,
    },
  },
  mutations: {
    updatePlayNow(state, obj) {
      state.playNow = obj;
    },
    updatePlayer(state, obj) {
      state.playerInfo = obj;
    }
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
