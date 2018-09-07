import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Player from './views/PlayerPage'
import Me from './views/Me'

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
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/me/upload',
      name: 'upload',
      meta: {
        title: '上传'
      },
      component: () => import('./views/Upload.vue')
    },
    {
      path: '/me',
      name: 'me',
      meta: {
        title: '我的歌单'
      },
      component: Me,
    },
    {
      path: '/storehouse',
      name: 'storehouse',
      component: () => import('./views/Storehouse.vue'),
      meta: {
        title: '曲库'
      },
    },
    {
      path: '/development',
      name: 'development',
      component: () => import('./views/Development.vue'),
      meta: {
        title: '大后门'
      }
    }

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