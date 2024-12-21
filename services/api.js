// API基础配置
const BASE_URL = 'https://api.yourdomain.com/v1';  // 修改为你的域名

// 统一请求方法
const request = async (url, options = {}) => {
  try {
    const token = wx.getStorageSync('token');
    const defaultOptions = {
      url: `${BASE_URL}${url}`,
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    };

    const response = await wx.request({
      ...defaultOptions,
      ...options
    });

    if (response.statusCode === 401) {
      // token过期，需要重新登录
      wx.removeStorageSync('token');
      wx.redirectTo({ url: '/pages/login/login' });
      throw new Error('登录已过期');
    }

    if (response.statusCode !== 200) {
      throw new Error(response.data.message || '请求失败');
    }

    return response.data;
  } catch (error) {
    wx.showToast({
      title: error.message || '网络错误',
      icon: 'none'
    });
    throw error;
  }
};

// 巡检相关API
const inspectionApi = {
  // 获取最近巡检列表
  getRecentInspections: () => {
    return request('/inspections/recent');
  },

  // 获取巡检详情
  getInspectionDetail: (id) => {
    return request(`/inspections/${id}`);
  },

  // 创建巡检
  createInspection: (data) => {
    return request('/inspections', {
      method: 'POST',
      data
    });
  },

  // 更新巡检
  updateInspection: (id, data) => {
    return request(`/inspections/${id}`, {
      method: 'PUT',
      data
    });
  }
};

// 事件点相关API
const eventApi = {
  // 创建事件点
  createEvent: (inspectionId, data) => {
    return request(`/inspections/${inspectionId}/events`, {
      method: 'POST',
      data
    });
  },

  // 更新事件点
  updateEvent: (inspectionId, eventId, data) => {
    return request(`/inspections/${inspectionId}/events/${eventId}`, {
      method: 'PUT',
      data
    });
  },

  // 上传文件（语音、图片）
  uploadFile: (filePath, fileType) => {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${BASE_URL}/upload`,
        filePath,
        name: 'file',
        formData: {
          type: fileType
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(res.data));
          } else {
            reject(new Error('上传失败'));
          }
        },
        fail: reject
      });
    });
  }
};

// 用户相关API
const userApi = {
  // 获取用户信息
  getUserInfo: () => {
    return request('/user/info');
  },

  // 更新用户信息
  updateUserInfo: (data) => {
    return request('/user/info', {
      method: 'PUT',
      data
    });
  }
};

// 导出修改为小程序支持的方式
module.exports = {
  inspectionApi,
  eventApi,
  userApi
}; 