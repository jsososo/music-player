<template>
  <div class="mb_20">
    <el-radio-group v-model="sOpt">
      <el-radio-button label="列表内"></el-radio-button>
      <el-radio-button label="站内"></el-radio-button>
    </el-radio-group>
    <input type="text" class="search-input" placeholder="找点什么吧" v-model="search">
  </div>
</template>

<script>
  export default {
    name: "Search",
    data() {
      return {
        sOpt: '列表内',
        search: '',
      }
    },
    watch: {
      search(v) {
        const data = {
          search: v.replace(/\s/g, ' '),
          isAll: this.sOpt === '列表内',
        };
        this.$store.commit('searchList', data);
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