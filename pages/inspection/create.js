const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    loading: false,
    formData: {
      title: '',
      summary: '',
      location: '',
      images: [],
      latitude: '',
      longitude: ''
    }
  },

  onLoad(options) {
    // 如果有 id，说明是编辑模式
    if (options.id) {
      this.loadInspectionData(options.id)
    } else {
      // 新建模式，获取当前位置
      this.getLocation()
    }
  },

  // 获取当前位置
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res
        this.setData({
          'formData.latitude': latitude,
          'formData.longitude': longitude
        })
        this.getLocationName(latitude, longitude)
      },
      fail: (error) => {
        console.error('获取位置失败:', error)
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        })
      }
    })
  },

  // 获取位置名称
  getLocationName(latitude, longitude) {
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=RLHBZ-WMPRP-Q3JDS-V2IQA-JNRFH-EJBHL`,
      success: (res) => {
        if (res.data.status === 0) {
          this.setData({
            'formData.location': res.data.result.address
          })
        }
      }
    })
  },

  // 手动选择位置
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'formData.location': res.name || res.address,
          'formData.latitude': res.latitude,
          'formData.longitude': res.longitude
        })
      }
    })
  },

  // 加载巡检数据（编辑模式）
  async loadInspectionData(id) {
    try {
      this.setData({ loading: true })
      const res = await api.getInspectionDetail(id)
      this.setData({
        formData: res.data
      })
    } catch (error) {
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 表单输入处理
  handleInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  // 选择图片
  async handleChooseImage() {
    try {
      const res = await wx.chooseImage({
        count: 9,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      
      const { images } = this.data.formData
      this.setData({
        'formData.images': [...images, ...res.tempFilePaths]
      })
    } catch (error) {
      console.error('选择图片失败:', error)
    }
  },

  // 删除图片
  handleDeleteImage(e) {
    const { index } = e.currentTarget.dataset
    const { images } = this.data.formData
    images.splice(index, 1)
    this.setData({
      'formData.images': images
    })
  },

  // 预览图片
  handlePreviewImage(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({
      current: url,
      urls: this.data.formData.images
    })
  },

  // 提交表单
  async handleSubmit() {
    try {
      const { formData } = this.data
      if (!formData.title.trim()) {
        wx.showToast({
          title: '请输入巡检名称',
          icon: 'none'
        })
        return
      }

      if (!formData.location.trim()) {
        wx.showToast({
          title: '请选择巡检地点',
          icon: 'none'
        })
        return
      }

      this.setData({ loading: true })
      const response = await api.createInspection(formData)
      
      if (!response.data || !response.data.id) {
        throw new Error('创建巡检失败：服务器返回数据格式错误')
      }
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      // 跳转到事件页面
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/event/index?inspectionId=${response.data.id}`,
          fail: (error) => {
            console.error('跳转到事件页面失败:', error)
            // 如果跳转失败，返回首页
            wx.switchTab({
              url: '/pages/index/index'
            })
          }
        })
      }, 1500)

    } catch (error) {
      console.error('保存失败:', error)
      wx.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
}) 