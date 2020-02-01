// 注册回调，当收到请求的时候触发
chrome.extension.onRequest.addListener(({ tabId, args }) => {
  // 在给定tabId的tab页中执行脚本
  chrome.tabs.executeScript(null, {
    code: `console.log(...${JSON.stringify(
      args
    )}, 1111, ${tabId});
    var http = function (option) {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open(option.method, option.url, true);
      xmlHttp.setRequestHeader('Content-Type','application/json; charset-UTF-8');
      xmlHttp.setRequestHeader('x-dxy-token','073c0927-4caf-494a-ad18-523123c83f71')
      xmlHttp.send(option.data);
    };
    var serializeArray = function (params) {
      var obj = {};
      params.forEach(function(item){
        obj[item.name] = item.value;
      });
      return obj;
    }

    var baseUrl = '';
    if (${args[0].env == "TEST"}) {
      baseUrl = 'https://xxx-test.cn';
    } else if (${args[0].env == "PROD"}) {
      baseUrl = 'https://xxx-prod.cn';
    }
    
    if(${args[0].type == "account"}) { // 结账
      http({
        method: 'POST',
        url: baseUrl + '/hms/api/v1/dxy_receivable',
        data: '${JSON.stringify(args[0].content)}'
      })
    } else if (${args[0].type == "charge"}) { // 收费
      var paramObj = serializeArray(${JSON.stringify(
        args[0].args[0].request.postData.params
      )});
      paramObj.crtName = localStorage.user_name;
      http({
        method: 'POST',
        url: baseUrl + '/hms/api/v1/dxy_account',
        data: JSON.stringify(paramObj)
      })
    } else if (${args[0].type == "returns"}) { // 退费
      var paramObj = serializeArray(${JSON.stringify(
        args[0].args[0].request.postData.params
      )});
      paramObj.crtName = localStorage.user_name;
      if (paramObj.bills) {
        paramObj.bills = decodeURIComponent(paramObj.bills);
      }
      http({
        method: 'POST',
        url: baseUrl + '/hms/api/v1/dxy_account_return',
        data: JSON.stringify(paramObj)
      })
    }
    `
  });
});
