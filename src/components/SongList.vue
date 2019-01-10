<template>
  <div class="song-list">
    <div :class="s.mediamid ? (playNow.objectId === s.objectId ? 'song-item playing' : 'song-item') : 'song-item song-empty'"
         v-for="(s, i) in showList"
         :key="`${s.objectId}-${i}`"
    >
      <span class="song-order" @click="playMusic(s.objectId, s.mediamid)">{{i + 1}}</span>
      <span class="song-title" @click="playMusic(s.objectId, s.mediamid)">{{s.title}}</span>
      <span class="song-artist">
        <span class="song-artist-txt" @click="playMusic(s.objectId, s.mediamid)">{{s.artist}}</span>
        <span class="song-operation">
          <span
            @click="like(s.songmid, s.songid)"
            :class="favList[s.songmid] ? 'iconfont icon-xihuan iconfont' : 'iconfont icon-weixihuan'"></span>
          <!--<span class="iconfont icon-tianjia"></span>-->
        </span>
      </span>
    </div>
    <div class="empty-status" v-if="showList.length === 0">空空如也！</div>

    <el-dialog
      width="650px"
      :visible="showTokenDialog"
      :modal-append-to-body="true"
      :append-to-body="true"
      :before-close="() => showTokenDialog = false"
    >
      <div style="width: 600px; text-align: left">
        <el-alert
          title="添加到歌单到功能需要获取 y.qq.com 域名下的token值，您可能还未获取或已过期，本站不会做收集，只会将数据存于您本地"
          type="info"
          show-icon>
        </el-alert>
        <div class="pl_20">
          <div class="mt_10">
            1、登陆QQ音乐官网： <a href="https://y.qq.com" target="_blank">https://y.qq.com</a>
          </div>
          <div class="mt_10">
            2、打开开发者模式：（<code>option+command+i</code> 或 <code>ctrl+shift+i</code>）
          </div>
          <div class="mt_10">
            3、将下面内容粘贴并敲下回车：<code>console.log(document.cookie)</code>
          </div>
          <div class="mt_10">
            4、粘贴进去就ok啦！<el-input style="width: 200px;margin-left: 10px" v-model="inputCookie"/>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import Storage from '../assets/utils/Storage';
  import { getQueryFromUrl } from "../assets/utils/stringHelper";
  import request from '../assets/utils/request';

  export default {
    name: "SongList",
    props: {
      isSys: Boolean,
      tag: String,
      hideHeader: Boolean,
    },
    data() {
      return {
        showTokenDialog: false,
        inputCookie: '',
      }
    },
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
        showList: 'getShowList',
        allSongs: 'getAllSongs',
        favList: 'getFavList',
      }),
    },
    watch: {
      inputCookie(v) {
        document.cookie = v;
        const c = getQueryFromUrl(null, `?${v.replace(/;\s/g, '&')}`);
        const token = c.p_skey || c.skey || c.p_lskey || c.lskey || '';
        if (!token) {
          this.$message.error('你肯定粘错了东西～');
        } else {
          // qq音乐那里扒来的转码方法
          const f = (e) => {
            let n = 5381;
            for (let o = 0, t = e.length; t > o; ++o)
              n += (n << 5) + e.charCodeAt(o);
            return 2147483647 & n;
          };
          Storage.set('qy_token', f(`${token}`));
          this.$message.success('ok！');
        }
      }
    },
    methods: {
      like(id, sid) {
        const { favList } = this;
        let params = {}, u = 0;
        if (!favList[id]) {
          //  添加到我喜欢
          params = { midlist: id, dirid: favList.id, typelist: 13 };
        } else {
          //  移除我喜欢
          params = {
            uin: Storage.get('uQ'),
            dirid: favList.id,
            ids: sid,
            types: 3,
          };
          u = 1;
        }
        this.addToDir(params, u, favList.disstid, id);
      },
      // 请求的部分
      addToDir(params, u, disstid, id) {
        const g_tk = Storage.get('qy_token');
        const uQ = Storage.get('uQ');
        // 一些校验，如果没登录、上次的添加还没结束等就停一下
        if (window.is2Dir) {
          this.$message.info('别急，等一下哈，等不及就刷新一下');
          return;
        }
        if (!uQ) {
          this.$message.error('请先点击右上角登陆');
          return;
        }
        if (!g_tk) {
          this.showTokenDialog = true;
          return;
        }
        window.is2Dir = true;
        const iframe = document.getElementById('add2Dir');

        // 参数拼装
        const data = {
          g_tk,
          formsender: 4,
          ...params,
        };
        const dataArr = Object.keys(data).map(k => `${k}=${data[k]}`);

        // iframe 加载完成后会触发的函数，就是请求的回调函数
        window.add2DirCb = this.checkResult(disstid, uQ, u, id);
        // iframe请求
        const url = ['//c.y.qq.com/splcloud/fcgi-bin/fcg_music_add2songdir.fcg', '//c.y.qq.com/qzone/fcg-bin/fcg_music_delbatchsong.fcg'];
        iframe.src = `${url[u]}?${dataArr.join('&')}`
      },
      checkResult(disstid, uQ, u, id) {
        request.getQQMyFavList(disstid, uQ, this, { isFav: disstid === this.favList.disstid }, (songs) => {
          window.is2Dir = false;
          const item = songs.find(s => s.songmid === id);
          if (item && !u) {
            this.$message.success('添加成功！');
          } else if (!item && u) {
            this.$message.success('删除成功！');
          } else {
            this.$message.error('cookie过期了？');
            this.showTokenDialog = true;
          }
        })
      },
      playMusic(id, mediaid) {
        const pDom = document.getElementById('m-player');
        if (!mediaid) {
          this.$message.info('企鹅音乐暂无版权～');
          return;
        }
        const dispatch = this.$store.dispatch;
        dispatch('updatePlayingStatus', true);
        pDom.play();
        if (this.playNow.objectId !== id) {
          dispatch('updatePlayNow', this.allSongs[id])
        } else {
          pDom.currentTime = 0;
        }
      },
    }
  }
</script>

<style lang="scss">
  .song-list {
    display: inline-block;
    height: calc(100vh - 200px);
    overflow-y: auto;
    overflow-x: hidden;
    width: 550px;
    margin-top: 10px;
    margin-right: 20px;

    &::-webkit-scrollbar
    {
      width:8px;
      height:8px;
      background-color:rgba(0,0,0,0);
    }
    /*定义滚动条轨道
     内阴影+圆角*/
    &::-webkit-scrollbar-track
    {
      border-radius:10px;
      background-color: rgba(255,255,255,0.1);
    }
    /*定义滑块
     内阴影+圆角*/
    &::-webkit-scrollbar-thumb
    {
      border-radius:10px;
      background-color:rgba(255,255,255,0.5);
    }
  }

  .empty-status {
    color: White;
    font-size: 20px;
    text-align: center;
    line-height: 30px;
    padding: 30px;
  }
  .song-item {
    width: 100%;
    transition: 0.5s;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    text-overflow: ellipsis;
    cursor: default;

    &.playing {
      background: rgba(255,255,255,0.2);
      border-bottom: 1px solid rgba(255,255,255,0.9);
    }

    &.song-empty {
      opacity: 0.55;
      &:hover {
        .song-artist-txt {
          opacity: 1 !important;
        }
        .song-operation {
          display: none !important;
        }
      }
    }

    &:hover {
      background: rgba(255,255,255,0.2);

      .song-artist {
        .song-artist-txt {
          opacity: 0;
        }
        .song-operation {
          display: inline-block;
          opacity: 1;
        }
      }
    }

    span {
      display: inline-block;
      padding: 10px;
      box-sizing: border-box;
      color: #eee;
      font-size: 14px;
      vertical-align: top;
      word-wrap: break-word;
    }
    .song-order {
      width: 10%
    }
    .song-title {
      width: 55%;
    }
    .song-artist {
      width: 35%;
      position: relative;

      .song-artist-txt {
        display: inline-block;
        opacity: 1;
        padding: 0;
      }
      .song-operation {
        position: absolute;
        top: 10px;
        left: 10px;
        display: none;
        vertical-align: top;
        padding: 0;
        opacity: 1;
        transition: 0.5s;

        .iconfont {
          padding: 0;
          margin-right: 10px;
          font-size: 18px;
          cursor: pointer;

          &.icon-tianjia {
            font-size: 17px;
          }
        }
      }
    }
  }
</style>