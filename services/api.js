const request = require('../utils/request');

const api = {
  // 用户相关
  login: (code) => request({
    url: '/api/users/login/',
    method: 'POST',
    data: { code }
  }),
  updateProfile: (data) => request({
    url: '/api/users/update_profile/',
    method: 'POST',
    data
  }),
  getUserInfo: () => request({
    url: '/api/users/profile/',
    method: 'GET'
  }),
  
  // 巡检相关
  getInspections: (params = { limit: 5, ordering: '-created_at' }) => request({
    url: '/api/inspections/',
    method: 'GET',
    params
  }),
  createInspection: (data) => request({
    url: '/api/inspections/',
    method: 'POST',
    data
  }),
  getInspectionDetail: (id) => request({
    url: `/api/inspections/${id}/`,
    method: 'GET'
  }),
  
  // 事件相关
  createEvent: (inspectionId, data) => request({
    url: `/api/inspections/${inspectionId}/events/`,
    method: 'POST',
    data
  })
};

module.exports = api; 