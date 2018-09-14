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
      if (!Storage.get('orderType')) {
        Storage.set('orderType', 'liebiao')
      }
      this.defaultActive = window.location.hash.split('/')[1];
      Storage.queryBmob(
        'MusicTag',
        (q) => {
          q.equalTo('userId', 'a605fbce83');
          return q;
        },
        (res) => {
          this.$store.state.sysObjectId = res.objectId;
          this.$store.state.sysSongs = res.tags;
          this.$store.state.sysTags = Object.keys(res.tags);
        }
      );
      Storage.queryBmob(
        'MusicSongs',
        (q) => {
          q.select('artist', 'album', 'title', 'search');
          return q;
        },
        (res) => {
          const allSongs = {};
          res.forEach((item) => allSongs[item.objectId] = item);
          this.$store.state.allSongs = allSongs;
          this.$store.commit('updatePlayNow', {
            obj: res[res.length - 10],
            list: Object.keys(allSongs),
          });
          this.$store.commit('changeShowList', Object.values(allSongs));
        },
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
      min-height: 650px;
      top: 0;
      left: 0;
      display: inline-block;
      vertical-align: top;
      padding: 20px 20px 100px 20px;
      width: 100%;
      box-sizing: border-box;
    }
  }
</style>
