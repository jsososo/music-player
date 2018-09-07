<template>
  <div class="player-container">
    <div>
      <!-- 播放，上一首、下一首进度 -->
      <div class="control-btn">
        <icon name="step-backward" scale="1.5"/>
        <div class="inline-block" v-if="!$store.state.playing" @click="$store.state.playing = true">
          <icon name="play" scale="1.5"/>
        </div>
        <div class="inline-block" v-if="$store.state.playing" @click="$store.state.playing = false">
          <icon name="pause" scale="1.5"/>
        </div>
        <div class="inline-block" @click="$store.commit('playNext')">
          <icon name="step-forward" scale="1.5"/>
        </div>
      </div>
      <div class="inline-block progress-container">
        <!-- 歌曲信息 -->
        <div class="song-info">
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
      <div class="other-control inline-block" @mouseover="showVolume = true" @mouseout="showVolume = false" >
        <!-- 音量控制 -->
        <div class="volume-control">
          <div style="margin-top: 10px;" :class="showVolume ? '' : 'hidden'">
            <el-slider
              v-model="volume"
              @change="changeVolume"
              :vertical="true"
              height="60px"
              :max="100"/>
          </div>
          <icon style="margin: 40px 10px;" v-if="!showVolume" name="volume-up" scale="1.3" />
        </div>
        <!-- 播放顺序 -->
        <div class="order-control"></div>
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

          // 不去更新data
          if (!this.stopUpdateCurrent) {
            this.currentTime = (state.playNow && state.playNow.url) ? pDom.currentTime : 0;
          }
          if (!this.stopVolume) {
            this.volume = pDom.volume * 100;
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
            this.$store.commit('playNext');
          }
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
    }
  }
</script>

<style lang="scss">
  .hidden {
    display: none;
  }
  audio {
    display: none !important;
  }
  .player-container {
    width: 100vw;
    height: 90px;
    position: fixed;
    bottom: 0;
    left: 0;
    border-top: 1px solid #409EFF;
    background: white;
    padding-left: 60px;

    .other-control {
      margin-left: 25px;
    }

    .progress-container {
      margin-top: 15px;

      .song-info {
        font-size: 13px;
        display: inline-block;
      }

      .play-time {
        display: inline-block;
        font-size: 13px;
        color: #999;
        float: right;
      }

      .progress {
        width: 700px;
        margin-top: -5px;
      }
    }

    .fa-icon {
      color: #409EFF;
    }

    .control-btn {
      margin-top: 35px;
      margin-left: 30px;
      display: inline-block;

      .fa-icon {
        margin-right: 25px;
      }
    }
  }
</style>