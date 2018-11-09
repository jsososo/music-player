<template>
  <div class="song-info-container">
    <div class="info-row">
      <span class="info-key">歌名：</span>
      <span>{{playNow.title}}</span>
    </div>
    <div class="info-row">
      <span class="info-key">歌手：</span>
      <span>{{playNow.artist}}</span>
    </div>
    <div class="info-row">
      <span class="info-key">专辑：</span>
      <span>{{playNow.album}}</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: "SongInfo",
    computed: {
      playNow() {
        return this.$store.getters.getPlaying;
      }
    },
  }
</script>

<style lang="scss">
  .song-info-container {
    color: white;
    padding-left: 30px;
    font-size: 16px;
    margin-top: 50px;
    width: 400px;

    .info-row {
      margin-bottom: 10px;
    }

    .info-key {
      padding-right: 10px;
    }
  }
</style>