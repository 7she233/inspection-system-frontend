const { inspectionApi, userApi } = require('../../services/api');
const { formatDate, handleError } = require('../../utils/util');

Page({
  data: {
    userInfo: {
      name: '',
      role: '',
      avatarUrl: ''
    },
    recentInspections: [],
    loading: false
  },

  onLoad() {
    this.loadInitialData();
  },

  onPullDownRefresh() {
    this.loadInitialData();
  },

  // 加载初始数据
  async loadInitialData() {
    try {
      this.setData({ loading: true });
      await Promise.all([
        this.loadUserInfo(),
        this.loadRecentInspections()
      ]);
    } catch (error) {
      handleError(error, '加载数据失败');
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  // 获取用户信息
  async loadUserInfo() {
    try {
      // 尝试从本地缓存获取用户信息
      const cachedUserInfo = wx.getStorageSync('userInfo');
      if (cachedUserInfo) {
        this.setData({ userInfo: cachedUserInfo });
        return;
      }

      // 获取新的用户信息
      const userInfo = await userApi.getUserInfo();
      this.setData({ userInfo });
      wx.setStorageSync('userInfo', userInfo);
    } catch (error) {
      // 使用默认用户信息
      this.setData({
        userInfo: {
          name: '巡检员',
          role: '巡检员',
          avatarUrl: ''
        }
      });
      console.error('获取用户信息失败:', error);
    }
  },

  // 加载最近巡检记录
  async loadRecentInspections() {
    try {
      const response = await inspectionApi.getRecentInspections();
      const formattedInspections = response.data.map(item => ({
        ...item,
        date: formatDate(item.date)
      }));
      this.setData({ recentInspections: formattedInspections });
    } catch (error) {
      handleError(error, '加载巡检记录失败');
    }
  },

  // 跳转到详情页
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/inspection/create?id=${id}`,
      fail: () => handleError(new Error('页面跳转失败'))
    });
  },

  // 跳转到更多记录页面
  goToMore() {
    wx.navigateTo({
      url: '/pages/more/more',
      fail: () => handleError(new Error('页面跳转失败'))
    });
  },

  // 开始新巡检
  startNewInspection() {
    wx.navigateTo({
      url: '/pages/inspection/create',
      fail: () => handleError(new Error('页面跳转失败'))
    });
  }
}); 