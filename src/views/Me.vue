<template>
  <div class="me-page">
    <div class="user-info">
      <div class="user-avatar">
        <img class="user-avatar-img" v-if="user.avatar" :src="user.avatar">
        <i v-if="!user.avatar" class="iconfont icon-yonghu" style="font-size: 70px;"/>
      </div>
      <div class="user-name">{{user.username}}</div>
      <div class="mt_20">
        <div class="u-info-label">绑定qq：</div>
        <div class="u-info-item" v-if="!editBindQQ">
          <span>{{user.bindQQ ? user.bindQQ : "暂未绑定，绑定可同步qq音乐相关信息（只需qq号，无需密码）"}}</span>
          <span class="btn-small ml_20" @click="editBindQQ = true">{{user.bindQQ ? '修改' : '绑定'}}</span>
        </div>
        <div class="u-info-item" v-if="editBindQQ">
          <input class="input" v-model="inputBindQQ" />
          <span class="btn-small ml_10" @click="bindNewQQ">确定</span>
          <span class="btn-small ml_10" @click="editBindQQ = false">取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Storage from '../assets/utils/Storage';
  import request from '../assets/utils/request';
  export default {
    name: "Me",
    data() {
      return {
        editBindQQ: false,
        inputBindQQ: '',
      }
    },
    computed: {
      user() {
        return this.$store.getters.getUserInfo;
      },
    },
    created() {
      !this.user.bindQQ && this.$message.info('绑定企鹅号哟');
    },
    methods: {
      bindNewQQ() {
        const params = { bindQQ: this.inputBindQQ };
        Storage.setBmob('_User', this.user.objectId, params, () => {
          this.$store.dispatch('updateUser', params);
          this.inputBindQQ = '';
          this.editBindQQ = false;
          this.$message.success('返回刷新就ok啦～');
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .me-page {
    color: white;
    padding-left: 50px;
    padding-top: 50px;
  }
  .user-avatar {
    border: 2px solid white;
    width: 100px;
    height: 100px;
    overflow: hidden;
    border-radius: 50%;
    line-height: 100px;
    text-align: center;
    color: white;
    display: inline-block;
    vertical-align: top;
  }
  .user-name {
    display: inline-block;
    vertical-align: top;
    line-height: 100px;
    font-size: 20px;
    margin-left: 30px;
  }
  .user-avatar-img {
    width: 100px;
    height: 100px;
  }
  .u-info-label {
    display: inline-block;
    width: 100px;
    text-align: right;
    padding-right: 20px;
    font-size: 18px;
  }
  .u-info-item {
    display: inline-block;
    margin-left: 10px;
  }
  .btn-small {
    border: 1px solid rgba(255,255,255,0.7);
    padding: 2px 7px;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    color: rgba(255,255,255,0.7);

    &:hover {
      border: 1px solid white;
      color: white;
    }
  }

  .input {
    background: transparent !important;
    border: transparent;
    border-bottom: 1px solid rgba(255,255,255, 0.5) !important;
    color: white;
    font-size: 18px;
    outline: none !important;
    width: 200px;

    &::-webkit-input-placeholder {
      color: rgba(255,255,255,0.5);
    }
  }
</style>