const app = getApp()
const api = require('../../utils/api.js')
const { handleError } = require('../../utils/util')

Page({
  data: {
    inspectionId: '',
    inspection: null,
    events: [],
    loading: false
  },

  onLoad(options) {
    const { inspectionId } = options
    if (inspectionId) {
      this.setData({ inspectionId })
      this.loadInspectionData(inspectionId)
    }
  },

  // 加载巡检数据
  async loadInspectionData(inspectionId) {
    try {
      this.setData({ loading: true })
      const response = await api.getInspectionDetail(inspectionId)
      this.setData({
        inspection: response.data,
        events: response.data.events || []
      })
    } catch (error) {
      console.error('加载巡检数据失败:', error)
      handleError(error, '加载数据失败')
    } finally {
      this.setData({ loading: false })
    }
  },

  // 创建新事件
  createEvent() {
    wx.navigateTo({
      url: `/pages/event/create?inspectionId=${this.data.inspectionId}`,
      fail: (error) => {
        console.error('跳转到创建事件页面失败:', error)
        handleError(new Error('页面跳转失败'))
      }
    })
  },

  // 查看事件详情
  viewEventDetail(e) {
    const { eventId } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/event/detail?id=${eventId}`,
      fail: (error) => {
        console.error('跳转到事件详情页面失败:', error)
        handleError(new Error('页面跳转失败'))
      }
    })
  },

  // 返回上一页
  goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      // 如果有上一页，则返回
      wx.navigateBack({
        fail: (error) => {
          console.error('返回上一页失败:', error)
          // 如果返回失败，则跳转到首页
          wx.switchTab({
            url: '/pages/index/index',
            fail: () => handleError(new Error('返回失败'))
          })
        }
      })
    } else {
      // 如果没有上一页，则跳转到首页
      wx.switchTab({
        url: '/pages/index/index',
        fail: () => handleError(new Error('返回失败'))
      })
    }
  }
}) 