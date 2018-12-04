<template>
  <div class="player-container">
    <div>
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
          <span>{{playNow.title}}</span>
          <span style="padding-left: 30px;">{{playNow.artist}}</span>
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
        <div :class="`volume-control ${!showVolume && 'hide-slider'}`"  @mouseout="showVolume = false">
          <div class="volume-slider-container" @mouseout="showVolume = false" @mouseover="showVolume = true">
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
        <div :class="`order-control ${!showOrder && 'hide-order'}`"  @mouseout="showOrder = false">
          <div class="order-list-container" @mouseout="showOrder = false" @mouseover="showOrder = true">
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
        <!-- 播放列表 -->
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
  import { handleLyric } from "../assets/utils/stringHelper";

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
      }),
    },
    watch: {
      playNow(v) {
        this.currentTime = 0;
        const dispatch = this.$store.dispatch;
        if (!v.url && !v.from) {
          const id = v.objectId;
          dispatch('setLoading', true);
          this.getMusicInfo(id, (res) => {
            if (this.playNow.objectId === res.objectId) {
              dispatch('updatePlayNow', res);
              dispatch('setLoading', false);
            }
            dispatch('updateSongDetail', { info: res, index: id });
          });
        } else if (v.from === 'qq') {
          if (v.url) {
            return;
          }
          // 获取音乐的url
          const params = {
            data: {
              req_0: {
                module: "vkey.GetVkeyServer", // 管他什么写死就好了
                method: "CgiGetVkey",  // 管他什么写死就好了
                param: {
                  guid: "5339940689", // 管他什么写死就好了
                  songmid: [v.objectId],  // 歌曲的mid
                  songtype: [0], // 管他什么写死就好了
                  uin: "", // 用户的qq号，传不传无所谓
                  platform: "20",  // 管他什么写死就好了
                },
              },
            },
          };
          params.data = JSON.stringify(params.data);
          // 请求获取歌曲的url
          request.qq({
            apiName: 'QQ_SONG_INFO',
            data: params,
            cb: 'getMusicUrl',
          }, (res) => {
            const resData = res.req_0.data;
            const song = {
              url: `${resData.sip[0]}${resData.midurlinfo[0].purl}`,
            };
            // 获取歌词
            request.qq({
              apiName: 'QQ_GET_LYRIC',
              data: {
                nobase64: 1,
                songmid: v.objectId,
              }
            }, (res) => {
              song.lyric = handleLyric(res.lyric);
              dispatch('updateSongDetail', { info: song, index: v.objectId });
              if (this.playNow.objectId === v.objectId) {
                dispatch('updatePlayNow', this.allSongs[v.objectId]);
              }
            });
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

      // audio加载完成
      pDom.oncanplaythrough = () => {
        if (this.playing && this.playNow.url === pDom.src) {
          pDom.play();
        }
        dispatch('setDownLoading', false);
        dispatch('updatePlayerInfo', { duration: pDom.duration, current: 0 });
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
        dispatch('updatePlayerInfo', { current: this.currentTime });
      };
      // 当点击进度条的滑块时需要停止进度的判断，否则松开鼠标后onchange事件无法返回正确的value
      sDom.onmousedown = () => this.stopUpdateCurrent = true;
    },
    methods: {
      getMusicInfo(id, cb) {
        Storage.queryBmob(
          'MusicSongs',
          (q) => {
            q.equalTo('objectId', id);
            return q;
          },
          cb,
          () => alert('down不下来'),
        )
      },
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
        this.$store.dispatch(type);
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

      .iconfont {
        font-size: 20px;
      }

      .order-control {
        display: inline-block;
        position: relative;
        top: -45px;

        .now-order-type {
          padding: 10px;
          margin-top: -5px;
        }

        .order-list-container {
          padding-bottom: 10px;
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
        vertical-align: top;
        height: 165px;
        top: -87px;

        .volume-slider-container {
          position: relative;
          padding-bottom: 20px;
          opacity: 1;
          transition: 0.4s opacity;
        }

        .iconfont {
          margin: -5px 10px 0 10px;
        }

        &.hide-slider {
          top: 0;
          height: 90px;

          .volume-slider-container {
            padding-bottom: 0;
            opacity: 0;
          }
          .iconfont {
            margin: 40px 10px;
          }
          .volume-slider {
            display: none;
          }
        }

        .volume-slider {
          position: relative;
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
  }
</style>