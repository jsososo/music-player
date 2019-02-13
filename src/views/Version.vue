<template>
  <div class="mt_20 ml_20 version-page">
    <div style="line-height: 30px">
      <a href="#/">
        <i class="back-icon el-icon-arrow-left"></i>
      </a>
      <div class="inline-block">
        <h2 class="inline-block ml_20 mr_20">更新记录 & 开发计划</h2>
        <a href="https://github.com/jsososo/music-player" target="_blank"><u>github</u></a>
      </div>
    </div>
    <div class="ml_30 mt_30">
      <h3>更新</h3>
      <ul class="ml_20">
        <li>19-02-13: 批量添加、删除到歌单 </li>
        <li>19-02-12: 歌词拖动 & 列表页批量下载 </li>
        <li>19-01-26: 网易云歌单转qq音乐</li>
        <li>19-01-11: 播放器增加喜欢按钮 &amp; 列表增加下载按钮</li>
        <li>19-01-10: 新增添加、取消喜欢的歌曲 &amp; fix 某些情况下非128k的音乐403</li>
        <li>18-12-13: bug fix: 切歌单下一首报错 &amp;&amp; 下架歌曲播放</li>
        <li>18-12-12: 无损音质 &amp; 下载</li>
        <li>18-12-10: 各种细节优化</li>
        <li>18-12-06: 背景图片用专辑图片</li>
        <li>18-12-04: 接入企鹅音乐歌词</li>
        <li>18-11-06: 接口更换为企鹅音乐</li>
      </ul>
      <h3 class="mt_20">计划</h3>
      <ul class="ml_20">
        <li><del>接入歌词</del></li>
        <li><del>接入加入歌单等功能 （因为需要获取qq音乐页面的部分cookie，暂缓）</del></li>
        <li>接入推荐音乐、排行榜</li>
        <li><del>背景给美化一下</del></li>
        <li><del>无损音质</del></li>
        <li>移动端兼容</li>
        <li>下载管理</li>
        <li><del>歌曲列表的批量操作</del></li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Version"
  }
</script>

<style scoped lang="scss">
  .version-page {
    color: rgba(255,255,255,0.8);
    a {
      color: #fff;
    }
    .back-icon {
      font-size: 24px;
      color: white;
      font-weight: bold !important;
      vertical-align: middle;
    }
    li {
      margin: 8px 0;
    }
  }
</style>