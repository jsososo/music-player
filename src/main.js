import Vue from 'vue';
import App from './App.vue';
import router from './router';
import 'element-ui/lib/theme-chalk/index.css';
import Element from 'element-ui';
import { BmobInfo } from "./assets/utils/const";
import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon';

Bmob.initialize(...BmobInfo);

Vue.use(Element, { size: 'small' });
Vue.component('icon', Icon);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
