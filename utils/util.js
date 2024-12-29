// 日期格式化
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hour = d.getHours().toString().padStart(2, '0');
  const minute = d.getMinutes().toString().padStart(2, '0');
  const second = d.getSeconds().toString().padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
};

// 文件大小格式化
const formatFileSize = (size) => {
  if (size < 1024) {
    return size + 'B';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + 'KB';
  } else {
    return (size / (1024 * 1024)).toFixed(2) + 'MB';
  }
};

// 防抖函数
const debounce = (fn, delay = 500) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// 节流函数
const throttle = (fn, delay = 500) => {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last > delay) {
      fn.apply(this, args);
      last = now;
    }
  };
};

// 检查文件类型
const checkFileType = (filePath, allowTypes = []) => {
  const fileType = filePath.split('.').pop().toLowerCase();
  return allowTypes.includes(fileType);
};

// 检查网络状态
const checkNetworkStatus = () => {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        resolve(res.networkType !== 'none');
      },
      fail: () => {
        resolve(false);
      }
    });
  });
};

// 统一错误处理
const handleError = (error, defaultMessage = '操作失败') => {
  wx.showToast({
    title: error.message || defaultMessage,
    icon: 'none',
    duration: 2000
  });
};

// 修改为小程序支持的导出方式
module.exports = {
  formatDate,
  formatFileSize,
  debounce,
  throttle,
  checkFileType,
  checkNetworkStatus,
  handleError
}; 