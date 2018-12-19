import apiList from './apiList';
import $ from 'jquery';
import axios from 'axios';
import Storage from './Storage';
import { getQueryFromUrl } from './stringHelper';
import timer from './timer';
const request = {
  qq(data, cb = (res) => console.log(res), errCb = (err) => console.error(err))  {
    data.url = apiList[data.apiName || 'TEST'] || '/test.json';
    data.dataType = 'jsonp';
    data.data = data.data || {};
    data.data.jsonpCallback = data.cb || 'MusicJsonCallback';
    data.data.callback = data.cb || 'MusicJsonCallback';

    try {
      window[data.cb || 'MusicJsonCallback'] = (data) => cb(data);
      $.ajax(data);
    } catch (err) {
      errCb(err);
    }
  },
  axiosReq(data, cb = (res) => console.log(res), errCb = (err) => console.error(err)) {
    axios.get(apiList[data.apiName || 'TEST'], {
      params: data.data,
    }).then((res) => {
      if (data.cb) {
        window[data.cb] = (r) => cb(r);
        eval(res.data);
      } else {
        cb(res.data);
      }
    }).catch(errCb);
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
      const favTag = { title: '我喜欢的', dissid: id };
      myFav.title = '我喜欢的';
      list.unshift(favTag);
      request.getQQMyFavList(id, uQ, _this, true);
      dispatch('setSysTag', list);
      dispatch('updateSelectedTag', id);
    }, () => {
      _this.$message.error('获取歌单失败！多半是你输qq号的姿势不对！');
    });
  },
  // 获取我喜欢的音乐列表
  getQQMyFavList(id, uQ, _this, setPlayNow) {
    const { dispatch } = _this.$store;
    const allSongs = {};
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
        };
        allSongs[s.songmid] = sItem;
        if (sItem.songmid && !firstSong) {
          firstSong = sItem
        }
        return sItem;
      });
      // 是否需要默认设置听第一首歌
      if (setPlayNow && firstSong) {
        dispatch('updatePlayNow', firstSong);
      }
      dispatch('updateAllSongs', allSongs);
      dispatch('updateShowList', { list, dissid: id });
    });
  },
  // 获取vkey
  getQQVkey() {
    request.qq({
      apiName: 'QQ_GET_VKEY',
      cb: 'GET_QQ_VKEY',
    }, res => {
      const mUrl = res.req_0.data.midurlinfo[0].purl;
      const { guid, vkey } = getQueryFromUrl(null, mUrl);
      Storage.set({
        guid,
        vkey,
        vkey_expire: timer().from(90, 'm').str('YYYYMMDDHHmm'),
        murl: res.req_0.data.sip[0]
      });
    });
  },
};

export default request;