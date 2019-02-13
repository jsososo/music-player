<template>
  <div class="mb_20 list-top-container">
    <div v-if="!selected.len" class="inline-block top-box">
      <el-radio-group :value="searchKey" @change="changeSearchKey">
        <el-radio-button label="列表内"></el-radio-button>
        <!--<el-radio-button label="站内"></el-radio-button>-->
        <el-radio-button label="QQ音乐"></el-radio-button>
      </el-radio-group>
      <input type="text" class="search-input" placeholder="找点什么吧" v-model="search">
    </div>
    <div v-if="selected.len" class="inline-block top-box">
      <div class="top-box-button" @click="selectAll">全 选</div>
      <div class="top-box-button" @click="cancel">取消</div>
      <span class="pr_15">批量：{{selected.len}}/{{allLength}}</span>
      <div class="top-box-button" @click="downAll">下载</div>
      <div class="top-box-button" @click="addAll(true)">添加</div>
      <div class="top-box-button" @click="addAll(false)" v-if="searchKey === '列表内'">删除</div>
    </div>
    <Avatar />
  </div>
</template>

<script>
  import Avatar from '@/components/Avatar';
  import request from '../assets/utils/request';
  import { mapGetters } from 'vuex';
  import { download } from "../assets/utils/stringHelper";

  export default {
    name: "Search",
    components: { Avatar },
    data() {
      return {
        search: '',
        allLength: 0,
      }
    },
    computed: {
      ...mapGetters({
        allSongs: 'getAllSongs',
        searchKey: 'getSearchKey',
        selected: 'getSelectedSongs',
        showList: 'getShowList',
      }),
    },
    watch: {
      showList(v) {
        this.allLength = v.filter(i => i.mediamid).length;
        this.$store.dispatch('updateSelectedSongs',
          {
            val: {},
            len: 0,
          });
      },
      search(v) {
        if (this.searchKey !== 'QQ音乐') {
          const data = {
            search: v.replace(/\s|,|，|\//g, ''),
            isAll: this.searchKey === '站内',
          };
          this.$store.dispatch('searchMusic', data);
        } else {
          this.searchQQMusic(v);
        }
      },
    },
    methods: {
      // 修改搜索范围
      changeSearchKey(v) {
        const val = v === 'QQ音乐' ? '列表内' : 'QQ音乐';
        this.$store.dispatch('changeSearchKey', val);
        if (v === 'QQ音乐') {
          const data = {
            search: this.search.replace(/\s|,|，|\//g, ''),
            isAll: v === '站内',
          };
          this.$store.dispatch('searchMusic', data);
        } else {
          this.searchQQMusic(this.search);
        }
      },
      // 搜索音乐
      searchQQMusic(v) {
        request.qq({
          apiName: 'QQ_SEARCH',
          data: { p: 1, n: 100, w: v, cr: 1, aggr: 1 },
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
              mediamid: item.size128 && item.media_mid, // 避免有的歌曲有id没有音乐
              cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${item.albummid}.jpg`,
              size128: item.size128,
              size320: item.size320,
              sizeape: item.sizeape,
              sizeflac: item.sizeflac,
              songid: item.songid,
            };
            this.allSongs[sItem.objectId] = sItem;
            return sItem;
          });
          this.$store.dispatch('updateAllSongs', this.allSongs);
          this.$store.dispatch('updateShowList', { list: result });
        })
      },
      // 批量下载
      downAll() {
        if (!this.selected.len) {
          return;
        }
        const list = this.selected.val;
        const allSongs = this.allSongs;
        Object.keys(list).forEach(k => list[k] && download(allSongs[k], this));
      },
      // 全选
      selectAll() {
        const { selected, showList } = this;
        showList.forEach(o => {
          if (o.mediamid && !selected.val[o.objectId]) {
            selected.val[o.objectId] = true;
            selected.len++;
          }
        });
        this.$store.dispatch('updateSelectedSongs', selected);
      },
      // 添加或删除全部
      addAll(add) {
        if (!this.selected.len) {
          return;
        }
        const song = {
          songid: [],
          songmid: [],
        };
        const list = this.selected.val;
        const allSongs = this.allSongs;
        Object.keys(list).forEach(k => {
          if (list[k]) {
            song.songid.push(allSongs[k].songid);
            song.songmid.push(allSongs[k].songmid);
          }
        });
        song.songid = song.songid.join(',');
        song.songmid = song.songmid.join(',');
        this.$store.dispatch('updateAdd2DirInfo', { song, add })
      },
      cancel() {
        this.$store.dispatch('updateSelectedSongs',
          {
            val: {},
            len: 0,
          });
      }
    }
  }
</script>

<style lang="scss">
  .list-top-container {
    min-width: 536px;

    .top-box {
      min-width: 464px;
      color: #fff;

      .top-box-button {
        display: inline-block;
        padding: 5px 10px;
        border: 1px solid #fff;
        border-radius: 5px;
        opacity: 0.6;
        cursor: pointer;
        transition: 0.3s;
        margin-right: 8px;

        &:hover {
          opacity: 0.8;
        }
      }
    }

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
  }
</style>