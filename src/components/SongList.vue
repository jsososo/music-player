<template>
  <div class="song-list">
    <div v-if="!hideHeader" class="list-header song-item">
      <span class="song-title">歌名</span>
      <span class="song-artist">歌手</span>
      <span class="song-album">专辑</span>
    </div>
    <div :class="$store.state.playNow.objectId === s.objectId ? 'song-item playing' : 'song-item'"
         v-for="(s, i) in list"
         :key="s.objectId"
         @click="playMusic(s.objectId)">
      <span class="song-order">{{i + 1}}</span>
      <span class="song-title">{{s.title}}</span>
      <span class="song-artist">{{s.artist}}</span>
      <span class="song-album">{{s.album}}</span>
    </div>
    <div class="empty-status" v-if="list.length === 0">空空如也！</div>
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
    watch: {
      tag() {
        this.updateList();
      }
    },
    data() {
      return {
        list: [],
      }
    },
    created() {
      this.updateList();
    },
    methods: {
      updateList() {
        const state = this.$store.state;
        if (!Object.values(state.allSongs).length) {
          setTimeout(this.updateList, 100);
        }
        let list = [];
        let tagObj = {};
        if (this.isSys) {
          tagObj = state.sysSongs;
        }
        if (this.tag) {
          const arr = tagObj[this.tag] || [];
          list = arr.map((id) => state.allSongs[id]);
        } else {
          list = Object.values(state.allSongs);
        }
        this.list = list;
      },
      playMusic(id, play = true) {
        const state = this.$store.state;
        if (play) {
          this.$store.state.playing = true;
        }
        const list = this.list.map(item => item.objectId);
        this.$store.commit('updatePlayNow', {
          obj: state.allSongs[id],
          list,
        });
      },
    }
  }
</script>

<style lang="scss">
  .empty-status {
    color: #999;
    font-size: 20px;
    text-align: center;
    line-height: 30px;
    padding: 30px;
  }
  .song-item {
    width: 100%;
    background: white;
    transition: 0.5s;

    &.playing {
      background: #d4eaff !important;
    }

    &.list-header {
      background: #f3f3f3 !important;
      font-weight: 900;
      color: #444 !important;
    }

    &:hover {
      background: #eff8ff;
    }

    span {
      display: inline-block;
      padding: 10px;
      box-sizing: border-box;
      color: #777;
      font-size: 14px;
    }
    .song-order {
      width: 5%
    }
    .song-title {
      width: 30%;
    }
    .song-artist {
      width: 25%;
    }
    .song-album {
      width: 40%;
    }
  }
</style>