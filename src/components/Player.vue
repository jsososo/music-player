<template>
  <div class="player-container">
    <div>
      <div class="control-btn">
        <icon name="step-backward" scale="1.5"/>
        <div class="inline-block" v-if="$store.state.playerInfo.paused" @click="controlPlayer('play')">
          <icon name="play" scale="1.5"/>
        </div>
        <div class="inline-block" v-if="!$store.state.playerInfo.paused" @click="controlPlayer('pause')">
          <icon name="pause" scale="1.5"/>
        </div>
        <icon name="step-forward" scale="1.5"/>
      </div>
      <div class="inline-block progress-container">
        <div class="song-info">
          <span>{{$store.state.playNow.title}}</span>
          <span style="padding-left: 30px;">{{$store.state.playNow.artist}}</span>
        </div>
        <div class="progress">
          <el-slider :format-tooltip="formatTooltip" v-model="$store.state.playerInfo.current" :max="$store.state.playerInfo.duration" />
        </div>
      </div>
    </div>
    <audio id="m-player" autoplay :src="$store.state.playNow.url" controls></audio>
  </div>
</template>

<script>
  import Num from '../assets/utils/num';
  export default {
    name: "PlayerPage",
    data() {
      return {
        player: document.getElementById('m-player'),
      }
    },
    watch: {
    },
    created() {
      if (!window.checkPlayer) {
        window.checkPlayer = setInterval(() => {
          const pDom = document.getElementById('m-player');
          if (!pDom) {
            return;
          }
          this.$store.commit('updatePlayer', {
            duration: pDom.duration,
            current: pDom.currentTime,
            paused: pDom.paused,
          })
        }, 100);
      }
    },
    methods: {
      formatTooltip(v) {
        return `${Num(v / 60, 0, -1)}:${Num(v % 60, 0) < 10}`;
      },
      controlPlayer(type) {
        document.getElementById('m-player')[type]();
        console.log(document.getElementById('m-player').duration);
        console.log(document.getElementById('m-player').currentTime);
      }
    }
  }
</script>

<style lang="scss">
  audio {
    /*display: none !important;*/
    position: fixed;
    top: 0;
    right: 0;
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

    .progress-container {
      margin-top: 10px;

      .song-info {
        font-size: 13px;
      }

      .progress {
        width: 700px;
      }
    }

    .control-btn {
      color: #409EFF;
      margin-top: 35px;
      margin-left: 30px;
      display: inline-block;

      .fa-icon {
        margin-right: 25px;
      }
    }
  }
</style>