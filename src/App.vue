<template>
  <div id="app">
    <div class="left-menu">
      <el-menu default-active="/" :router="true" >
        <el-menu-item index="me">
          <icon name="user"/>
        </el-menu-item>
        <el-menu-item index="/">
          <icon name="play-circle"/>
        </el-menu-item>
        <el-menu-item index="storehouse">
          <icon name="hdd"/>
        </el-menu-item>
        <a class="text-center block fc_999 mt_10" target="_blank" href="//jsososo.com">
          <span target="_blank">So</span>
        </a>
      </el-menu>
    </div>
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
    created() {
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
          q.select('artist', 'album', 'title');
          return q;
        },
        (res) => {
          const allSongs = {};
          res.forEach((item) => allSongs[item.objectId] = item);
          this.$store.state.allSongs = allSongs;
        },
        null,
        'find'
      )
    },
  }
</script>

<style lang="scss">
  @import "assets/style/common";
  #app {
    min-height: 100vh;

    .left-menu {
      min-height: 100vh;
      width: 80px;
      display: inline-block;
      height: 100%;
      border-right: solid 1px #e6e6e6;
      vertical-align: top;

      .el-menu {
        border: none;
      }

      .el-menu-item {
        color: #999;
        padding-left: 0;

        &.is-active {
          color: #409EFF;
        }
      }

      .fa-icon {
        padding: 0 10px;
      }
    }
    .main-container {
      display: inline-block;
      vertical-align: top;
      padding: 20px;
      width: calc(100% - 130px);
      padding-bottom: 100px;
    }
  }
</style>
