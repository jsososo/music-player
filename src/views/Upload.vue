<template>
  <div>
    <el-upload
      ref="upload"
      drag
      accept=".xls"
      action=""
      show-file-list
      :auto-upload="false"
      :http-request="uploadFun"
      multiple>
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <el-button @click="submit">upload</el-button>
  </div>
</template>

<script>
  import Storage from '../assets/utils/Storage';
  export default {
    name: "Upload",
    methods: {
      submit() {
        this.$refs.upload.submit();
      },
      uploadFun(data) {
        console.log(data);
        Storage.saveFile(data.file, (res) => console.log(res), (data) => console.log(data));
        // console.log(data);
      }
    }
  }
</script>

<style scoped>

</style>