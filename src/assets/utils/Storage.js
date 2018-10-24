import { Message } from 'element-ui';
const localStorage = window.localStorage;

const saveBmob = (obj, cb, errCb) => {
  obj.save(null, {
    success: (res) => cb && cb(res),
    error: (err) => errCb && errCb(err),
  });
};

const setBmobValue = (bmob, obj) => {
  Object.keys(obj).forEach((key) => {
    bmob.set(key, obj[key]);
  });
  return bmob;
};

const getQueryBmob = (table, func) => {
  const Table = Bmob.Object.extend(table);
  const Query = new Bmob.Query(Table);
  return func ? func(Query) : Query;
};

const Storage = {
  // 获取localStorage
  get: (key, toObj = false, d = '') => {
    let result = localStorage.getItem(key) || d;

    if (toObj) {
      result = JSON.parse(result);
    }

    return result;
  },

  // 设置localStorage
  set: (key, value, toStr = false) => {
    let v = value;
    if (toStr) {
      v = JSON.stringify(v);
    }
    localStorage.setItem(key, v);
  },

  // 获取Bmob数据
  getBmob(table, id, key, cb = (v) => v, errCb) {
    const Obj = Bmob.Object.extend(table);
    const query = new Bmob.Query(Obj);
    query.get(id, {
      success: (res) => key ? cb(res[key]) : cb(res),
      error: (err) => errCb && errCb(err),
    });
  },

  // 修改Bomb数据
  setBmob(table, id, value, cb, errCb) {
    const setFunc = (res) => {
      saveBmob(setBmobValue(res, value), cb, errCb);
    };
    this.getBmob(table, id, null, setFunc, errCb);
  },

  // 创建Bmob数据
  createBmob(table, value, cb, errCb) {
    const Obj = Bmob.Object.extend(table);
    const obj = new Obj();
    saveBmob(setBmobValue(obj, value), cb, errCb);
  },

  // 删除一行数据
  delBmob(table, id, cb, errCb) {
    const delFunc = (res) => {
      res.destroy({
        success: (r) => cb && cb(r),
        error: (err) => errCb && errCb(err),
      });
    };
    this.getBmob(table, id, null, delFunc, errCb);
  },

  /*
  * 批量删除符合查询结果的对象
  */
  delBmobs(table, func, cb, errCb) {
    getQueryBmob(table, func).destroyAll({
      success: (r) => cb && cb(r),
      error: (err) => errCb && errCb(err),
    });
  },

  /*
  *  @params: table 表
  *  @params: fun   查询条件
  *  @params: type  查询方式：（first, find, count）
  * */
  queryBmob(table, fun = (q) => q, cb, errCb, type = 'first') {
    const query = getQueryBmob(table, fun);
    query[type]({
      success: (res) => cb && cb(res && JSON.parse(JSON.stringify(res))),
      error: (err) => errCb && errCb(err),
    });
  },

  /*
  * bmob的或查询
  * */
  queryBmobOr(table, funArr, fun, cb, errCb, type = 'find') {
    const queryArr = funArr.map((fun) => getQueryBmob(table, fun));
    const mainQuery = fun(Bmob.Query.or(...queryArr));
    mainQuery.limit = 1000;

    mainQuery[type]({
      success: (res) => cb && cb(res && JSON.parse(JSON.stringify(res))),
      error: (err) => errCb && errCb(err),
    });
  },

  /*
  * 用户注册
  * */
  singUp(name, password, cb) {
    const user = new Bmob.User();
    user.set('username', name);
    user.set('password', password);

    user.signUp(null, {
      success: cb,
      error: () => {
        Message.error('注册失败了 = =||');
      },
    });
  },

  /*
  *  用户登录
  * */
  logIn(userInfo, cb) {
    const params = userInfo || {
      username: Storage.get('username'),
      password: Storage.get('uid').split('').reverse().join(''),
    };
    const { username, password } = params;
    Bmob.User.logIn(username, password, {
      success: cb,
      error: () => {
        userInfo && Message.error('登录失败了 TAT');
      },
    });
  },

  /*
  * 更新用户信息
  * */
  updateUser(userInfo, cb) {
    const user = Bmob.User.current();
    Object.keys(userInfo).forEach((key) => {
      user.set(key, userInfo[key]);
    });
    user.save(null, {
      success: () => {
        Message.success('修改成功(*^▽^*)');
        let storageInfo = Storage.get('user');
        storageInfo = `${userInfo.username}-${storageInfo.split('-')[1]}`;
        Storage.set('user', storageInfo);
        cb();
      },
      error: () => {
        Message.warning('保存失败了 QAQ');
      },
    });
  },
  saveFile(file, cb, progress) {
    const BmobFile = new Bmob.File(file.name, file);
    BmobFile.save((res) => {
      cb({
        url: res._url,
        name: file.name,
      });
    }, progress);
  },
};

export default Storage;
