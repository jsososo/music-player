<template>
  <div class="player-container">
    <div v-if="showControl">
      <!-- 播放，上一首、下一首进度 -->
      <div class="control-btn">
        <div class="inline-block">
          <i class="icon-shangyishou1 iconfont" @click="cutSong('playPrev')"/>
        </div>
        <div class="inline-block" v-if="!playing">
          <i class="iconfont icon-bofang" @click="updatePlayingStatus(true)"/>
        </div>
        <div class="inline-block" v-if="playing">
          <i class="iconfont icon-zanting1" style="font-size: 34px;" @click="updatePlayingStatus(false)"/>
        </div>
        <div class="inline-block">
          <i class="icon-xiayishou1 iconfont" @click="cutSong('playNext')"/>
        </div>
      </div>
      <div class="inline-block progress-container">
        <!-- 歌曲信息 -->
        <div class="song-info">
          <i class="el-icon-loading mr_10" v-if="loading || downloading" />
          <span class="player-song-title">{{playNow.title}}</span>
          <span class="player-song-singer pl_20">{{playNow.artist}}</span>
          <span
            @click="add2Dir({ dirid: favList.id, dissid: favList.disstid }, !Boolean(favList[playNow.songmid]), true)"
            style="margin-left: 25px; cursor: pointer;"
            :class="favList[playNow.songmid] ? 'iconfont icon-xihuan iconfont' : 'iconfont icon-weixihuan'">
          </span>
        </div>
        <!-- 歌曲播放进度 -->
        <div class="play-time">
          <span>
            {{formatTooltip(currentTime)}}
            /
            {{formatTooltip(playerInfo.duration)}}
          </span>
        </div>
        <!-- 进度条 -->
        <div class="progress" id="player-progress">
          <el-slider
            @change="(v) => playerDom.currentTime = v"
            :format-tooltip="formatTooltip"
            v-model="currentTime"
            :max="playerInfo.duration || 1" />
        </div>
      </div>
      <!-- 音量、播放顺序、列表等控制 -->
      <div class="other-control inline-block">
        <!-- 音量控制 -->
        <div class="volume-control"  @mouseout="showVolume = false">
          <div v-if="showVolume" class="volume-slider-container" @mouseout="showVolume = false" @mouseover="showVolume = true">
            <div class="volume-slider" >
              <el-slider
                v-model="volume"
                @change="changeVolume"
                :vertical="true"
                height="80px"
                :max="100"/>
            </div>
          </div>
          <i class="iconfont icon-volume" @mouseover="showVolume = true" />
        </div>
        <!-- 播放顺序 -->
        <div class="order-control"  @mouseout="showOrder = false">
          <div v-if="showOrder" class="order-list-container" @mouseout="showOrder = false" @mouseover="showOrder = true">
            <div class="order-list">
              <div v-for="key in orderList" v-if="orderType !== key" :key="`order-${key}`" @click="changeOrderType(key)">
                <i :class="`iconfont icon-${key}`" />
              </div>
            </div>
          </div>
          <div class="now-order-type" @mouseover="showOrder = true" >
            <i :class="`iconfont icon-${orderType}`" />
          </div>
        </div>
        <!-- 下载 -->
        <div class="inline-block ml_5">
          <span @click="down(playNow)">
            <i class="iconfont icon-xiazai" />
          </span>
        </div>
      </div>
    </div>
    <audio id="m-player" :src="playNow.url" controls></audio>
  </div>
</template>

<script>
  import Num from '../assets/utils/num';
  import Storage from '../assets/utils/Storage';
  import { mapGetters } from 'vuex';
  import request from '../assets/utils/request';
  import { handleLyric, getSongUrl, download, getQueryFromUrl } from "../assets/utils/stringHelper";
  import timer from '../assets/utils/timer';
  import { Base64 } from 'js-base64';

  export default {
    name: "PlayerPage",
    data() {
      return {
        playerDom: null,
        currentTime: 0,
        volume: 0,
        stopUpdateCurrent: false,
        showVolume: false,
        showOrder: false,
        orderList: ['suiji', 'danquxunhuan', 'liebiao'],
        orderType: Storage.get('orderType'),
        showControl: !getQueryFromUrl('hideControl'),
      }
    },
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
        playing: 'isPlaying',
        downloading: 'isDownloading',
        playerInfo: 'getPlayerInfo',
        loading: 'isLoading',
        allSongs: 'getAllSongs',
        favList: 'getFavList',
        radioInfo: 'getRadioInfo',
      }),
    },
    watch: {
      playNow(v) {
        document.title = v.title;
        const vkey_expire = Storage.get('vkey_expire');
        // 获取歌曲的url
        const musicUrl = getSongUrl(v);
        // 更新后面的背景
        document.getElementById('play-music-bg').src = v.cover;
        // 如果一个半小时了那就更新一下vkey，实际好像是两个小时过期
        if (timer().str('YYYYMMDDHHmm') > vkey_expire) {
          request.getQQVkey();
        } else if (v.url === musicUrl) {
          // 说明vkey没过期而且链接不变
          return;
        }
        this.currentTime = 0;
        const dispatch = this.$store.dispatch;
        if (v.from === 'qq') {
          // 获取音乐的url
          const song = {
            url: musicUrl,
            expire: vkey_expire,
            format: v.formatKey,
            downAfter: v.downAfter,
          };
          // 获取歌词
          request.qq({
            apiName: 'QQ_GET_LYRIC',
            data: {
              songmid: v.objectId,
            },
            cb: 'MusicJsonCallback_lrc'
          }, (res) => {
            res.lyric && (song.lyric = handleLyric(Base64.decode(res.lyric)));
            res.trans && (song.lyricTrans = handleLyric(Base64.decode(res.trans)));
            dispatch('updateSongDetail', { info: song, index: v.objectId });
            if (this.playNow.objectId === v.objectId) {
              dispatch('updatePlayNow', this.allSongs[v.objectId]);
            }
          });
        }
      }
    },
    mounted() {
      this.playerDom = document.getElementById('m-player');
      this.playerDom.volume = Storage.get('volume') || 1;
      // 初始化音量
      this.volume = (Storage.get('volume') || 1) * 100;

      // audio标签
      const pDom = this.playerDom;
      // slider，进度条
      const sDom = document.getElementsByClassName('el-slider__button el-tooltip')[0];
      const dispatch = this.$store.dispatch;
      window.onhashchange = () => this.showControl = !getQueryFromUrl('hideControl');

      // audio加载完成
      pDom.oncanplaythrough = () => {
        if (this.playing && this.playNow.url === pDom.src) {
          pDom.play();
        }
        dispatch('setDownLoading', false);
        dispatch('updatePlayerInfo', { duration: pDom.duration, current: 0 });
      };
      // 一般是403，高品质的音乐有时候会被qq音乐禁了，这里弄一个向下兼容，如果128也有问题就切歌；
      pDom.onerror = () => {
        const playNow = this.playNow;
        switch (playNow.format) {
          case 'sizeflac':
          case 'sizeape':
          case 'size320':
            break;
          case 'size128':
            this.$message.error('歌曲有问题，自动切到一下首咯');
            setTimeout(() => {
              this.cutSong('playNext');
            }, 3000);
            return;
        }
        playNow[playNow.format] = 0;
        this.allSongs[playNow.objectId] = playNow;
        dispatch('updatePlayNow', { ...playNow });
      };
      // audio正在加载音乐
      pDom.onwaiting = () => dispatch('setDownLoading', true);
      // audio放完了
      pDom.onended = () => {
        if (this.orderType !== 'danquxunhuan') {
          dispatch('playNext');
        } else {
          // 单曲循环的话，继续播放这首
          pDom.play();
        }
      };
      // 音乐播放时进度条
      pDom.ontimeupdate = () => {
        !this.stopUpdateCurrent && (this.currentTime = this.playNow.url ? pDom.currentTime : 0);
        dispatch('updatePlayerInfo', { current: this.currentTime, duration: pDom.duration });
      };
      // 当点击进度条的滑块时需要停止进度的判断，否则松开鼠标后onchange事件无法返回正确的value
      sDom && (sDom.onmousedown = () => this.stopUpdateCurrent = true);
    },
    methods: {
      formatTooltip(v) {
        return `${Num(v / 60, 0, -1)}:${Num(v % 60, 0) < 10 ? `0${Num(v % 60, 0)}` : Num(v % 60, 0)}`;
      },
      // 音量控制，写入缓存
      changeVolume(v) {
        this.playerDom.volume = v / 100;
        Storage.set('volume', v / 100);
      },
      // 切换播放顺序
      changeOrderType(v) {
        this.orderType = v;
        Storage.set('orderType', v);
        this.$store.dispatch('updateRandomHistory');
      },
      // 播放、暂停
      updatePlayingStatus(status) {
        this.playerDom[['pause', 'play'][Number(status)]]();
        this.$store.dispatch('updatePlayingStatus', status);
      },
      // 切歌。包括上一首。下一首
      cutSong(type) {
        this.playerDom.pause();
        const sRId = this.radioInfo.selected.radioId;
        // 是否是电台模式
        if (sRId) {
          this.$store.dispatch('radioPlayNext', { id: sRId, next: type === 'playNext' })
        } else {
          this.$store.dispatch(type);
        }
      },
      // 添加到歌单
      add2Dir(dir, add, fav) {
        this.$store.dispatch('updateAdd2DirInfo', { song: this.playNow, dir, add, fav })
      },
      down(v) {
        download(v, this)
      }
    }
  }
</script>

<style lang="scss">
  audio {
    display: none !important;
  }
  .player-container {
    z-index: 1000;
    width: 100vw;
    height: 90px;
    position: fixed;
    bottom: 0;
    left: 0;
    padding-left: 20px;

    .other-control {
      margin-left: 25px;
      margin-top: 32px;

      .iconfont {
        font-size: 20px;

        &.icon-xiazai:before {
          font-size: 16px;
          vertical-align: -1px;
          cursor: pointer;
        }
      }

      .order-control {
        display: inline-block;
        position: relative;

        .now-order-type {
          padding: 10px;
          margin-top: -5px;
        }

        .order-list-container {
          padding-bottom: 40px;
          position: absolute;
          top: -76px;
        }
        
        &.hide-order {
          padding-bottom: 0;
          top: 0;

          .order-list-container {
            padding-bottom: 0;
          }

          .order-list {
            display: none;
            opacity: 0;
          }

          .now-order-type {
            margin-top: 30px;
          }
        }

        .order-list {
          position: relative;
          padding: 4px 0;
          border-radius: 10px;
          border: 1px solid #eaeaea;
          opacity: 1;
          transition: 0.4s opacity;
          background: rgba(255,255,255,0.4);

          div {
            padding: 3px 10px;
            cursor: pointer;
            &:hover {
              background: rgba(255,255,255,0.3);
            }
          }
        }
      }

      .volume-control {
        display: inline-block;
        position: relative;

        .volume-slider-container {
          position: absolute;
          padding-bottom: 40px;
          top: -125px;
          opacity: 1;
          transition: 0.4s opacity;
        }

        .iconfont {
          margin: -5px 10px 0 10px;
        }

        &.hide-slider {
          top: 0;
          height: 90px;

          .iconfont {
            margin: 40px 10px;
          }
        }

        .volume-slider {
          background: rgba(255,255,255,0.4);
          border: #eaeaea 1px solid;
          padding: 15px 0;
          border-radius: 10px;
        }
      }
    }

    .progress-container {
      margin-top: 15px;
      margin-left: 15px;
      color: white;

      .song-info {
        font-size: 14px;
        display: inline-block;
        font-weight: 900;
      }

      .play-time {
        display: inline-block;
        font-size: 14px;
        font-weight: 900;
        float: right;
      }

      .progress {
        width: 700px;
        margin-top: -5px;
      }
    }

    .iconfont {
      color: White;
    }

    .el-slider__runway {
      background: white !important;
    }

    .control-btn {
      margin-top: 25px;
      margin-left: 30px;
      display: inline-block;

      >div {
        width: 50px;
      }

      .iconfont {
        font-size: 30px;
        cursor: pointer;
        line-height: 50px;
      }
    }

    .player-song-singer, .player-song-title {
      display: inline-block;
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>