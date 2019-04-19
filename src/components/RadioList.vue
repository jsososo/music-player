<template>
  <div>
    hello world
  </div>
</template>

<script>
  import request from '../assets/utils/request';
  import Storage from '../assets/utils/Storage';
  export default {
    name: "RadioList",
    created() {
      request.qq({
        apiName: 'QQ_RADIO_INFO',
        data: {
          loginUin: Storage.get('uQ'),
          data: JSON.stringify({
            songlist: {
              module: "mb_track_radio_svr",
              method: "get_radio_track",
              param: {
                id: 99,
                firstplay: 1,
                num: 10
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

      })
    }
  }
</script>

<style scoped>

</style>