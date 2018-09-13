<template>
  <div class="song-list">
    <div :class="$store.state.playNow.objectId === s.objectId ? 'song-item playing' : 'song-item'"
         v-for="(s, i) in $store.state.showList"
         :key="s.objectId"
         @click="playMusic(s.objectId)">
      <span class="song-order">{{i + 1}}</span>
      <span class="song-title">{{s.title}}</span>
      <span class="song-artist">{{s.artist}}</span>
    </div>
    <div class="empty-status" v-if="$store.state.showList.length === 0">空空如也！</div>
  </div>
</template>

<script>
  export default {
    name: "SongList",
    props: {
      isSys: Boolean,
      tag: String,
      hideHeader: Boolean,
    },
    data() {
      return {
      }
    },
    methods: {
      playMusic(id, play = true) {
        const state = this.$store.state;
        if (play) {
          this.$store.state.playing = true;
        }
        const list = state.showList.map(item => item.objectId);
        this.$store.commit('updatePlayNow', {
          obj: state.allSongs[id],
          list,
        });
      },
    }
  }
</script>

<style lang="scss">
  .song-list {
    height: calc(100vh - 250px);
    overflow-y: auto;
    overflow-x: hidden;
    width: 550px;

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
      //-webkit-box-shadow:inset 0 0 6px rgba(0,0,0,0.3);
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

  .empty-status {
    color: #999;
    font-size: 20px;
    text-align: center;
    line-height: 30px;
    padding: 30px;
  }
  .song-item {
    width: 100%;
    transition: 0.5s;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    text-overflow: ellipsis;

    &.playing {
      background: rgba(255,255,255,0.2);
      border-bottom: 1px solid rgba(255,255,255,0.9);
    }

    &:hover {
      background: rgba(255,255,255,0.2);
    }

    span {
      display: inline-block;
      padding: 10px;
      box-sizing: border-box;
      color: #eee;
      font-size: 14px;
    }
    .song-order {
      width: 5%
    }
    .song-title {
      width: 60%;
    }
    .song-artist {
      width: 35%;
    }
  }
</style>