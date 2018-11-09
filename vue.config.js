var express = require('express')
var axios = require('axios')
var app = express()
var apiRoutes = express.Router()

module.exports = {
  assetsDir: undefined,
  baseUrl: undefined,
  outputDir: undefined,
  runtimeCompiler: undefined,
  productionSourceMap: undefined,
  parallel: undefined,
  css: undefined,
  devServer: {
    //添加一个before方法
    before(apiRoutes){
      apiRoutes.get('/api/qqUserListDetail',(req,res)=>{
        const url = `https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg${req._parsedUrl.search}`;
        axios.get(url, {
          headers: {
            referer: 'https://c.y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: ''  //这是请求的query
        }).then((response) => {
          //response是api地址返回的，数据在data里。
          res.json(response.data)
        })
      });
      app.use('/api', apiRoutes);
    }
  }
}