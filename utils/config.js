const config = {
  // 开发环境
  development: {
    baseURL: 'http://127.0.0.1:8000'
  },
  // 生产环境
  production: {
    baseURL: 'https://your-production-domain.com'
  }
};

export default config[process.env.NODE_ENV || 'development']; 