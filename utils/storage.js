const LOCAL_STORAGE_KEYS = {
  PHOTOS: 'LOCAL_PHOTOS',
  INSPECTION_PHOTOS: 'INSPECTION_PHOTOS_'
};

// 生成唯一的文件名
const generateUniqueFileName = (originalPath) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const extension = originalPath.split('.').pop();
  return `${timestamp}_${random}.${extension}`;
};

// 保存照片到本地
const savePhotoToLocal = async (tempFilePath, inspectionId) => {
  try {
    // 生成唯一文件名
    const fileName = generateUniqueFileName(tempFilePath);
    
    // 保存到本地文件系统
    const savedFilePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
    await wx.saveFile({
      tempFilePath: tempFilePath,
      filePath: savedFilePath
    });

    // 更新本地存储记录
    const key = inspectionId ? 
      `${LOCAL_STORAGE_KEYS.INSPECTION_PHOTOS}${inspectionId}` : 
      LOCAL_STORAGE_KEYS.PHOTOS;
    
    const storedPhotos = wx.getStorageSync(key) || [];
    storedPhotos.push({
      localPath: savedFilePath,
      originalPath: tempFilePath,
      fileName: fileName,
      timestamp: Date.now(),
      uploaded: false
    });
    
    wx.setStorageSync(key, storedPhotos);
    return savedFilePath;
  } catch (error) {
    console.error('保存照片到本地失败:', error);
    throw error;
  }
};

// 从本地获取照片列表
const getLocalPhotos = (inspectionId) => {
  const key = inspectionId ? 
    `${LOCAL_STORAGE_KEYS.INSPECTION_PHOTOS}${inspectionId}` : 
    LOCAL_STORAGE_KEYS.PHOTOS;
  return wx.getStorageSync(key) || [];
};

// 标记照片已上传
const markPhotoAsUploaded = (localPath, inspectionId, serverUrl) => {
  const key = inspectionId ? 
    `${LOCAL_STORAGE_KEYS.INSPECTION_PHOTOS}${inspectionId}` : 
    LOCAL_STORAGE_KEYS.PHOTOS;
  
  const storedPhotos = wx.getStorageSync(key) || [];
  const updatedPhotos = storedPhotos.map(photo => {
    if (photo.localPath === localPath) {
      return { ...photo, uploaded: true, serverUrl };
    }
    return photo;
  });
  
  wx.setStorageSync(key, updatedPhotos);
};

// 删除本地照片
const deleteLocalPhoto = async (localPath, inspectionId) => {
  try {
    // 从文件系统删除
    await wx.removeSavedFile({
      filePath: localPath
    });

    // 从存储记录中删除
    const key = inspectionId ? 
      `${LOCAL_STORAGE_KEYS.INSPECTION_PHOTOS}${inspectionId}` : 
      LOCAL_STORAGE_KEYS.PHOTOS;
    
    const storedPhotos = wx.getStorageSync(key) || [];
    const updatedPhotos = storedPhotos.filter(photo => photo.localPath !== localPath);
    wx.setStorageSync(key, updatedPhotos);
  } catch (error) {
    console.error('删除本地照片失败:', error);
    throw error;
  }
};

// 清理过期的本地照片（可选）
const cleanupExpiredPhotos = async (expirationDays = 30) => {
  try {
    const now = Date.now();
    const expirationTime = now - (expirationDays * 24 * 60 * 60 * 1000);

    // 获取所有存储的照片
    const allKeys = wx.getStorageInfoSync().keys;
    const photoKeys = allKeys.filter(key => 
      key === LOCAL_STORAGE_KEYS.PHOTOS || 
      key.startsWith(LOCAL_STORAGE_KEYS.INSPECTION_PHOTOS)
    );

    for (const key of photoKeys) {
      const storedPhotos = wx.getStorageSync(key) || [];
      const validPhotos = [];

      for (const photo of storedPhotos) {
        if (photo.timestamp < expirationTime) {
          // 删除过期的照片文件
          try {
            await wx.removeSavedFile({
              filePath: photo.localPath
            });
          } catch (e) {
            console.warn('删除过期照片失败:', e);
          }
        } else {
          validPhotos.push(photo);
        }
      }

      if (validPhotos.length !== storedPhotos.length) {
        wx.setStorageSync(key, validPhotos);
      }
    }
  } catch (error) {
    console.error('清理过期照片失败:', error);
  }
};

module.exports = {
  savePhotoToLocal,
  getLocalPhotos,
  markPhotoAsUploaded,
  deleteLocalPhoto,
  cleanupExpiredPhotos
}; 