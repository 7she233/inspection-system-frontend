Page({
  data: {
    isEdit: false,
    name: '',
    location: '',
    manualLocation: '',
    eventPoints: [],
    latitude: '',
    longitude: '',
    createTime: ''
  },

  onLoad(options) {
    if (options.id) {
      // 编辑模式
      this.setData({ isEdit: true })
      this.loadInspectionDetail(options.id)
    } else {
      // 新建模式
      this.getLocation()
      this.setData({
        createTime: new Date().toLocaleString()
      })
    }
  },

  // 加载巡检详情
  async loadInspectionDetail(id) {
    wx.showLoading({ title: '加载中...' })
    try {
      // TODO: 调用获取详情API
      // 模拟数据
      const detail = {
        id: id,
        name: '重庆解放碑万达广场巡检',
        location: '重庆市渝中区解放碑步行街88号',
        latitude: '29.557156',
        longitude: '106.577114',
        createTime: '2024-03-15 14:30',
        eventPoints: [
          {
            id: '1',
            description: '发现安全隐患：消防通道堵塞',
            createTime: '2024-03-15 14:35',
            photos: ['/assets/mock/photo1.jpg'],
            voiceList: [
              {
                url: '/assets/mock/voice1.mp3',
                duration: 15,
                text: '消防通道被商户堆放物品堵塞，存在安全隐患'
              }
            ],
            status: '已记录',
            aiAnalysis: '建议立即清理消防通道，确保安全通行'
          }
        ]
      }

      this.setData({
        ...detail
      })
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 获取当前位置
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res
        this.setData({ latitude, longitude })
        this.getLocationName(latitude, longitude)
      },
      fail: () => {
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        })
      }
    })
  },

  // 手动选择位置
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: res.name || res.address,
          latitude: res.latitude,
          longitude: res.longitude
        })
      }
    })
  },

  // 手动输入位置
  onLocationInput(e) {
    this.setData({
      manualLocation: e.detail.value
    })
  },

  // 确认手动输入
  onLocationBlur(e) {
    this.setData({
      location: e.detail.value
    })
  },

  // 巡检名称输入
  onNameInput(e) {
    this.setData({
      name: e.detail.value
    })
  },

  // 获取位置名称
  getLocationName(latitude, longitude) {
    // 调用微信地图API获取位置名称
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=YOUR_KEY`,
      success: (res) => {
        if (res.data.status === 0) {
          this.setData({
            location: res.data.result.address
          })
        }
      }
    })
  },

  // 创建事件点
  createEventPoint() {
    if (!this.data.name) {
      wx.showToast({
        title: '请先输入巡检名称',
        icon: 'none'
      })
      return
    }

    if (!this.data.location && !this.data.manualLocation) {
      wx.showToast({
        title: '请选择或输入位置',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: '/pages/event/create',
      events: {
        // 监听事件点创建完成
        eventPointCreated: (eventPoint) => {
          const eventPoints = this.data.eventPoints.concat({
            ...eventPoint,
            status: '已记录'
          })
          this.setData({ eventPoints })
        }
      }
    })
  },

  // 编辑事件点
  editEventPoint(e) {
    const index = e.currentTarget.dataset.index
    const eventPoint = this.data.eventPoints[index]
    
    wx.navigateTo({
      url: '/pages/event/create',
      events: {
        // 监听事件点更新
        eventPointCreated: (updatedEventPoint) => {
          const eventPoints = [...this.data.eventPoints]
          eventPoints[index] = {
            ...eventPoint,
            ...updatedEventPoint,
            status: '已更新'
          }
          this.setData({ eventPoints })
        }
      },
      success: (res) => {
        // 传递现有事件点数据
        res.eventChannel.emit('editEventPoint', eventPoint)
      }
    })
  },

  // 保存巡检
  async saveInspection() {
    if (!this.data.name) {
      wx.showToast({
        title: '请输入巡检名称',
        icon: 'none'
      })
      return
    }

    if (!this.data.location && !this.data.manualLocation) {
      wx.showToast({
        title: '请选择或输入位置',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '保存中...' })
    try {
      const inspection = {
        name: this.data.name,
        location: this.data.location || this.data.manualLocation,
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        eventPoints: this.data.eventPoints,
        createTime: this.data.createTime
      }
      
      // TODO: 调用保存API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      wx.navigateBack({
        success: () => {
          wx.showToast({
            title: this.data.isEdit ? '更新成功' : '保存成功',
            icon: 'success'
          })
        }
      })
    } catch (error) {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  }
}) 