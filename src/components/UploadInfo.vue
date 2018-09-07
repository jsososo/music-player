<template>
  <div class="up-file-list">
    <div class="up-file-item" v-for="(f, i) in upList" :key="f.uid">
      <div class="img-container">
        <img class="file-img" v-if="f.img" :src="f.img">
        <div class="img-cover fc_blue" @click="changeCover(i)">
          换个图片
          <input style="display: none;" type="file" :id="`up-cover-${i}`" @change="uploadImg">
        </div>
      </div>
      <div class="info-container">
        <div class="input-line">
          歌名：<el-input class="input-box" v-model="f.title" />
          歌手：<el-input class="input-box"  v-model="f.artist" />
        </div>
        <div class="input-line">
          专辑：<el-input class="input-box" v-model="f.album" />
          搜索：<el-input class="input-box" v-model="f.search" />
        </div>
        <div class="input-line">
          标签：
          <el-select
            class="input-tag"
            v-model="f.tag"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="考虑加下标签呗">
          <el-option
            v-for="t in tags"
            :key="t"
            :label="t"
            :value="t">
          </el-option>
        </el-select>
        </div>
        <el-button v-if="!f.uploading" class="up-btn" @click="upload(i)">上传吧</el-button>
        <div class="up-progress" v-if="f.uploading">
          <div class="up-progress-green" :style="`width: ${f.progress}%`"></div>
          <div class="up-progress-num">{{f.progress}}%</div>
        </div>
        <i v-if="f.uploading" :class="f.className"></i>
      </div>
    </div>
  </div>
</template>

<script>
  import Storage from '../assets/utils/Storage';
  import Num from '../assets/utils/num';
  export default {
    name: "uploadInfo",
    props: {
      list: Array,
    },
    data() {
      return {
        upList: this.list,
        upCount: 0,
        tags: this.$store.state.sysTags,
        selectIndex: 0, // 选择图片的index
      }
    },
    methods: {
      upload(index) {
        const state = this.$store.state;
        const obj = this.upList[index];
        obj.uploading = true;
        obj.className = 'icon-result el-icon-loading';
        // 上传文件
        Storage.saveFile(obj.file, (res) => {
          // 上传成功后在 MusicSongs 表里记录音乐信息
          const params = {
            url: res.url,
            album: obj.album,
            cover: obj.img,
            title: obj.title,
            artist: obj.artist,
            search: obj.search,
          };
          Storage.createBmob(
            'MusicSongs',
            params,
            (s) => {
              obj.tag.forEach((t) => {
                if (!state.sysSongs[t]) {
                  state.sysTags.push(t);
                  state.sysSongs[t] = [];
                }
                state.sysSongs[t].push(s.id);
              });
              params.objectId = s.id;
              state.allSongs[s.id] = params;
              // 更新系统tag
              Storage.setBmob(
                'MusicTag',
                state.sysObjectId,
                {
                  tags: state.sysSongs,
                }
              );
              obj.className = 'icon-result el-icon-success'
            },
          )
        }, (p) => {
          // 上传进度
          obj.progress = Num(p.loaded / p.total * 100, 2);
        })
      },
      changeCover(i) {
        const id = `up-cover-${i}`;
        const input = document.getElementById(id);
        this.selectIdex = i;
        input.click();
      },
      uploadImg(e) {
        const reader = new FileReader();
        reader.readAsDataURL(e.path[0].files[0]);
        reader.onload = () => this.upList[this.selectIndex].img = reader.result;
      }
    }
  }
</script>

<style lang="scss">
  .up-file-list {

    .info-container {
      min-width: 600px;
      display: inline-block;
      vertical-align: top;
      padding-left: 20px;
    }

    .up-file-item {
      margin-top: 20px;

      .img-container {
        width: 200px;
        position: relative;
        display: inline-block;

        .file-img {
          width: 200px;
        }
        
        &:hover .img-cover {
          background: rgba(255,255,255,0.7);
          opacity: 1;
        }
        .img-cover {
          width: 200px;
          position: absolute;
          top: 0;
          left: 0;
          height: 200px;
          z-index: 9;
          cursor: pointer;
          background: rgba(255,255,255,0);
          opacity: 0;
          transition: 0.3s;
          text-align: center;
          line-height: 200px;
        }
      }

      .up-btn {
        margin-top: 15px;
        margin-left: 65px;
      }

      .input-line {
        margin-top: 15px;

        .input-tag {
          margin-left: 5px;
          width: 583px;
        }

        .input-box {
          display: inline-block;
          width: 250px;
          margin-left: 10px;
          margin-right: 20px;
        }
      }

      .up-progress {
        border: 1px solid #eaeaea;
        display: inline-block;
        width: 250px;
        height: 30px;
        position: relative;
        margin-left: 58px;
        margin-top: 20px;
        border-radius: 5px;
        overflow: hidden;
        text-align: center;

        .up-progress-green {
          position: absolute;
          top: 0;
          left: 0;
          background: #67C23A;
          height: 30px;
        }
        
        .up-progress-num {
          text-align: center;
          color: #666;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          line-height: 30px;
        }
      }

      .icon-result {
        vertical-align: top;
        margin-top: 20px;
        margin-left: 20px;
        font-size: 20px;
        line-height: 30px;
        display: inline-block;
        color: #67C23A;
      }
    }
  }
</style>