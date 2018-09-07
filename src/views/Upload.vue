<template>
  <div>
    <div class="text-center" v-if="!upList.length">
      <el-upload
        ref="upload"
        drag
        accept=".mp3, .m4a"
        action=""
        show-file-list
        :auto-upload="false"
        :http-request="uploadFun"
        multiple>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <el-button size="large" style="width: 1200px;" class="mt_10" @click="submit">就这些</el-button>
    </div>
    <UploadInfo :list="upList" />
  </div>
</template>

<script>
  import { parse } from 'id3-parser';
  import { convertFileToBuffer } from 'id3-parser/lib/universal/helpers';
  import { u8ToBase64 } from "../assets/utils/stringHelper";
  import UploadInfo from "@/components/UploadInfo.vue";

  export default {
    name: "Upload",
    components: {
      UploadInfo,
    },
    data() {
      return {
        img: '',
        upList: [],
      }
    },
    methods: {
      submit() {
        this.$refs.upload.submit();
      },
      uploadFun(data) {
        // Storage.saveFile(data.file, (res) => console.log(res), (data) => console.log(data));
        // You have a File instance in browser
        convertFileToBuffer(data.file).then(parse).then(tag => {
          const fileInfo = {
            file: data.file,
            title: tag.title,
            album: tag.album,
            artist: tag.artist,
            isUp: false,
            progress: 0,
            uploading: false,
            tag: [],
            className: '',
            search: '',
          };
          if (tag.image && tag.image.data) {
            fileInfo.img = u8ToBase64(tag.image.data);
          }
          this.upList.push(fileInfo);
        });
      },
    }
  }
</script>

<style lang="scss">
  .el-upload {
    width: 1200px !important;
    margin: 0 auto;

    .el-upload-dragger {
      width: 1200px;
    }
  }
  .el-upload-list {
    width: 1200px;
    margin: 0 auto;
  }
</style>