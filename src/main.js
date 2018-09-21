import Vue from 'vue';
import App from './App.vue';
import router from './router';
import 'element-ui/lib/theme-chalk/index.css';
import Element from 'element-ui';
import { BmobInfo } from "./assets/utils/const";
import './assets/style/icon/iconfont.css';
import PlayerStore from './store/index';

Bmob.initialize(...BmobInfo);

Vue.use(Element, { size: 'small' });

new Vue({
  router,
  store: PlayerStore,
  render: h => h(App)
}).$mount('#app');
