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

export function u8ToBase64( bytes ) {
  var base64 = '';
  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var byteLength = bytes.byteLength;
  var byteRemainder = byteLength % 3;
  var mainLength = byteLength - byteRemainder;
  var a, b, c, d;
  var chunk;
  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12; // 258048 = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6; // 4032 = (2^6 - 1) << 6
    d = chunk & 63; // 63 = 2^6 - 1
    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }
  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2;
    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4 // 3 = 2^2 - 1;
    base64 += encodings[a] + encodings[b] + '==';
  }
  else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    a = (chunk & 16128) >> 8 // 16128 = (2^6 - 1) << 8;
    b = (chunk & 1008) >> 4 // 1008 = (2^6 - 1) << 4;
    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2 // 15 = 2^4 - 1;
    base64 += encodings[a] + encodings[b] + encodings[c] + '=';
  }
  return "data:image/jpeg;base64," + base64;
}