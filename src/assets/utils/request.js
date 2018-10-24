import apiList from './apiList';
import $ from 'jquery';
const request = {
  qq(data, cb = (res) => console.log(res), errCb = (err) => console.error(err))  {
    data.url = apiList[data.apiName || 'TEST'] || '/test.json';
    data.dataType = 'jsonp';
    data.data = data.data || {};
    data.data.jsonpCallback = 'MusicJsonCallback';
    data.data.callback = 'MusicJsonCallback';

    try {
      window.MusicJsonCallback = (data) => cb(data);
      $.ajax(data);
    } catch (err) {
      errCb(err);
    }
  }
};

export default request;