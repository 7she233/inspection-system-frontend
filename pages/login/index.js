const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    loading: false,
    autoLogin: true  // 添加自动登录标志
  },

  onLoad() {
    console.log('登录页面加载')
    // 检查是否需要自动登录
    if (this.data.autoLogin) {
      this.handleLogin()
    }
  },

  async handleLogin() {
    // 如果已经在加载中，直接返回
    if (this.data.loading) {
      return
    }
    
    try {
      this.setData({ loading: true })
      
      // 获取登录凭证
      console.log('正在获取微信登录凭证...')
      const { code } = await wx.login()
      console.log('获取到登录凭证:', code)
      
      // 调用后端登录接口
      console.log('正在调用后端登录接口...')
      const response = await api.login(code)
      console.log('登录成功:', response)

      // 格式化并存储用户信息
      const userInfo = {
        name: response.data.user?.nickname || '巡检员',
        role: '巡检员',
        avatarUrl: response.data.user?.avatar_url || '',
        id: response.data.user?.id,
        last_login_time: response.data.user?.last_login_time
      }

      // 存储token和用户信息
      wx.setStorageSync('token', response.data.token)
      wx.setStorageSync('userInfo', userInfo)

      // 跳转到首页
      wx.reLaunch({
        url: '/pages/index/index'
      })

    } catch (error) {
      console.error('登录失败:', error)
      console.error('错误详情:', error.message)
      // 设置自动登录为false，防止循环
      this.setData({ autoLogin: false })
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
}) 