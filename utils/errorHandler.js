export function handleError(error) {
  const message = error.response?.data?.message || '服务器错误';
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  });
} 