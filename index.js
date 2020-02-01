// 定义方法
const grab = (...args) =>
  chrome.extension.sendRequest({
    tabId: chrome.devtools.tabId,
    args
  });
// 注册回调，每一个http请求响应后，都触发该回调
chrome.devtools.network.onRequestFinished.addListener(async (...args) => {
  try {
    const [
      {
        // 请求的类型，查询参数，以及url，form表单参数
        request: { method, queryString, url, postData },

        // 该方法可用于获取响应体
        getContent
      }
    ] = args;

    // 将callback转为await promise
    // warn: content在getContent回调函数中，而不是getContent的返回值
    const content = await new Promise((res, rej) => getContent(res));
    if(args[0].response.status != '200') return;
    // 生产环境
    if (url.match("https://clinic.dxy.com/japi/session/701050")) { // 点击结帐
      // 点击结账-结账明细
      grab({args: args, content: JSON.parse(content), type: 'account', env: 'PROD'});
    }
    if (url.match("https://clinic.dxy.com/japi/session/701039")) { // 点击收费
      // 点击收费-收费明细
      grab({args: args, content: JSON.parse(content), type: 'charge', env: 'PROD'});
    }
    if (url.match("https://clinic.dxy.com/japi/session/701040")) { // 点击退费
      grab({args: args, content: JSON.parse(content), type: 'returns', env: 'PROD'});
    }


  } catch (err) {
    grab(err.stack || err.toString());
  }
});
