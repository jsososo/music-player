<template>
  <div id="app">
    <img src="./assets/img/bg-1.png" alt="" class="app-bg">
    <img id="play-music-bg" alt="">
    <div class="main-container">
      <router-view/>
      <Player />
      <AddToDir />
    </div>
  </div>
</template>

<script>
  import Storage from './assets/utils/Storage';
  import Player from './components/Player';
  import AddToDir from './components/AddToDir';
  import request from './assets/utils/request';
  import { mapGetters } from 'vuex';

  export default {
    name: 'App',
    components: { Player, AddToDir },
    data() {
      return {
        defaultActive: '/',
      }
    },
    computed: {
      ...mapGetters({
        allSongs: 'getAllSongs',
        radioInfo: 'getRadioInfo',
      })
    },
    created() {
      window.VUE_APP = this;
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
        down_size: 'high',
        down_high: 'sizeflac',
      });

      // 初始化一下下载记录
      const downList = Storage.get('down_list_info', true, '[]');
      downList.forEach((item) => {
        // 一般是之前没有下载完就关掉了页面
        if (item.status !== 'success') {
          item.status = 'abort';
        }
      });
      this.$store.dispatch('updateDownloadList', {
        count: 0,
        list: downList,
      });

      request.getQQRadio(null, this);
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
    min-width: 1200px;

    #play-music-bg {
      position: absolute;
      z-index: 0;
      top: 0;
      left: 0;
      min-width: 100vw;
      min-height: 100vh;
      bottom: -25%;
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
      min-width: 100vw;
      min-height: 100vh;
    }

    .main-container {
      position: absolute;
      overflow-y: auto;
      min-width: 1200px;
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
