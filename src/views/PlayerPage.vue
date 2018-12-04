<template>
  <div>
    <div class="inline-block">
      <div class="pd_20">
        <Cd />
      </div>
      <SongInfo />
    </div>
    <div class="song-container">
      <div>
        <TagList />
        <div class="inline-block">
          <Search />
          <el-carousel :autoplay="false" arrow="never" ref="carousel" @change="changeCarousel">
            <el-carousel-item name="list">
              <SongList :isSys="tagOwner === '系统'" :tag="tag" />
            </el-carousel-item>
            <el-carousel-item name="lyric">
              <Lyric />
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Cd from '@/components/playShow/Cd';
  import SongList from '@/components/SongList';
  import SongInfo from '@/components/SongInfo';
  import Search from '@/components/Search';
  import TagList from '@/components/TagList';
  import Lyric from '@/components/Lyric';
  import { mapGetters } from 'vuex';

  export default {
    name: "playerpage",
    components: { Cd, SongList, SongInfo, Search, TagList, Lyric },
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
    computed: {
      ...mapGetters({
        listContent: 'getListContent',
        showList: 'getShowList',
      })
    },
    watch: {
      showList() {
        this.$refs.carousel.setActiveItem(0);
      },
      listContent(v) {
        this.$refs.carousel.setActiveItem(v);
      }
    },
    methods: {
      changeCarousel(v) {
        this.$store.dispatch('setListContent', v);
      },
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
  .el-carousel__container {
    height: calc(100vh - 170px) !important;
  }
  .el-carousel__indicators .el-carousel__indicator .el-carousel__button {
    height: 5px;
    border-radius: 5px;
  }
  .song-container {
    display: inline-block;
    vertical-align: top;
    float: right;
  }
</style>