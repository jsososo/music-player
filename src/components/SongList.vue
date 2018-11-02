<template>
  <div class="song-list">
    <div :class="playNow.objectId === s.objectId ? 'song-item playing' : 'song-item'"
         v-for="(s, i) in showList"
         :key="s.objectId"
         @click="playMusic(s.objectId)">
      <span class="song-order">{{i + 1}}</span>
      <span class="song-title">{{s.title}}</span>
      <span class="song-artist">{{s.artist}}</span>
    </div>
    <div class="empty-status" v-if="showList.length === 0">空空如也！</div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  export default {
    name: "SongList",
    props: {
      isSys: Boolean,
      tag: String,
      hideHeader: Boolean,
    },
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
        showList: 'getShowList',
        allSongs: 'getAllSongs',
      }),
    },
    methods: {
      playMusic(id, play = true) {
        const dispatch = this.$store.dispatch;
        if (play) {
          dispatch('updatePlayingStatus', true);
        }
        dispatch('updatePlayNow', this.allSongs[id])
      },
    }
  }
</script>

<style lang="scss">
  .song-list {
    display: inline-block;
    height: calc(100vh - 200px);
    overflow-y: auto;
    overflow-x: hidden;
    width: 550px;
    margin-top: 10px;
    margin-right: 20px;
    min-height: 500px;

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

  .empty-status {
    color: White;
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
    cursor: default;

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
      vertical-align: top;
      word-wrap: break-word;
    }
    .song-order {
      width: 10%
    }
    .song-title {
      width: 55%;
    }
    .song-artist {
      width: 35%;
    }
  }
</style>