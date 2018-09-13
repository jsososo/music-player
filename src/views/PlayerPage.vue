<template>
  <div>
    <div class="inline-block">
      <div class="pd_20">
        <Cd />
      </div>
      <SongInfo />
    </div>
    <div class="song-container">
      <Search />
      <SongList :isSys="tagOwner === '系统'" :tag="tag" />
    </div>
  </div>
</template>

<script>
  import Cd from '@/components/playShow/Cd';
  import SongList from '@/components/SongList';
  import SongInfo from '@/components/SongInfo';
  import Search from '@/components/Search';
  export default {
    name: "playerpage",
    components: { Cd, SongList, SongInfo, Search },
    data() {
      return {
        tag: '',
        tags: [],
        tagOwner: '系统'
      }
    },
    mounted() {
      this.getTags();
    },
    methods: {
      getTags() {
        if (!this.$store.state.sysTags.length) {
          setTimeout(this.getTags, 100);
        }
        this.tags = this.$store.state.sysTags;
      },
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
  .song-container {
    display: inline-block;
    vertical-align: top;
    float: right;
  }
</style>