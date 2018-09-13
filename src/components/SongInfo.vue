<template>
  <div class="song-info-container">
    <div class="info-row">
      <span class="info-key">歌名：</span>
      <span>{{$store.state.playNow.title}}</span>
    </div>
    <div class="info-row">
      <span class="info-key">歌手：</span>
      <span>{{$store.state.playNow.artist}}</span>
    </div>
    <div class="info-row">
      <span class="info-key">专辑：</span>
      <span>{{$store.state.playNow.album}}</span>
    </div>
    <div class="info-row">
      <span class="info-key">标签：</span>
      <span>{{$store.state.nPSTags.join('、')}}</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: "SongInfo",
    data() {
      return {
      }
    }
  }
</script>

<style lang="scss">
  .song-info-container {
    color: white;
    padding-left: 30px;
    font-size: 16px;
    margin-top: 50px;

    .info-row {
      margin-bottom: 10px;
    }

    .info-key {
      padding-right: 10px;
    }
  }
</style>