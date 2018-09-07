<template>
  <div>
    <div class="tag-container">
      <el-radio-group v-model="tagOwner" @change="changeOwner">
        <el-radio-button label="系统"></el-radio-button>
        <el-radio-button label="我的"></el-radio-button>
      </el-radio-group>
      <div class="tag-list">
        <div :class="tag === '' ? 'selected tag-item' : 'tag-item'" @click="selectTag('')">全部</div>
        <div :class="tag === t ? 'selected tag-item' : 'tag-item'" v-for="(t, i) in tags" :key="`tag-${i}`" @click="selectTag(t)">
          {{t}}
        </div>
      </div>
    </div>
    <div class="song-container">
      <SongList :isSys="tagOwner === '系统'" :tag="tag" />
    </div>
  </div>
</template>

<script>
  import SongList from '@/components/SongList';
  export default {
    name: "Storehouse",
    components: {
      SongList,
    },
    data() {
      return {
        tag: '',
        tags: this.$store.state.sysTags,
        tagOwner: '系统'
      }
    },
    methods: {
      selectTag(tag) {
        this.tag = tag;
      },
      changeOwner() {
        if (this.tagOwner === '系统') {
          this.tags = this.$store.state.sysTags;
        } else {
          this.tags = [];
        }
        this.tag = '';
      },
    }
  }
</script>

<style lang="scss">
  .tag-container {
    width: 200px;
    display: inline-block;

    .tag-list {
      margin-top: 20px;
      width: 80%;

      .tag-item {
        font-size: 15px;
        padding: 8px 10px;
        color: #666;
        cursor: pointer;
        background: white;
        transition: 0.4s;
        box-sizing: border-box;

        &:hover {
          background: #eff8ff;
        }

        &.selected {
          background: #d4eaff;
          border-left: 4px solid #65abff;
        }
      }
    }
  }
  .song-container {
    width: calc(100% - 230px);
    display: inline-block;
    vertical-align: top;
  }
</style>