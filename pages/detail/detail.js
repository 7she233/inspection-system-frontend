Page({
  data: {
    inspection: null
  },

  onLoad(options) {
    const id = options.id
    this.getInspectionDetail(id)
  },

  // 获取巡检详情
  getInspectionDetail(id) {
    // TODO: API接口 - GET /api/inspections/:id
    // 模拟从服务器获取数据
    wx.showLoading({
      title: '加载中...'
    })

    // 模拟API请求
    setTimeout(() => {
      this.setData({
        inspection: {
          id: id,
          name: '重庆解放碑万达广场',
          date: '2024-03-15 14:30',
          aiSummary: '现场秩序良好，设备运转正常，存在部分安全隐患需要处理。',
          audioText: '今天对解放碑万达进行了例行巡检，整体情况良好。',
          audioUrl: 'https://example.com/audio/001.mp3',
          photos: [
            '/images/sample1.jpg',
            '/images/sample2.jpg',
            '/images/sample3.jpg',
            '/images/sample4.jpg',
            '/images/sample5.jpg',
            '/images/sample6.jpg'
          ]
        }
      })
      wx.hideLoading()
    }, 500)
  },

  // 音频控制相关方法
  onPlay() {
    console.log('开始播放')
  },

  onPause() {
    console.log('暂停播放')
  },

  onTimeUpdate(e) {
    console.log('播放进度更新', e.detail)
  },

  onEnded() {
    console.log('播放结束')
  },

  // 预览图片
  previewImage(e) {
    const current = e.currentTarget.dataset.url
    wx.previewImage({
      current,
      urls: this.data.inspection.photos
    })
  }
}) 