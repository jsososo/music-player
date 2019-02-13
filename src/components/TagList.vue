<template>
  <div :class="`tag-list-container ${showList ? 'show-list' : 'hide-list'}`" @mouseover="showList = true" @mouseout="showList = false">
    <i class="iconfont icon-arrow-left show-tag-btn" @mouseover="showList = true" />
    <div class="tag-list">
      <div
        :class="`tag-item
        ${tagInfo.isSys && tagInfo.selected && tagInfo.selected.dissid === item.dissid && 'selected'}
        ${tagInfo.playing === item && 'playing'}`"
        v-for="(item, index) in sysTagList" :key="`tag-${item}-${index}`"
        @click="selectTag(item.dissid)"
      >{{item.title}}</div>
    </div>
  </div>
</template>

<script>
  import request from '../assets/utils/request';
  import { mapGetters } from 'vuex';
  import Storage from "../assets/utils/Storage";

  export default {
    name: "TagList",
    data() {
      return {
        showList: false,
        tagType: 'sys',
      }
    },
    computed: {
      ...mapGetters({
        tagInfo: 'getTagInfo',
        allSongs: 'getAllSongs',
        sysTagList: 'getTagList',
      }),
    },
    methods: {
      // 选中标签，去请求列表內的歌曲
      selectTag(id) {
        const { dispatch } = this.$store;
        dispatch('updateSelectedTag', id);
        dispatch('setListContent', 0);
        request.getQQMyFavList(id, Storage.get('uQ'), this, { upShow: true });
      },
    },
  }
</script>

<style lang="scss">
  .tag-list-container {
    display: inline-block;
    vertical-align: top;
    height: calc(100vh - 200px);
    margin-top: 60px;
    position: relative;
    transition: 0.3s linear;

    .tag-list {
      overflow: hidden;
      transition: 0.3s linear;
      color: rgba(255,255,255,0.7);
      height: calc(100vh - 200px);
      overflow-y: auto;
      position: absolute;
      min-height: 500px;

      .tag-item {
        width: 100%;
        text-overflow: ellipsis;
        white-space:nowrap;
        overflow: hidden;
        height: 20px;
        padding: 10px 5px 10px 10px;
        transition: 0.4s;

        &.selected {
          background: rgba(255,255,255,0.2) !important;
        }

        &:hover {
          background: rgba(255,255,255,0.1);
        }
        &.playing {
          background: rgba(255,255,255,0.2);
          border-left: 3px solid rgba(255,255,255,0.6);
        }
      }

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

    &.hide-list {
      width: 50px;

      .show-tag-btn {
        display: inline-block;
      }

      .tag-list {
        width: 0;
        opacity: 0;
        z-index: -1;
        left: 50px;
      }
    }

    &.show-list {
      width: 130px;

      .show-tag-btn {
        display: none;
      }

      .tag-list {
        width: 130px;
        opacity: 1;
        z-index: 10;
        left: 0;
      }
    }

    .show-tag-btn {
      position: absolute;
      top: calc(50vh - 125px);
      font-size: 50px;
      color: rgba(255,255,255,0.4);
    }
  }
</style>