const BASE_URL = 'http://127.0.0.1:8001';

const request = (options) => {
  const { url, method = 'GET', data, params, headers = {} } = options;

  // 从缓存中获取token
  const token = wx.getStorageSync('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // 构建完整URL
  let fullUrl = `${BASE_URL}${url}`;
  
  // 处理GET请求的查询参数
  if (method === 'GET' && params) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    if (queryString) {
      fullUrl += `?${queryString}`;
    }
  }

  console.log('发送请求:', { url: fullUrl, method, data, params, headers });

  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method,
      data: method === 'GET' ? undefined : data,  // GET请求不使用data
      header: headers,
      success: (res) => {
        console.log('收到响应:', res);
        
        // 处理成功响应
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data: res.data });
        } else {
          console.log('请求失败:', res);
          reject(new Error(res.data.detail || '请求失败'));
        }
      },
      fail: (error) => {
        console.error('请求错误:', error);
        reject(new Error('网络请求失败'));
      }
    });
  });
};

module.exports = request; 