<!-- 这就是一个用来添加到歌单到中间层 -->
<template>
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
</template>

<script>
  import { mapGetters } from 'vuex';
  import { getQueryFromUrl } from "../assets/utils/stringHelper";
  import request from '../assets/utils/request';
  import Storage from '../assets/utils/Storage';

  export default {
    name: "AddToDir",
    data() {
      return {
        showTokenDialog: false,
        inputCookie: '',
      }
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
      },
      // 别的组件想要增删歌单
      add2DirInfo(data) {
        console.log(data);
        const { song, add, dir } = data;
        if (!song.songmid) {
          return;
        }
        let params = {}, u = 0;
        if (add) {
          params = { midlist: song.songmid, dirid: dir.dirid, typelist: 13 };
        } else {
          params = { uin: Storage.get('uQ'), dirid: dir.dirid, ids: song.songid, types: 3 };
          u = 1;
        }
        this.addToDir(params, u, dir.dissid, song.songmid);
      }
    },
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
        showList: 'getShowList',
        allSongs: 'getAllSongs',
        favList: 'getFavList',
        add2DirInfo: 'add2DirInfo',
        tagInfo: 'getTagInfo',
      }),
    },
    methods: {
      // 请求的部分
      addToDir(params, u, disstid, id) {
        const g_tk = Storage.get('qy_token');
        const uQ = Storage.get('uQ');
        // 一些校验，如果没登录、上次的添加还没结束等就停一下
        if (window.is2Dir) {
          this.$notify({
            title: '操作失败',
            message: '别急，等一下上次的操作结果，等不及就刷新一下',
          });
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
        request.getQQMyFavList(disstid, uQ, this,
          {
            isFav: disstid === this.favList.disstid,
            upShow: this.tagInfo.selected.dissid === disstid
          },
          (songs) => {
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
    }
  }
</script>

<style scoped>

</style>