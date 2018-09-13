<template>
  <div :class="`play-cd-container playing-${$store.state.playing} loading-${$store.state.loading}`">
    <div class="cd-bg">
      <img v-if="$store.state.playNow.cover" :src="$store.state.playNow.cover">
    </div>
  </div>
</template>

<script>
  export default {
    name: "Cd"
  }
</script>

<style lang="scss">
  .loading-false .cd-bg {
    animation: cdRotate 30s infinite linear;
  }
  .playing-true .cd-bg {
    text-align: center;
    animation-play-state: running;
  }

  .playing-false .cd-bg {
    animation-play-state: paused;
  }

  @keyframes cdRotate {
    from {
      -webkit-transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .cd-bg {
    width: 300px;
    height: 300px;
    background: url("../../assets/img/cd.png") no-repeat;
    background-size: 300px 300px;
    position: relative;

    img {
      position: absolute;
      top: 75px;
      left: 75px;
      width: 150px;
      height: 150px;
      border-radius: 50%;
    }
  }
</style>