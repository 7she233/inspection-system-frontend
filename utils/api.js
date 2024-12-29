const request = require('./request.js');

// 前端登录请求
async function login(code) {
  return request({
    url: '/api/users/login/',
    method: 'POST',
    data: { code }
  });
}

// 更新用户信息
async function updateProfile(data) {
  return request({
    url: '/api/users/update_profile/',
    method: 'POST',
    data
  });
}

// 创建巡检
async function createInspection(data) {
  console.log('创建巡检，发送数据:', data);
  const response = await request({
    url: '/api/inspections/',
    method: 'POST',
    data: {
      title: data.title,
      location: data.location,
      summary: data.summary,
      latitude: data.latitude,
      longitude: data.longitude
    }
  });
  console.log('创建巡检响应:', response);
  return response;
}

// 获取巡检详情
async function getInspectionDetail(id) {
  return request({
    url: `/api/inspections/${id}/`,
    method: 'GET'
  });
}

// 获取巡检列表
async function getInspections(params) {
  return request({
    url: '/api/inspections/',
    method: 'GET',
    data: params
  });
}

// 获取最近巡检列表
async function getRecentInspections() {
  return request({
    url: '/api/inspections/',
    method: 'GET',
    params: {
      limit: 5,  // 只获取最近5条记录
      ordering: '-created_at'  // 按创建时间倒序排序
    }
  });
}

// 导出 API 函数
module.exports = {
  login,
  updateProfile,
  createInspection,
  getInspectionDetail,
  getInspections,
  getRecentInspections
}; 