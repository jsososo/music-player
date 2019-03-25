import apiList from './apiList';
import $ from 'jquery';
import Storage from './Storage';
import { getQueryFromUrl } from './stringHelper';
import timer from './timer';
const request = {
  qq(data, cb = (res) => console.log(res), errCb = (err) => console.error(err))  {
    data.url = apiList[data.apiName || 'TEST'] || '/test.json';
    data.dataType = data.dataType || 'jsonp';
    data.data = data.data || {};
    data.data.jsonpCallback = data.cb || 'MusicJsonCallback';
    data.data.callback = data.cb || 'MusicJsonCallback';
    if (data.dataType !== 'jsonp') {
      data.success = cb;
      data.error = errCb;
    }
    data.xhrFields = {
      withCredentials: true
    };

    try {
      window[data.cb || 'MusicJsonCallback'] = (data) => cb(data);
      $.ajax(data);
    } catch (err) {
      errCb(err);
    }
  },
  // 获取qq音乐列表
  getQQList(_this) {
    const { dispatch } = _this.$store;
    const uQ = Storage.get('uQ');
    request.qq({
      apiName: 'QQ_LIST',
      data: {
        cid: 205360838, // 管他什么写死就好了
        userid: uQ, // qq号
        reqfrom: 1,
      }
    }, (res) => {
      if (!res.data) {
        return;
      }
      _this.$message.success('获取歌单成功～');
      const list = res.data.mydiss.list;
      const myFav = res.data.mymusic.find(item => item.title === '喜欢');
      const id = myFav.id;
      // 201是默认值
      const favTag = { title: '我喜欢的', dissid: id, dirid: 201 };
      myFav.title = '我喜欢的';
      list.unshift(favTag);
      Storage.set('q_fav_id', id);
      request.getQQMyFavList(id, uQ, _this, { setPlayNow: true, isFav: true, upShow: true });
      dispatch('setSysTag', list);
      dispatch('updateSelectedTag', id);
    }, () => {
      _this.$message.error('获取歌单失败！多半是你输qq号的姿势不对！');
    });
  },
  // 获取我的歌单歌曲列表
  getQQMyFavList(id, uQ, _this, { setPlayNow, isFav, upShow }, cb) {
    const { dispatch } = _this.$store;
    const allSongs = {};
    isFav = isFav || (id == Storage.get('q_fav_id'));

    request.qq({
      apiName: 'QQ_USER_LIST_DETAIL',
      cb: 'playlistinfoCallback',
      data: {
        type: 1,
        utf8: 1,
        disstid: id,
        jsonpCallback: 'playlistinfoCallback',
        loginUin: uQ,
      },
    }, (res) => {
      let firstSong;
      const favList = {};
      const list = res.cdlist[0].songlist.map((s) => {
        const sItem = {
          from: 'qq',
          album: s.albumname,
          albummid: s.albummid,
          title: s.songname,
          albumdesc: s.albumdesc || '',
          songmid: s.songmid,
          mediamid: s.size128 ? s.strMediaMid : '', // 这才是真正去换媒体文件的 如果连128的格式都没有的话就当作没这首歌了
          artist: s.singer.map(s => s.name).join('/'),
          objectId: s.songmid,
          cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${s.albummid}.jpg`,
          size128: s.size128,
          size320: s.size320,
          sizeape: s.sizeape,
          sizeflac: s.sizeflac,
          songid: s.songid,
        };
        allSongs[s.songmid] = sItem;
        if (sItem.songmid && !firstSong) {
          firstSong = sItem
        }
        if (isFav && s.songmid) {
          favList[s.songmid] = sItem;
        }
        return sItem;
      });
      // 是否需要默认设置听第一首歌
      if (setPlayNow && firstSong) {
        dispatch('updatePlayNow', firstSong);
      }
      dispatch('updateAllSongs', allSongs);
      if (upShow) {
        dispatch('updateShowList', { list, dissid: id });
      }
      if (isFav) {
        favList.id = res.cdlist[0].dirid;
        favList.disstid = id;
        dispatch('setFavList', favList);
      }
      cb && cb(list);
    });
  },
  // 获取vkey
  getQQVkey() {
    request.qq({
      apiName: 'QQ_GET_VKEY',
      cb: 'GET_QQ_VKEY',
    }, res => {
      const mUrl = res.req_0.data.testfile2g;
      const { guid, vkey } = getQueryFromUrl(null, mUrl);
      Storage.set({
        guid,
        vkey,
        vkey_expire: timer().from(90, 'm').str('YYYYMMDDHHmm'),
        // 返回的url信息在播放非128k的音乐时都可能出现403，下面这个链接是从别人的qq音乐项目里找来的
        // murl: res.req_0.data.sip[1] || res.req_0.data.sip[0],
        murl: 'http://183.131.60.16/amobile.music.tc.qq.com/',
      });
    });
  },
};

export default request;