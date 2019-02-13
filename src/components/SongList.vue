<template>
  <div :class="`song-list ${selected.len ? 'selecting' : ''}`">
    <div :class="s.mediamid ? (playNow.objectId === s.objectId ? 'song-item playing' : 'song-item') : 'song-item song-empty'"
         v-for="(s, i) in showList"
         :key="`${s.objectId}-${i}`"
    >
      <span class="song-order" @click="playMusic(s.objectId, s.mediamid)">{{i + 1}}</span>
      <span class="song-checkbox" @click="select(s.objectId)">
        <el-checkbox :value="selected.val[s.objectId]"></el-checkbox>
      </span>
      <span class="song-title" @click="playMusic(s.objectId, s.mediamid)">{{s.title}}</span>
      <span class="song-artist">
        <span class="song-artist-txt" @click="playMusic(s.objectId, s.mediamid)">{{s.artist}}</span>
        <span class="song-operation">
          <span
            @click="like(s, { dirid: favList.id, dissid: favList.disstid }, !Boolean(favList[s.songmid]), true)"
            :class="favList[s.songmid] ? 'iconfont icon-xihuan iconfont' : 'iconfont icon-weixihuan'">
          </span>
          <span @click="down(s)" v-if="s.mediamid" class="iconfont icon-xiazai" style="font-size: 15px;vertical-align: 2px;" />
          <span class="iconfont icon-tianjia" style="font-size: 14px;vertical-align: 1px;" @click="like(s)"></span>
          <span v-if="searchKey === '列表内'" class="iconfont icon-shanchu" style="font-size: 18px;" @click="like(s, null, false)"></span>
        </span>
      </span>
    </div>
    <div class="empty-status" v-if="showList.length === 0">空空如也！</div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { download } from "../assets/utils/stringHelper";

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
        favList: 'getFavList',
        tagInfo: 'getTagInfo',
        selected: 'getSelectedSongs',
        searchKey: 'getSearchKey',
      }),
    },
    methods: {
      like(song, dir, add = true, fav) {
        this.$store.dispatch('updateAdd2DirInfo', { song, dir, add, fav})
      },
      playMusic(id, mediaid) {
        const pDom = document.getElementById('m-player');
        if (!mediaid) {
          this.$message.info('企鹅音乐暂无版权～');
          return;
        }
        const dispatch = this.$store.dispatch;
        dispatch('updatePlayingStatus', true);
        pDom.play();
        if (this.playNow.objectId !== id) {
          dispatch('updatePlayNow', this.allSongs[id])
        } else {
          pDom.currentTime = 0;
        }
      },
      down(v) {
        download(v, this);
      },
      select(v) {
        window.event.preventDefault();
        const { selected } = this;
        selected.val[v] = !selected.val[v];
        selected.len += selected.val[v] ? 1 : -1;
        this.$store.dispatch('updateSelectedSongs', selected);
      }
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

    &.selecting {
      .song-order {
        display: none !important;
      }
      .song-checkbox {
        display: inline-block !important;
      }
    }

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

    &.song-empty {
      opacity: 0.55;

      .song-order {
        display: inline-block !important;
      }
      .song-checkbox {
        display: none !important;
      }
      &:hover {
        .song-artist-txt {
          opacity: 1 !important;
        }
        .song-operation {
          display: none !important;
        }
      }
    }

    .song-checkbox {
      display: none;
      width: 10%;
      padding: 8px;
      box-sizing: border-box;

      .el-checkbox__inner {
        background: transparent !important;
        border: 1px solid rgba(255,255,255,0.6) !important;
        transform: scale(1.25);
      }
    }

    &:hover {
      background: rgba(255,255,255,0.2);

      .song-order {
        display: none;
      }

      .song-checkbox {
        display: inline-block;
      }

      .song-artist {
        .song-artist-txt {
          opacity: 0;
        }
        .song-operation {
          display: inline-block;
          opacity: 1;
        }
      }
    }
    .song-order, .song-artist, .song-title {
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
      position: relative;

      .song-artist-txt {
        display: inline-block;
        opacity: 1;
        padding: 0;
      }
      .song-operation {
        position: absolute;
        top: 10px;
        left: 10px;
        display: none;
        vertical-align: top;
        padding: 0;
        opacity: 1;
        transition: 0.5s;

        .iconfont {
          padding: 0;
          margin-right: 10px;
          font-size: 18px;
          cursor: pointer;

          &.icon-tianjia {
            font-size: 17px;
          }
        }
      }
    }
  }
</style>