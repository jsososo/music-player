<template>
  <div id="app">
    <img src="./assets/img/bg-1.png" alt="" class="app-bg">
    <div class="main-container">
      <router-view/>
      <Player />
    </div>
  </div>
</template>

<script>
  import Storage from './assets/utils/Storage';
  import Player from './components/Player';

  export default {
    name: 'App',
    components: { Player },
    data() {
      return {
        defaultActive: '/',
      }
    },
    created() {
      const { dispatch } = this.$store;
      if (!Storage.get('orderType')) {
        Storage.set('orderType', 'liebiao')
      }
      this.defaultActive = window.location.hash.split('/')[1];
      Storage.logIn(null, (res) => dispatch('updateUser', JSON.parse(JSON.stringify(res))));
      Storage.queryBmob(
        'MusicTag',
        (q) => {
          q.equalTo('userId', 'a605fbce83');
          return q;
        },
        (res) => dispatch('setSysTag', res),
      );
      Storage.queryBmob(
        'MusicSongs',
        (q) => {
          q.select('artist', 'album', 'title', 'search');
          q.limit(1000);
          return q;
        },
        (res) => dispatch('setAllSongs', res),
        null,
        'find'
      );
    },
  }
</script>

<style lang="scss">
  @import "assets/style/common";
  body {
    overflow: hidden;
  }
  #app {
    height: 100vh;

    .app-bg {
      position: relative;
      z-index: -1;
      top: 0;
      left: 0;
      width: 100%;
    }

    .main-container {
      position: absolute;
      overflow-y: auto;
      height: calc(100vh - 100px);
      top: 0;
      left: 0;
      display: inline-block;
      vertical-align: top;
      padding: 20px 20px 0 20px;
      width: 100%;
      box-sizing: border-box;

      &::-webkit-scrollbar
      {
        width:8px;
        height:8px;
        background-color:rgba(0,0,0,0);
      }
      /*定义滚动条轨道
       内阴影+圆角*/
      &::-webkit-scrollbar-track
      {
        border-radius:10px;
        background-color: rgba(255,255,255,0.1);
      }
      /*定义滑块
       内阴影+圆角*/
      &::-webkit-scrollbar-thumb
      {
        border-radius:10px;
        background-color:rgba(255,255,255,0.5);
      }
    }
  }
</style>
