<template>
  <div class="player-container">
    <div>
      <!-- 播放，上一首、下一首进度 -->
      <div class="control-btn">
        <div class="inline-block">
          <i class="icon-shangyishou1 iconfont" />
        </div>
        <div class="inline-block" v-if="!$store.state.playing" @click="$store.state.playing = true">
          <i class="iconfont icon-bofang" />
        </div>
        <div class="inline-block" v-if="$store.state.playing" @click="$store.state.playing = false">
          <i class="iconfont icon-zanting1" style="font-size: 34px;" />
        </div>
        <div class="inline-block" @click="$store.commit('playNext')">
          <i class="icon-xiayishou1 iconfont" />
        </div>
      </div>
      <div class="inline-block progress-container">
        <!-- 歌曲信息 -->
        <div class="song-info">
          <i class="el-icon-loading mr_10" v-if="$store.state.downloading" />
          <span>{{$store.state.playNow.title}}</span>
          <span style="padding-left: 30px;">{{$store.state.playNow.artist}}</span>
        </div>
        <!-- 歌曲播放进度 -->
        <div class="play-time">
          <span>
            {{formatTooltip(currentTime)}}
            /
            {{formatTooltip($store.state.playerInfo.duration)}}
          </span>
        </div>
        <!-- 进度条 -->
        <div class="progress" id="player-progress">
          <el-slider
            @change="(v) => playerDom.currentTime = v"
            :format-tooltip="formatTooltip"
            v-model="currentTime"
            :max="$store.state.playerInfo.duration" />
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
    <audio id="m-player" :src="$store.state.playNow.url" controls></audio>
  </div>
</template>

<script>
  import Num from '../assets/utils/num';
  import Storage from '../assets/utils/Storage';
  export default {
    name: "PlayerPage",
    data() {
      return {
        playerDom: null,
        currentTime: 0,
        volume: 0,
        stopUpdateCurrent: false,
        stopVolume: false,
        showVolume: false,
        showOrder: false,
        storage: Storage,
        orderList: ['suiji', 'danquxunhuan', 'liebiao'],
        orderType: Storage.get('orderType'),
      }
    },
    watch: {
    },
    mounted() {
      this.playerDom = document.getElementById('m-player');
      this.playerDom.volume = Storage.get('volume') || 1;
      const state = this.$store.state;
      state.playerDom = this.playerDom;
      if (!window.onMouseDownRange) {
        // 当点击进度条的滑块时需要停止进度的判断，否则松开鼠标后onchange事件无法返回正确的value
        const sDom = document.getElementsByClassName('el-slider__button el-tooltip');
        const sArr = ['stopUpdateCurrent', 'stopVolume'];
        window.onMouseDownRange = true; // 防止事件的重复绑定
        sArr.forEach((key, i) => {
          sDom[i].onmousedown = () => {
            this[key] = true;
          };
          sDom[i].onmouseup = () => {
            this[key] = false;
          }
        })
      }
      if (!window.checkPlayer) {
        // 定时任务，更新当前的播放情况
        window.checkPlayer = setInterval(() => {
          const pDom = this.playerDom;
          // 如果没有获取过歌曲的详细信息，那就获取
          if (!state.loading && !state.playNow.url && state.playNow.objectId) {
            const id = state.playNow.objectId;
            state.loading = true;
            this.getMusicInfo(id, (res) => {
              state.playNow = res;
              state.allSongs[id] = res;
              state.loading = false;
            });
          }

          state.downloading = !(state.playNow.url && (pDom.readyState === 4));

          // 不去更新data
          if (!this.stopUpdateCurrent) {
            this.currentTime = (state.playNow && state.playNow.url) ? pDom.currentTime : 0;
          }
          if (!this.stopVolume) {
            this.volume = Num(pDom.volume * 100);
          }

          // 只有当正在播放、加载完url时才播放
          if (state.playing && state.playNow && state.playNow.url && pDom.paused && !pDom.ended) {
            pDom.play();
          }
          // 如果url发生改变就停止（切歌时能及时停止）
          if (!state.playing || !state.playNow.url) {
            if (!pDom.paused) {
              pDom.pause();
            }
          }
          // 播放一下首（如果url还没加载到的话不要切歌，因为audio的dom还会认为处于播放完的状态，毕竟src没有改过）
          if (state.playing && pDom.ended && state.playNow.url) {
            if (this.orderType !== 'danquxunhuan') {
              this.$store.commit('playNext');
            } else {
              // 单曲循环的话，继续播放这首
              pDom.play();
            }
          }
          // 如果是单曲循环放完了，那就不停
          this.$store.commit('updatePlayer', {
            duration: pDom.duration,
          });
        }, 100);
      }
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
          () => {
            alert('down不下来');
          }
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