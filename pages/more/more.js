Page({
  data: {
    searchKey: '',
    dateFilter: '',
    inspections: [],
    page: 1,
    isLoading: false,
    noMore: false,
    isRefreshing: false
  },

  onLoad() {
    // 立即加载初始数据
    this.loadInspections()
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKey: e.detail.value
    })
    this.debounceSearch()
  },

  // 防抖搜索
  debounceSearch: function() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
    this.searchTimer = setTimeout(() => {
      this.setData({ page: 1, inspections: [] })
      this.loadInspections()
    }, 500)
  },

  // 显示日期选择器
  showDatePicker() {
    wx.showPicker({
      mode: 'date',
      value: this.data.dateFilter || this.formatDate(new Date()),
      success: (res) => {
        this.setData({
          dateFilter: res.value,
          page: 1,
          inspections: []
        })
        this.loadInspections()
      }
    })
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 加载巡检记录
  loadInspections() {
    if (this.data.isLoading || this.data.noMore) return
    
    this.setData({ isLoading: true })
    
    // 模拟数据
    setTimeout(() => {
      const mockData = [
        {
          id: '001',
          name: '重庆解放碑万达广场',
          date: '2024-03-15 14:30',
          aiSummary: '现场秩序良好，设备运转正常，存在部分安全隐患需要处理。'
        },
        {
          id: '002',
          name: '南坪万达广场',
          date: '2024-03-14 10:15',
          aiSummary: '人流量适中，设备维护及时，无重大安全隐患。'
        },
        {
          id: '003',
          name: '观音桥步行街',
          date: '2024-03-13 16:45',
          aiSummary: '商户经营正常，卫生状况良好，建议加强消防设施检查。'
        }
      ]

      // 根据搜索关键词过滤
      let filteredData = mockData
      if (this.data.searchKey) {
        filteredData = mockData.filter(item => 
          item.name.includes(this.data.searchKey) || 
          item.aiSummary.includes(this.data.searchKey)
        )
      }

      // 根据日期过滤
      if (this.data.dateFilter) {
        filteredData = filteredData.filter(item => 
          item.date.startsWith(this.data.dateFilter)
        )
      }
      
      this.setData({
        inspections: this.data.page === 1 ? filteredData : [...this.data.inspections, ...filteredData],
        isLoading: false,
        noMore: true, // 模拟数据都加载完了
        isRefreshing: false
      })
    }, 500)
  },

  // 下拉刷新
  onRefresh() {
    this.setData({
      page: 1,
      inspections: [],
      noMore: false,
      isRefreshing: true
    })
    this.loadInspections()
  },

  // 上拉加载更多
  loadMore() {
    if (!this.data.noMore) {
      this.setData({ page: this.data.page + 1 })
      this.loadInspections()
    }
  },

  // 跳转到详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  }
}) 