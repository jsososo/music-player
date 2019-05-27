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
  getQQList() {
    const VUE_APP = window.VUE_APP;
    const { dispatch } = VUE_APP.$store;
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
      if (res.code === 1000) {
        VUE_APP.$message.error('先去qq音乐官网登陆一下吧');
        return;
      }
      VUE_APP.$message.success('获取歌单成功～');
      const list = res.data.mydiss.list;
      const myFav = res.data.mymusic[0];
      const id = myFav.id;
      // 201是默认值
      const favTag = { title: '我喜欢的', dissid: id, dirid: 201 };
      myFav.title = '我喜欢的';
      list.unshift(favTag);
      Storage.set('q_fav_id', id);
      request.getQQMyFavList(id, uQ, { setPlayNow: true, isFav: true, upShow: true });
      dispatch('setSysTag', list);
      dispatch('updateSelectedTag', id);
    }, () => VUE_APP.$message.error('获取歌单失败！多半是你输qq号的姿势不对！'));
  },
  // 获取我的歌单歌曲列表
  getQQMyFavList(id, uQ, { setPlayNow, isFav, upShow }, cb) {
    const { dispatch } = window.VUE_APP.$store;
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
  getQQVkey(cb) {
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
      cb && cb();
    });
  },
  // 获取电台信息
  getQQRadio(id) {
    request.qq({
      apiName: 'QQ_RADIO_INFO',
      data: {
        loginUin: Storage.get('uQ'),
        data: JSON.stringify({
          songlist: {
            module: "mb_track_radio_svr",
            method: "get_radio_track",
            param: {
              id: id || 99,
              firstplay: 1,
              num: 15
            },
          },
          radiolist: {
            module: "pf.radiosvr",
            method: "GetRadiolist",
            param: {
              ct: "24"
            },
          },
          comm: {
            ct: 24,
            cv: 0
          },
        }),
      },
      cb: 'getQQRadioInfo',
    }, (res) => {
      const { allSongs, radioInfo } = window.VUE_APP;
      const dispatch = window.VUE_APP.$store.dispatch;
      const radioMap = {};
      if (!id) {
        const tags = {};
        res.radiolist.data.radio_list.forEach((item) => {
          item.list.forEach((r) => radioMap[r.id] = r);
          tags[item.id] = item;
        });

        radioInfo.tag = tags;
        radioInfo.radioMap = radioMap;
      }
      radioInfo.selected.radioId = id;

      const songs = [];
      res.songlist.data.tracks.forEach((s) => {
        const song = {
          from: 'qq',
          album: s.album.title,
          albummid: s.album.mid,
          title: s.title,
          albumdesc: s.subtitle || '',
          songmid: s.mid,
          mediamid: s.file.size_128mp3 ? s.file.media_mid : '', // 这才是真正去换媒体文件的 如果连128的格式都没有的话就当作没这首歌了
          artist: s.singer.map(s => s.title).join('/'),
          objectId: s.mid,
          cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${s.album.mid}.jpg`,
          size128: s.file.size_128mp3,
          size320: s.file.size_320mp3,
          sizeape: s.file.size_ape,
          sizeflac: s.file.size_flac,
          songid: s.id,
        };
        songs.push(song);
        allSongs[song.songmid] = song;
      });
      radioInfo.radioMap[id || 99].songs = [ ...(radioInfo.radioMap[id || 99].songs || []), ...songs ];
      dispatch('updateAllSongs', allSongs);
      dispatch('updateRadioInfo', radioInfo);
    })
  },
  // qq音乐搜索
  getQQSearch(val, page = 1) {
    const VUE_APP = window.VUE_APP;
    request.qq({
      apiName: 'QQ_SEARCH',
      data: { p: page, n: 60, w: val, cr: 1, aggr: 1 },
    }, (res) => {
      const allSongs = VUE_APP.$store.getters.getAllSongs;
      const result = res.data.song.list.map((item) => {
        const sItem = {
          from: 'qq',
          album: item.albumname,
          albummid: item.albummid,
          title: item.songname,
          songmid: item.songmid,
          artist: item.singer.map(s => s.name).join('/'),
          objectId: item.songmid,
          mediamid: item.size128 && item.media_mid, // 避免有的歌曲有id没有音乐
          cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${item.albummid}.jpg`,
          size128: item.size128,
          size320: item.size320,
          sizeape: item.sizeape,
          sizeflac: item.sizeflac,
          songid: item.songid,
        };
        allSongs[sItem.objectId] = sItem;
        return sItem;
      });
      VUE_APP.$store.dispatch('updateAllSongs', allSongs);
      VUE_APP.$store.dispatch('updateShowList', { list: result, more: page !== 1 });
      VUE_APP.$store.dispatch('changeSearchQuery', { val: val, pageNo: page, total: res.data.song.totalnum });
    })
  },
};

export default request;