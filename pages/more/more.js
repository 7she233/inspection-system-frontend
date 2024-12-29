const api = require('../../services/api');
const { handleError } = require('../../utils/util');

Page({
  data: {
    inspections: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.loadInspections();
  },

  onPullDownRefresh() {
    this.setData({
      inspections: [],
      page: 1,
      hasMore: true
    }, () => {
      this.loadInspections();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadInspections();
    }
  },

  async loadInspections() {
    if (this.data.loading) return;

    try {
      this.setData({ loading: true });
      
      const response = await api.getInspections({
        page: this.data.page,
        page_size: this.data.pageSize,
        ordering: '-created_at'
      });

      console.log('获取到巡检列表:', response);
      
      // 处理返回的数据
      const inspections = response.data || [];
      const formattedInspections = inspections.map(item => ({
        id: item.id,
        name: item.title,
        date: item.created_at,
        status: item.status_display || '草稿',
        location: item.location
      }));

      // 如果返回的数据少于页面大小，说明没有更多数据了
      const hasMore = formattedInspections.length === this.data.pageSize;

      this.setData({
        inspections: [...this.data.inspections, ...formattedInspections],
        page: this.data.page + 1,
        hasMore
      });
    } catch (error) {
      console.error('加载巡检记录失败:', error);
      handleError(error, '加载巡检记录失败');
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/event/index?inspectionId=${id}`,
      fail: (error) => {
        console.error('跳转到事件页面失败:', error);
        handleError(new Error('页面跳转失败'));
      }
    });
  }
}); 