import Vue from 'vue'
import Router from 'vue-router'
import Player from './views/PlayerPage'

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'player',
      component: Player,
      meta: {
        title: '音乐哟'
      }
    },
  ]
});

router.beforeEach((to, from, next) => {
  /* 路由发生变化修改页面title */
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
});

export default router;