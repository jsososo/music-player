<template>
  <div>
    <div v-if="playNow.lyric" class="lyric-list">
      <div v-for="(item, index) in playNow.lyric" v-if="index > lyricIndex - 6" :class="`lyric-item lyric-item-${index - lyricIndex}`">
        {{item.str || ''}}
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  export default {
    name: "Lyric",
    data() {
      return {
        lyricIndex: -1,
      }
    },
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
        playerInfo: 'getPlayerInfo',
      })
    },
    watch: {
      playerInfo(v) {
        const lyric = this.playNow.lyric || [];
        const current = Math.round(v.current * 100);
        if (lyric.length) {
          let index = lyric.findIndex((item) => item.time > current) - 1;
          if (current >= lyric[lyric.length - 1].time) {
            index = lyric.length - 1;
          }
          if (index !== this.lyricIndex) {
            this.lyricIndex = index;
          }
        }
      },
    },
    created() {

    }
  }
</script>

<style scoped>
  .lyric-list {
    height: calc(100vh - 200px);
    overflow: hidden;
  }
  .lyric-item {
    color: rgba(255,255,255,0.5);
    text-align: center;
    font-size: 18px;
    margin: 20px 0;
    transition: 0.3s;
    min-height: 15px;
    line-height: 30px;
  }
  .lyric-item-0 {
    color: white;
    font-size: 24px;
    font-weight: bold;
  }
</style>