<template>
  <div class="user-avatar">
    <img class="user-avatar-img" v-if="user.avatar" :src="user.avatar" @click="clickAvatar">
    <i v-if="!user.avatar" class="iconfont icon-yonghu" style="font-size: 25px;" @click="clickAvatar" />
    <el-dialog
      width="400px"
      :visible.sync="showLoginDialog"
      :before-close="clickAvatar"
      :center="false"
    >
      <div>
        <div class="inline-block w_50">账号：</div>
        <el-input style="width: 200px;margin-left: 10px" v-model="username"/>
      </div>
      <div class="mt_10 mb_10">
        <div class="inline-block w_50">密码：</div>
        <el-input style="width: 200px;margin-left: 10px" type="password" @keyup.enter.native="login" @input="inputPass" />
      </div>
      <div style="padding-left: 60px;">
        <el-button class="login-btn">去注册</el-button>
        <el-button class="login-btn" type="primary" @click="login">登陆</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import md5 from 'js-md5';
  import Storage from '../assets/utils/Storage';
  export default {
    name: "Avatar",
    data() {
      return {
        showLoginDialog: false,
        username: '',
        md5Pass: '',
      }
    },
    computed: {
      user() {
        return this.$store.getters.getUserInfo;
      }
    },
    methods: {
      inputPass(v) {
        this.md5Pass = md5(v);
      },
      clickAvatar() {
        if (this.user.username) {
          window.location = '#/me';
        } else {
          this.showLoginDialog = !this.showLoginDialog;
        }
      },
      login() {
        const { dispatch } = this.$store;
        const { username, md5Pass } = this;
        Storage.logIn(
          { username, password: md5Pass },
          (res) => {
            const user = JSON.parse(JSON.stringify(res))
            dispatch('updateUser', user);
            Storage.set('username', username);
            Storage.set('uid', md5Pass.split('').reverse().join(''));
            this.showLoginDialog = false;
          }
        );
      },
    }
  }
</script>

<style lang="scss" scoped>
  .user-avatar {
    display: inline-block;
    color: white;
    text-align: center;
    line-height: 40px;
    margin-left: 30px;
    cursor: pointer;
    vertical-align: middle;
  }
  .user-avatar, .user-avatar-img {
    width: 40px;
    height: 40px;
    border: 1px solid white;
    border-radius: 50%;
  }
  .login-btn {
    width: 95px;
  }
</style>