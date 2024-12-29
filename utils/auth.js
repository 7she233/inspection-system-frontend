import request from './request';

export async function refreshToken() {
  const refresh = wx.getStorageSync('refresh');
  if (!refresh) {
    return false;
  }
  
  try {
    const res = await request({
      url: '/api/token/refresh/',
      method: 'POST',
      data: { refresh }
    });
    
    wx.setStorageSync('token', res.access);
    return true;
  } catch (error) {
    wx.removeStorageSync('token');
    wx.removeStorageSync('refresh');
    return false;
  }
} 