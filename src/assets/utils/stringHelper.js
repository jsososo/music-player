import marked from 'marked';

/*
* 从浏览器url的search里获取query值
*
* @params search: url的search（ 包括 '?' ）, 必填
* @params key: 想要筛选得到的值， 选填（如果未填，返回一个包含所有query信息的object）
*
* */
export function getQueryFromUrl(key, search = window.location.hash) {
  try {
    const sArr = search.split('?');
    let s = '';
    if (sArr.length > 1) {
      s = sArr[1];
    } else {
      return key ? undefined : {};
    }
    const querys = s.split('&');
    const result = {};
    querys.forEach((item) => {
      const temp = item.split('=');
      result[temp[0]] = decodeURI(temp[1]);
    });
    return key ? result[key] : result;
  } catch (err) {
    // 除去search为空等异常
    console.log(err);
    return key ? '' : {};
  }
}

export function changeUrlQuery(obj) {
  const query = getQueryFromUrl();
  const url = window.location.hash.split('?')[0];

  const newQuery = {...query, ...obj};
  let queryArr = [];
  Object.keys(newQuery).forEach((key) => {
    if (newQuery[key] !== undefined && newQuery[key] !== '') {
      queryArr.push(`${key}=${newQuery[key]}`);
    }
  });
  window.location = queryArr.length > 0 ? `${url}?${queryArr.join('&')}` : url;
}

/*
* 将长的字符串切割成短的，以 ...结尾
* */
export function shortString(str, length = 20) {
  return str.length > length ? `${str.substr(0, length - 3)}...` : str;
}

export function markdown(str) {
  let result = str;
  // marked插件里有一些不足，这里自己改造一下
  result = replaceTextForMarkdown(str);
  return marked(result);
}

function replaceTextForMarkdown(str) {
  let result = str;

  const replace = [];
  const colors = ['red', 'orange', 'blue'];
  colors.forEach((item) => {
    replace.unshift({
      reg: new RegExp(`#(${item}) (.+) ${item}#`, 'g'),
      fun: (s) => {
        const reg = new RegExp(`#(${item}) (.+) ${item}#`);
        const cMatch = s.match(reg);
        if (cMatch) {
          return `<span class="fc_${cMatch[1]}">${cMatch[2]}</span>`;
        }
        return s;
      },
    });
  });
  replace.forEach((item) => {
    result = result.replace(item.reg, item.fun);
  });
  return result;
}
