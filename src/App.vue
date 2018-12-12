<template>
  <div id="app">
    <img src="./assets/img/bg-1.png" alt="" class="app-bg">
    <img id="play-music-bg" alt="">
    <div class="main-container">
      <router-view/>
      <Player />
    </div>
  </div>
</template>

<script>
  import Storage from './assets/utils/Storage';
  import Player from './components/Player';
  import request from './assets/utils/request';

  export default {
    name: 'App',
    components: { Player },
    data() {
      return {
        defaultActive: '/',
      }
    },
    computed: {
      user() {
        return this.$store.getters.getUserInfo;
      },
    },
    created() {
      // 获取vkey
      request.getQQVkey();
      // 播放顺序，qq号的一些配置
      if (!Storage.get('orderType')) {
        Storage.set('orderType', 'liebiao');
      }
      this.defaultActive = window.location.hash.split('/')[1];
      const uQ = Storage.get('uQ');
      if (uQ) {
        request.getQQList(this);
      } else {
        this.$message.info('点右上角头像绑定企鹅号');
      }
      Storage.setDefault({
        listen_size: 'size320',
        down_size: 'hight',
        down_high: 'sizeflac',
      });
    },
    methods: {

    }
  }
</script>

<style lang="scss">
  @import "assets/style/common";
  body {
    overflow: hidden;
  }
  #app {
    height: 100vh;

    #play-music-bg {
      position: absolute;
      z-index: 0;
      top: 0;
      left: 0;
      width: 100%;
      bottom: -10%;
      -webkit-filter: blur(50px) brightness(60%);
      -moz-filter: blur(50px) brightness(60%);
      -o-filter: blur(50px) brightness(60%);
      -ms-filter: blur(50px) brightness(60%);
      filter: blur(50px) brightness(60%);
    }

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
      height: calc(100vh - 80px);
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
