<template>
  <div class="mb_20">
    <el-radio-group v-model="sOpt">
      <el-radio-button label="列表内"></el-radio-button>
      <!--<el-radio-button label="站内"></el-radio-button>-->
      <el-radio-button label="QQ音乐"></el-radio-button>
    </el-radio-group>
    <input type="text" class="search-input" placeholder="找点什么吧" v-model="search">
    <Avatar />
  </div>
</template>

<script>
  import Avatar from '@/components/Avatar';
  import request from '../assets/utils/request';
  export default {
    name: "Search",
    components: { Avatar },
    data() {
      return {
        sOpt: '列表内',
        search: '',
      }
    },
    computed: {
      allSongs() {
        return this.$store.getters.getAllSongs;
      }
    },
    watch: {
      search(v) {
        if (this.sOpt !== 'QQ音乐') {
          const data = {
            search: v.replace(/\s|,|，|\//g, ''),
            isAll: this.sOpt === '站内',
          };
          this.$store.dispatch('searchMusic', data);
        } else {
          request.qq({
            apiName: 'QQ_SEARCH',
            data: { p: 1, n: 100, w: v, cr: 1 },
          }, (res) => {
            const result = res.data.song.list.map((item) => {
              const sItem = {
                from: 'qq',
                album: item.albumname,
                albummid: item.albummid,
                title: item.songname,
                songmid: item.songmid,
                artist: item.singer.map(s => s.name).join('/'),
                objectId: item.songmid,
                cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${item.albummid}.jpg`,
              };
              this.allSongs[sItem.objectId] = sItem;
              return sItem;
            });
            this.$store.dispatch('updateAllSongs', this.allSongs);
            this.$store.dispatch('updateShowList', result);
          })
        }
      },
      sOpt(v) {
        if (v !== 'QQ音乐') {
          const data = {
            search: this.search.replace(/\s|,|，|\//g, ''),
            isAll: v === '站内',
          };
          this.$store.dispatch('searchMusic', data);
        }
      }
    }
  }
</script>

<style lang="scss">
  .el-radio-button__inner {
    background: transparent !important;
    color: rgba(255,255,255,0.5) !important;
    border: 1px rgba(255,255,255,0.5) dashed !important;
    outline: none;
    box-shadow: none !important;
  }
  .el-radio-button__orig-radio:checked+.el-radio-button__inner {
    color: white !important;
    border: 1px solid white !important;
  }

  .search-input {
    background: transparent !important;
    border: transparent;
    border-bottom: 1px solid rgba(255,255,255, 0.5) !important;
    color: white;
    font-size: 20px;
    outline: none !important;
    width: 300px;
    vertical-align: -5px;
    margin-left: 20px;

    &::-webkit-input-placeholder {
      color: rgba(255,255,255,0.5);
    }
  }
</style>