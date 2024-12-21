const { savePhotoToLocal, deleteLocalPhoto } = require('../../utils/storage');
const { eventApi } = require('../../services/api');

Page({
  data: {
    isEdit: false,
    recording: false,
    voiceList: [],
    photos: [],
    description: '',
    manualDescription: '',
    aiAnalysis: '',
    inspectionId: '',
    uploadQueue: [] // 待上传的照片队列
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        isEdit: true,
        inspectionId: options.inspectionId || ''
      });
      this.loadEventData(options.id);
    } else if (options.inspectionId) {
      this.setData({
        inspectionId: options.inspectionId
      });
    }
  },

  // 拍照功能
  async takePhoto() {
    try {
      const res = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album']
      });

      const tempFilePath = res.tempFilePaths[0];
      
      // 保存到本地
      const savedPath = await savePhotoToLocal(tempFilePath, this.data.inspectionId);
      
      // 更新UI显示
      const photos = [...this.data.photos];
      photos.push(savedPath);
      
      // 添加到上传队列
      const uploadQueue = [...this.data.uploadQueue];
      uploadQueue.push(savedPath);

      this.setData({ 
        photos,
        uploadQueue
      });

      // 尝试上传（如果有网络的话）
      this.tryUploadPhotos();

    } catch (error) {
      wx.showToast({
        title: '保存照片失败',
        icon: 'none'
      });
    }
  },

  // 删除照片
  async deletePhoto(e) {
    const index = e.currentTarget.dataset.index;
    const localPath = this.data.photos[index];

    try {
      await deleteLocalPhoto(localPath, this.data.inspectionId);
      
      const photos = [...this.data.photos];
      photos.splice(index, 1);
      
      const uploadQueue = this.data.uploadQueue.filter(path => path !== localPath);
      
      this.setData({ 
        photos,
        uploadQueue
      });
    } catch (error) {
      wx.showToast({
        title: '删除照片失败',
        icon: 'none'
      });
    }
  },

  // 尝试上传照片
  async tryUploadPhotos() {
    const { uploadQueue } = this.data;
    if (uploadQueue.length === 0) return;

    // 检查网络状态
    const networkType = await wx.getNetworkType();
    if (networkType.networkType === 'none') return;

    // 开始上传
    wx.showLoading({ title: '正在上传...' });

    try {
      const uploadTasks = uploadQueue.map(localPath => 
        eventApi.uploadFile(localPath, 'photo')
      );

      const results = await Promise.allSettled(uploadTasks);
      
      // 处理上传结果
      const newUploadQueue = [];
      const successUrls = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successUrls.push({
            localPath: uploadQueue[index],
            serverUrl: result.value.url
          });
        } else {
          newUploadQueue.push(uploadQueue[index]);
        }
      });

      // 更新状态
      this.setData({
        uploadQueue: newUploadQueue
      });

      // 如果有上传失败的，提示用户
      if (newUploadQueue.length > 0) {
        wx.showToast({
          title: '部分照片上传失败，稍后将重试',
          icon: 'none'
        });
      }

    } catch (error) {
      console.error('上传照片失败:', error);
    } finally {
      wx.hideLoading();
    }
  },

  // 保存事件
  async saveEventPoint() {
    try {
      const { voiceList, photos, description, manualDescription, uploadQueue } = this.data;
      
      // 如果还有未上传的照片，提示用户
      if (uploadQueue.length > 0) {
        const confirmed = await wx.showModal({
          title: '提示',
          content: '有照片尚未上传完成，是否继续保存？',
          confirmText: '继续保存',
          cancelText: '等待上传'
        });
        
        if (!confirmed.confirm) return;
      }
      
      // 合并描述（手工输入优先）
      const finalDescription = manualDescription || description;
      
      if (!finalDescription && !photos.length && !voiceList.length) {
        wx.showToast({
          title: '请至少添加一项内容',
          icon: 'none'
        });
        return;
      }

      const eventData = {
        description: finalDescription,
        voiceList,
        photos,
        hasUnuploadedPhotos: uploadQueue.length > 0
      };

      // 返回上一页
      wx.navigateBack({
        success: () => {
          // 通知上一页更新
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2];
          if (prevPage && prevPage.onEventUpdated) {
            prevPage.onEventUpdated(eventData);
          }
        }
      });
      
    } catch (error) {
      wx.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      });
    }
  },

  onShow() {
    // 页面显示时尝试上传未完成的照片
    this.tryUploadPhotos();
  },

  // 新增：处理手工输入
  onDescriptionInput(e) {
    this.setData({
      manualDescription: e.detail.value
    });
  },

  // 其他现有方法保持不变...
}); 